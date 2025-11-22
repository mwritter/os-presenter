import { useEffect, useRef, useState } from "react";

interface UseSmoothVideoTimeProps {
  currentTime: number;
  isPaused: boolean;
  playbackRate: number;
  isDragging: boolean;
  isEnabled: boolean;
  duration: number;
}

export const useSmoothVideoTime = ({
  currentTime,
  isPaused,
  playbackRate,
  isDragging,
  isEnabled,
  duration,
}: UseSmoothVideoTimeProps) => {
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

  return { displayTime };
};
