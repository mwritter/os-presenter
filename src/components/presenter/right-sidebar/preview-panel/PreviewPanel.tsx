"use client";
import { AudienceSlide } from "@/components/audiance/slide/AudienceSlide";
import { Button, ButtonProps } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSelectionStore } from "@/stores/presenterStore";
import {
  File,
  Image,
  Layers,
  Megaphone,
  Music,
  Play,
  Pause,
  Send,
  SkipBack,
  SkipForward,
  Video,
} from "lucide-react";
import { DEFAULT_CANVAS_PRESET } from "@/consts/canvas";
import { CanvasSize } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import { Label } from "@/components/ui/label";
import { useVideoState } from "@/hooks/use-video-state";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const PreviewPanel = () => {
  const activeSlide = useSelectionStore((s) => s.activeSlide);
  const clearActiveSlide = useSelectionStore((s) => s.clearActiveSlide);

  const slideData: SlideData = activeSlide?.data || {
    id: "",
    objects: [],
    backgroundColor: "black",
  };
  const canvasSize: CanvasSize =
    activeSlide?.canvasSize || DEFAULT_CANVAS_PRESET.value;

  // Check if active slide has a background video
  const hasBackgroundVideo = activeSlide?.data.objects?.some(
    (obj) => obj.type === "video" && obj.videoType === "background"
  );

  const slideIdForVideoState = hasBackgroundVideo ? slideData.id : null;

  // Use video state hook for controlling audience video
  const videoState = useVideoState({
    slideId: slideIdForVideoState,
  });

  const handleClearSlide = () => {
    clearActiveSlide();
  };

  return (
    <>
      <div
        key={activeSlide?.id || "preview-panel"}
        className="flex flex-col h-full w-full max-h-[250px] border-b border-black bg-shade-2 gap-2"
      >
        <div className="relative h-full w-full overflow-hidden">
          <AudienceSlide data={slideData} canvasSize={canvasSize} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <Label className="text-xs!">Clear Items</Label>
            <Button variant="outline" className="text-xs! h-min">
              Clear to Logo
            </Button>
          </div>
          <div className="flex-1 flex items-center">
            <PreviewPanelClearButton>
              <Music className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton>
              <Send className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton>
              <Layers className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton>
              <Megaphone className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton onClick={handleClearSlide}>
              <File className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton>
              <Image className="size-4" />
            </PreviewPanelClearButton>
            <PreviewPanelClearButton>
              <Video className="size-4" />
            </PreviewPanelClearButton>
          </div>
        </div>
      </div>
      <PreviewPanelVideoControls
        videoState={videoState.videoState}
        hasBackgroundVideo={hasBackgroundVideo || false}
        onPlay={videoState.play}
        onPause={videoState.pause}
        onPlayPause={videoState.togglePlayPause}
        onSeek={videoState.seek}
        onSkipForward={() => videoState.skipForward(10)}
        onSkipBackward={() => videoState.skipBackward(10)}
      />
    </>
  );
};

const PreviewPanelClearButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex-1 rounded-none not-disabled:bg-red-800/50 not-disabled:hover:bg-red-800/70! border"
      disabled={props.onClick === undefined}
      {...props}
    >
      {children}
    </Button>
  );
};

interface PreviewPanelVideoControlsProps {
  videoState: ReturnType<typeof useVideoState>["videoState"];
  hasBackgroundVideo: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}

