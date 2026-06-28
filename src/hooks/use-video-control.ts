import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
  VideoControlAction,
  VideoControlCommand,
  VideoStateUpdate,
  VIDEO_CONTROL_EVENT,
  VIDEO_STATE_UPDATE_EVENT,
  PRESENTER_VIDEO_CONTROL_EVENT,
  VIDEO_BROADCAST_CHANNEL,
  VIDEO_STATE_BROADCAST_CHANNEL,
} from "@/types/video-control";

/**
 * Video sync model:
 * - Control commands flow presenter -> all videos over a same-window CustomEvent (preview),
 *   a cross-window BroadcastChannel (audience), and Tauri (recovery/fallback).
 * - The PREVIEW-PANEL video (in the main window, next to the controls) is the authoritative
 *   clock for the presenter UI: it broadcasts playback state on `video-state`, which the
 *   controller (same window) consumes. This keeps the seek bar working even on a single monitor
 *   when the audience window is closed.
 * - The audience window is a command mirror; it recovers the last play/pause command on mount.
 */

// ===== Presenter side =====

export interface VideoController {
  /** Latest authoritative state reported by the preview video (null until first update). */
  videoState: VideoStateUpdate | null;
  /** Whether the active background video is currently paused. */
  isPaused: boolean;
  /** True once the preview video reports usable state (or after a short safety timeout). */
  controlsAllowed: boolean;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

/**
 * Presenter-side controller: sends commands and tracks authoritative playback state broadcast by
 * the preview video. Used by the preview-panel controls in the main window.
 */
export const useVideoController = ({
  slideId,
}: {
  slideId: string | null;
}): VideoController => {
  const [videoState, setVideoState] = useState<VideoStateUpdate | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [controlsAllowed, setControlsAllowed] = useState(false);
  const controlChannelRef = useRef<BroadcastChannel | null>(null);
  // Keep a ref to the latest state so skip math reads fresh values without re-creating callbacks.
  const videoStateRef = useRef<VideoStateUpdate | null>(null);
  videoStateRef.current = videoState;

  // Open the control BroadcastChannel once.
  useEffect(() => {
    const channel = new BroadcastChannel(VIDEO_BROADCAST_CHANNEL);
    controlChannelRef.current = channel;
    return () => {
      channel.close();
      controlChannelRef.current = null;
    };
  }, []);

  // Subscribe to authoritative state updates from the preview video.
  useEffect(() => {
    if (!slideId) {
      setVideoState(null);
      return;
    }

    const applyState = (state: VideoStateUpdate) => {
      if (state.slideId !== slideId) return;
      setVideoState(state);
      setIsPaused(state.paused);
      // The preview video is alive and reporting -> controls are usable.
      setControlsAllowed(true);
    };

    const stateChannel = new BroadcastChannel(VIDEO_STATE_BROADCAST_CHANNEL);
    stateChannel.onmessage = (event: MessageEvent<VideoStateUpdate>) =>
      applyState(event.data);

    const unlisten = listen<VideoStateUpdate>(
      VIDEO_STATE_UPDATE_EVENT,
      (event) => applyState(event.payload)
    );

    return () => {
      stateChannel.close();
      unlisten.then((fn) => fn());
    };
  }, [slideId]);

  // On slide change: recover the last play/pause command and arm a safety timeout so the
  // operator is never locked out if the preview video fails to report (e.g. a bad file).
  useEffect(() => {
    if (!slideId) {
      setControlsAllowed(false);
      setIsPaused(true);
      return;
    }

    setControlsAllowed(false);

    invoke<{ slideId: string; action: string } | null>("get_last_video_control")
      .then((last) => {
        if (last?.slideId === slideId) setIsPaused(last.action === "pause");
      })
      .catch(() => {});

    const fallback = window.setTimeout(() => setControlsAllowed(true), 2000);

    return () => {
      clearTimeout(fallback);
    };
  }, [slideId]);

  const sendCommand = useCallback(
    (action: VideoControlAction, value?: number) => {
      if (!slideId) return;
      const cmd: VideoControlCommand = { slideId, action, value };

      // 1. Same-window CustomEvent (preview panel keeps the user gesture for video.play()).
      window.dispatchEvent(
        new CustomEvent(PRESENTER_VIDEO_CONTROL_EVENT, { detail: cmd })
      );
      // 2. Cross-window BroadcastChannel (audience window, no IPC round-trip).
      controlChannelRef.current?.postMessage(cmd);
      // 3. Tauri (persists play/pause for recovery + delivery fallback).
      invoke("video_control_command", {
        payload: { slideId, action, value },
      }).catch((err) => console.error("video_control_command failed:", err));
    },
    [slideId]
  );

  const play = useCallback(() => {
    setIsPaused(false);
    sendCommand("play");
  }, [sendCommand]);

  const pause = useCallback(() => {
    setIsPaused(true);
    sendCommand("pause");
  }, [sendCommand]);

  const togglePlayPause = useCallback(() => {
    if (isPaused) play();
    else pause();
  }, [isPaused, play, pause]);

  const seek = useCallback(
    (time: number) => {
      sendCommand("seek", time);
    },
    [sendCommand]
  );

  // Skips are converted to absolute seeks so the triple-channel delivery stays idempotent
  // (a relative "skip 10s" delivered three times would skip 30s).
  const skipForward = useCallback(
    (seconds: number = 10) => {
      const state = videoStateRef.current;
      if (!state) return;
      seek(Math.min(state.currentTime + seconds, state.duration || Infinity));
    },
    [seek]
  );

  const skipBackward = useCallback(
    (seconds: number = 10) => {
      const state = videoStateRef.current;
      if (!state) return;
      seek(Math.max(state.currentTime - seconds, 0));
    },
    [seek]
  );

  const setVolume = useCallback(
    (volume: number) => sendCommand("volume", Math.max(0, Math.min(1, volume))),
    [sendCommand]
  );

  const setPlaybackRate = useCallback(
    (rate: number) => sendCommand("rate", rate),
    [sendCommand]
  );

  return {
    videoState,
    isPaused,
    controlsAllowed,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    setPlaybackRate,
  };
};

// ===== Audience / preview side =====

const buildStateUpdate = (
  video: HTMLVideoElement,
  slideId: string
): VideoStateUpdate => {
  const buffered =
    video.buffered.length > 0 && video.duration > 0
      ? (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
      : 0;

  return {
    slideId,
    currentTime: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    paused: video.paused,
    volume: video.volume,
    loop: video.loop,
    playbackRate: video.playbackRate,
    buffered: Number.isNaN(buffered) ? 0 : buffered,
    readyState: video.readyState,
    error: video.error ? video.error.message : null,
    seeking: video.seeking,
    updatedAt: Date.now(),
  };
};

/**
 * Applies incoming control commands to the given `<video>` element (mirrors on both the audience
 * window and the in-window preview). When `broadcastState` is set (the preview video), it also
 * broadcasts playback state back to the presenter controls.
 */
export const useAudienceVideoSync = ({
  videoRef,
  slideId,
  enabled,
  broadcastState,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  slideId: string;
  enabled: boolean;
  broadcastState: boolean;
}) => {
  // Apply control commands to the local video element.
  useEffect(() => {
    if (!enabled) return;

    const apply = (cmd: VideoControlCommand) => {
      const video = videoRef.current;
      if (!video || cmd.slideId !== slideId) return;

      switch (cmd.action) {
        case "play":
          video.loop = true;
          video.play().catch(() => {});
          break;
        case "pause":
          video.pause();
          break;
        case "seek":
          if (cmd.value !== undefined) video.currentTime = cmd.value;
          break;
        case "volume":
          if (cmd.value !== undefined)
            video.volume = Math.max(0, Math.min(1, cmd.value));
          break;
        case "rate":
          if (cmd.value !== undefined) video.playbackRate = cmd.value;
          break;
        // skip_forward/backward are sent as absolute seeks by the controller; nothing to do here.
        default:
          break;
      }
    };

    const channel = new BroadcastChannel(VIDEO_BROADCAST_CHANNEL);
    channel.onmessage = (event: MessageEvent<VideoControlCommand>) =>
      apply(event.data);

    const onLocalEvent = (e: Event) => {
      const detail = (e as CustomEvent<VideoControlCommand>).detail;
      if (detail) apply(detail);
    };
    window.addEventListener(PRESENTER_VIDEO_CONTROL_EVENT, onLocalEvent);

    const unlisten = listen<VideoControlCommand>(VIDEO_CONTROL_EVENT, (event) =>
      apply(event.payload)
    );

    // Recover the last play/pause command on mount and when the window becomes visible
    // (e.g. the audience window is opened mid-playback).
    const syncFromBackend = () => {
      invoke<{ slideId: string; action: string } | null>(
        "get_last_video_control"
      )
        .then((last) => {
          if (last?.slideId === slideId)
            apply({ slideId, action: last.action as VideoControlAction });
        })
        .catch(() => {});
    };
    syncFromBackend();

    const onVisibility = () => {
      if (document.visibilityState === "visible") syncFromBackend();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      channel.close();
      window.removeEventListener(PRESENTER_VIDEO_CONTROL_EVENT, onLocalEvent);
      unlisten.then((fn) => fn());
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, slideId, videoRef]);

  // Authoritative (preview) video: broadcast playback state to the presenter controls.
  useEffect(() => {
    if (!enabled || !broadcastState) return;

    const stateChannel = new BroadcastChannel(VIDEO_STATE_BROADCAST_CHANNEL);

    const emitState = () => {
      const video = videoRef.current;
      if (!video) return;
      stateChannel.postMessage(buildStateUpdate(video, slideId));
    };

    const video = videoRef.current;

    // Native timeupdate (~4Hz) is the base clock; the presenter interpolates between ticks.
    if (video) {
      const events = [
        "timeupdate",
        "play",
        "playing",
        "pause",
        "seeking",
        "seeked",
        "ratechange",
        "volumechange",
        "loadedmetadata",
        "canplay",
        "durationchange",
        "error",
      ];
      events.forEach((evt) => video.addEventListener(evt, emitState));

      // Report current state immediately so the controls/slider initialise without waiting.
      emitState();

      return () => {
        events.forEach((evt) => video.removeEventListener(evt, emitState));
        stateChannel.close();
      };
    }

    return () => {
      stateChannel.close();
    };
  }, [enabled, broadcastState, slideId, videoRef]);
};
