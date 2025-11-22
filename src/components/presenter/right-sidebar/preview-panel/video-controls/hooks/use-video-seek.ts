import { useState } from "react";

interface UseVideoSeekProps {
  isEnabled: boolean;
  isPaused: boolean;
  onPause: () => void;
  onSeek: (time: number) => void;
  onPlay: () => void;
}

export const useVideoSeek = ({
  isEnabled,
  isPaused,
  onPause,
  onSeek,
  onPlay,
}: UseVideoSeekProps) => {
  // Track whether video was playing when dragging started
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  return { handleSliderChange, handleSliderCommit, isDragging };
};
