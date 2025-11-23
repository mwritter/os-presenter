import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import {
  VideoControlCommand,
  VideoStateUpdate,
  VideoReadyPayload,
  VideoAckPayload,
  VIDEO_CONTROL_EVENT,
  VIDEO_STATE_UPDATE_EVENT,
  VIDEO_READY_EVENT,
  VIDEO_ACK_EVENT,
} from "@/types/video-control";
import { useIsAudienceRoute } from "./use-is-audience-route";

interface UseVideoSyncOptions {
  slideId: string;
  isActive: boolean; // Only sync when this slide is active
  videoType: "background" | "object"; // Type of video for handshake logic
}

/**
 * Hook for audience view to sync video playback with presenter controls
 * Returns a ref to attach to the video element
 */
export const useVideoSync = ({
  slideId,
  isActive,
  videoType,
}: UseVideoSyncOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stateUpdateIntervalRef = useRef<number | null>(null);
  const [hasReceivedAck, setHasReceivedAck] = useState(false);
  const [videoAttached, setVideoAttached] = useState(0);
  const hasSentReadySignal = useRef<boolean>(false);
  const isBackgroundVideo = videoType === "background";
  const isAudienceRoute = useIsAudienceRoute();

  // Reset ready signal flag and ack state when slide changes
  useEffect(() => {
    hasSentReadySignal.current = false;
    setHasReceivedAck(false);
  }, [slideId]);

  // Poll for video element being attached
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (videoRef.current) {
        console.log("Video element detected via polling");
        setVideoAttached((prev) => prev + 1);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, slideId]);

  // Send video ready signal to presenter (for handshake)
  const sendVideoReady = () => {
    // Only send ready signal if we're on the audience route
    if (!isAudienceRoute) {
      console.log("Skipping ready signal - not on audience route");
      return;
    }

    if (hasSentReadySignal.current) {
      console.log("Already sent ready signal, skipping");
      return;
    }

    console.log("Sending VIDEO_READY_EVENT", { slideId, videoType });
    hasSentReadySignal.current = true;

    const payload: VideoReadyPayload = {
      slideId,
      videoType,
    };

    emit(VIDEO_READY_EVENT, payload).catch((error) => {
      console.error("Failed to emit video ready event:", error);
    });
  };

  // Send video state updates to presenter
  const sendStateUpdate = () => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    const buffered =
      video.buffered.length > 0
        ? (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        : 0;

    const state: VideoStateUpdate = {
      slideId,
      currentTime: video.currentTime,
      duration: video.duration || 0,
      paused: video.paused,
      volume: video.volume,
      loop: video.loop,
      playbackRate: video.playbackRate,
      buffered: isNaN(buffered) ? 0 : buffered,
      readyState: video.readyState,
      error: video.error ? video.error.message : null,
      seeking: video.seeking,
    };

    emit(VIDEO_STATE_UPDATE_EVENT, state).catch((error) => {
      console.error("Failed to emit video state update:", error);
    });
  };

  // Listen for acknowledgment from presenter (handshake)
  useEffect(() => {
    const autoStartVideo = () => {
      const video = videoRef.current;
      if (video) {
        video.play().catch((error) => {
          console.error("Failed to auto-play video after ack:", error);
        });
      }
    };

    if (!isActive || !isBackgroundVideo || !isAudienceRoute) {
      // If not on audience route, skip handshake and mark as "received"
      if (
        !isAudienceRoute &&
        isActive &&
        isBackgroundVideo &&
        !hasReceivedAck
      ) {
        console.log(
          "Skipping handshake - not on audience route, setting ack to true"
        );
        setHasReceivedAck(true);
        autoStartVideo();
      }
      return;
    }

    const unlisten = listen<VideoAckPayload>(VIDEO_ACK_EVENT, (event) => {
      const payload = event.payload;

      // Only handle acks for this slide
      if (payload.slideId !== slideId) return;

      console.log("Received video acknowledgment from presenter");
      setHasReceivedAck(true);

      // Auto-play the video now that we have acknowledgment
      autoStartVideo();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [slideId, isActive, isBackgroundVideo, isAudienceRoute, hasReceivedAck]);

  // Handle video control commands from presenter
  useEffect(() => {
    if (!isActive) return;

    const unlisten = listen<VideoControlCommand>(
      VIDEO_CONTROL_EVENT,
      (event) => {
        const command = event.payload;
        const video = videoRef.current;

        // Only handle commands for this slide
        if (command.slideId !== slideId || !video) return;

        // For background videos on audience route, only allow play commands after receiving ack
        if (
          isAudienceRoute &&
          isBackgroundVideo &&
          command.action === "play" &&
          !hasReceivedAck
        ) {
          console.log("Ignoring play command - waiting for handshake");
          return;
        }

        switch (command.action) {
          case "play":
            console.log("playing video");
            video.play().catch((error) => {
              console.error("Failed to play video:", error);
            });
            video.loop = true;
            break;
          case "pause":
            console.log("pausing video");
            video.pause();
            video.loop = false;
            break;
          case "seek":
            if (command.value !== undefined) {
              video.currentTime = command.value;
            }
            break;
          case "volume":
            if (command.value !== undefined) {
              video.volume = Math.max(0, Math.min(1, command.value));
            }
            break;
          case "rate":
            if (command.value !== undefined) {
              video.playbackRate = command.value;
            }
            break;
        }

        // Send immediate state update after command
        sendStateUpdate();
      }
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [slideId, isActive, isBackgroundVideo, hasReceivedAck, isAudienceRoute]);

  // Setup state update interval and video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) {
      console.log("Skipping event listener setup", {
        hasVideo: !!video,
        isActive,
      });
      return;
    }

    console.log("Setting up video event listeners", {
      slideId,
      isBackgroundVideo,
      readyState: video.readyState,
      currentTime: video.currentTime,
    });

    // Set initial loop state to true (can be controlled dynamically via commands)
    video.loop = true;

    // Check if video is already ready (readyState >= 3 means HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA)
    // If so, send ready signal immediately for background videos (only on audience route)
    if (
      isBackgroundVideo &&
      !hasReceivedAck &&
      !hasSentReadySignal.current &&
      video.readyState >= 3
    ) {
      console.log("Video already ready - sending handshake signal immediately");
      sendVideoReady(); // This will check isAudienceRoute internally
    }

    // Send state updates periodically while playing (every ~16ms for smooth 60fps updates)
    const startStateUpdates = () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
      stateUpdateIntervalRef.current = window.setInterval(sendStateUpdate, 16);
    };

    const stopStateUpdates = () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
        stateUpdateIntervalRef.current = null;
      }
    };

    // Event listeners
    const handlePlay = () => {
      startStateUpdates();
      sendStateUpdate();
    };

    const handlePlaying = () => {
      startStateUpdates();
      sendStateUpdate();
    };

    const handlePause = () => {
      stopStateUpdates();
      sendStateUpdate();
    };

    const handleSeeking = () => sendStateUpdate();
    const handleSeeked = () => sendStateUpdate();
    const handleVolumeChange = () => sendStateUpdate();
    const handleRateChange = () => sendStateUpdate();
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded", {
        isBackgroundVideo,
        hasReceivedAck,
      });
      sendStateUpdate();
    };
    const handleCanPlay = () => {
      console.log("Video can play", {
        isBackgroundVideo,
        hasReceivedAck,
        hasSentReady: hasSentReadySignal.current,
        slideId,
        isAudienceRoute,
      });
      sendStateUpdate();
      // For background videos on audience route, emit ready signal and wait for ack before playing
      if (isBackgroundVideo && !hasReceivedAck && !hasSentReadySignal.current) {
        console.log("Video ready - sending handshake signal to presenter", {
          slideId,
          videoType,
          isAudienceRoute,
        });
        sendVideoReady(); // This will check isAudienceRoute internally
      }
    };
    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      console.error("Video error:", video.error);
      sendStateUpdate();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Send initial state
    sendStateUpdate();

    // Start updates if video is already playing
    if (!video.paused) {
      startStateUpdates();
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      stopStateUpdates();
    };
  }, [
    isActive,
    isBackgroundVideo,
    hasReceivedAck,
    slideId,
    videoType,
    videoAttached,
    isAudienceRoute,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
    };
  }, []);

  return videoRef;
};
