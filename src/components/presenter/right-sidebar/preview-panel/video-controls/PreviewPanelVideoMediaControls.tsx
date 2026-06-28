import { Button } from "@/components/ui/button";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface PreviewPanelVideoMediaControlsProps {
  isEnabled: boolean;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

/**
 * Presentational play/pause + skip controls. All state and command dispatch live in the
 * `useVideoController` hook owned by the parent.
 */
export const PreviewPanelVideoMediaControls = ({
  isEnabled,
  isPaused,
  onTogglePlayPause,
  onSkipBackward,
  onSkipForward,
}: PreviewPanelVideoMediaControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        disabled={!isEnabled}
        onClick={onSkipBackward}
        aria-label="Skip backward 10 seconds"
      >
        <SkipBack className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!isEnabled}
        onClick={onTogglePlayPause}
        aria-label={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!isEnabled}
        onClick={onSkipForward}
        aria-label="Skip forward 10 seconds"
      >
        <SkipForward className="size-4" />
      </Button>
    </div>
  );
};