const PreviewPanelVideoControls = ({
  videoState,
  hasBackgroundVideo,
  onPlay,
  onPause,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
}: PreviewPanelVideoControlsProps) => {
  const currentTime = videoState?.currentTime || 0;
  const duration = videoState?.duration || 0;
  const isPaused = videoState?.paused ?? true;
  const playbackRate = videoState?.playbackRate || 1;

  // Controls are enabled if we have a background video AND we've received video state (duration > 0)
  const [isEnabled, setIsEnabled] = useState(hasBackgroundVideo);
  useEffect(() => {
    setIsEnabled(hasBackgroundVideo);
  }, [hasBackgroundVideo, videoState]);

  // Track whether video was playing when dragging started
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Smooth interpolation for display time using requestAnimationFrame
  const [displayTime, setDisplayTime] = useState(currentTime);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const baseTimeRef = useRef<number>(currentTime);
  const lastPausedStateRef = useRef<boolean>(isPaused);

  // Update base time strategically to avoid jumps
  useEffect(() => {
    const now = performance.now();
    const elapsed = (now - lastUpdateTimeRef.current) / 1000;
    const interpolatedTime = baseTimeRef.current + elapsed * playbackRate;
    const timeDifference = Math.abs(currentTime - interpolatedTime);

    // Update base time only if:
    // 1. Video is paused or dragging (need exact sync)
    // 2. Play state changed (was paused, now playing or vice versa)
    // 3. Time difference is significant (> 0.5s, likely a seek or buffering)
    const playStateChanged = lastPausedStateRef.current !== isPaused;
    const needsSync =
      isPaused || isDragging || playStateChanged || timeDifference > 0.5;

    if (needsSync) {
      baseTimeRef.current = currentTime;
      lastUpdateTimeRef.current = now;
      setDisplayTime(currentTime);
    }

    lastPausedStateRef.current = isPaused;
  }, [currentTime, isPaused, isDragging, playbackRate]);

  // Smooth interpolation loop when playing
  useEffect(() => {
    if (isPaused || isDragging || !isEnabled) {
      return;
    }

    let animationFrameId: number;

    const updateDisplayTime = () => {
      const now = performance.now();
      const elapsed = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      const interpolatedTime = baseTimeRef.current + elapsed * playbackRate;

      // Clamp to duration
      const clampedTime = Math.min(interpolatedTime, duration);
      setDisplayTime(clampedTime);

      animationFrameId = requestAnimationFrame(updateDisplayTime);
    };

    animationFrameId = requestAnimationFrame(updateDisplayTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, isDragging, isEnabled, playbackRate, duration]);

  // Handle visibility/focus changes (when switching apps/tabs)
  useEffect(() => {
    const resyncInterpolation = () => {
      if (!isPaused && isEnabled) {
        // Window became visible/focused and video is playing - resync interpolation
        baseTimeRef.current = currentTime;
        lastUpdateTimeRef.current = performance.now();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resyncInterpolation();
      }
    };

    const handleFocus = () => {
      resyncInterpolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentTime, isPaused, isEnabled]);

  const handleSliderChange = (values: number[]) => {
    const [value] = values;

    if (value !== undefined && isEnabled) {
      // On first drag, remember if video was playing and pause it
      if (!isDragging) {
        setWasPlayingBeforeDrag(!isPaused);
        if (!isPaused) {
          onPause();
        }
        setIsDragging(true);
      }

      onSeek(value);
    }
  };

  const handleSliderCommit = (values: number[]) => {
    if (values[0] !== undefined && isEnabled) {
      setIsDragging(false);

      // If video was playing before drag, resume playback
      if (wasPlayingBeforeDrag) {
        onPlay();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${centiseconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col py-10 bg-shade-2">
      <div className="w-full max-w-[90%] mx-auto flex flex-col gap-1">
        <Slider
          className="w-full"
          hideThumb={!isEnabled}
          disabled={!isEnabled}
          value={[isEnabled ? displayTime : 0]}
          max={duration > 0 ? duration : 100}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
        />
        <div
          className={cn(
            "flex justify-between text-xs text-muted-foreground px-1",
            {
              "opacity-0": !isEnabled,
            }
          )}
        >
          <span>{formatTime(displayTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={!isEnabled}
          onClick={onSkipBackward}
        >
          <SkipBack className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!isEnabled}
          onClick={onPlayPause}
        >
          {isPaused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!isEnabled}
          onClick={onSkipForward}
        >
          <SkipForward className="size-4" />
        </Button>
      </div>
    </div>
  );
};
