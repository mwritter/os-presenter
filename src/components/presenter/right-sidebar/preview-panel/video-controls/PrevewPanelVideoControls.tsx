import { useState } from "react";
import { useVideoController } from "@/hooks/use-video-control";
import { PreviewPanelVideoMediaControls } from "./PreviewPanelVideoMediaControls";
import { PreviewPanelVideoSeekControl } from "./PrevewPanelVideoSeekControl";
import { useSmoothVideoTime } from "./hooks/use-smooth-video-time";

interface PreviewPanelVideoControlsProps {
  slideId: string | null;
}

export const PreviewPanelVideoControls = ({
  slideId,
}: PreviewPanelVideoControlsProps) => {
  const {
    videoState,
    isPaused,
    controlsAllowed,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
  } = useVideoController({ slideId });

  const [isDragging, setIsDragging] = useState(false);
  const isEnabled = Boolean(slideId) && controlsAllowed;

  const duration = videoState?.duration ?? 0;
  const playbackRate = videoState?.playbackRate ?? 1;

  // Interpolate time between the audience's ~4Hz updates for a smooth slider.
  const { displayTime } = useSmoothVideoTime({
    currentTime: videoState?.currentTime ?? 0,
    isPaused,
    playbackRate,
    isDragging,
    isEnabled,
    duration,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-5">
      <PreviewPanelVideoSeekControl
        isEnabled={isEnabled}
        isPaused={isPaused}
        onPause={pause}
        onPlay={play}
        onSeek={seek}
        onDraggingChange={setIsDragging}
        currentTime={displayTime}
        duration={duration}
        playbackRate={playbackRate}
      />
      <PreviewPanelVideoMediaControls
        isEnabled={isEnabled}
        isPaused={isPaused}
        onTogglePlayPause={togglePlayPause}
        onSkipBackward={() => skipBackward(10)}
        onSkipForward={() => skipForward(10)}
      />
    </div>
  );
};
