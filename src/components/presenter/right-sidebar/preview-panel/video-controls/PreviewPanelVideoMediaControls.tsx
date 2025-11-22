import { Button } from "@/components/ui/button";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface PreviewPanelVideoMediaControlsProps {
  isEnabled: boolean;
  onSkipBackward: () => void;
  onPlayPause: () => void;
  onSkipForward: () => void;
  isPaused: boolean;
}

export const PreviewPanelVideoMediaControls = ({
  isEnabled,
  onSkipBackward,
  onPlayPause,
  onSkipForward,
  isPaused,
}: PreviewPanelVideoMediaControlsProps) => {
  return (
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
        {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
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
  );
};
