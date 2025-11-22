import { Slider } from "@/components/ui/slider";
import { useSmoothVideoTime } from "./hooks/use-smooth-video-time";
import { useVideoSeek } from "./hooks/use-video-seek";
import { formatTime } from "./utils/formatTime";
import { cn } from "@/lib/utils";

interface PreviewPanelVideoSeekControlProps {
  isEnabled?: boolean;
  isPaused: boolean;
  onPause: () => void;
  onSeek: (time: number) => void;
  onPlay: () => void;
  currentTime: number;
  duration: number;
  playbackRate: number;
}
export const PreviewPanelVideoSeekControl = ({
  isEnabled = true,
  isPaused,
  onPause,
  onSeek,
  onPlay,
  currentTime,
  duration,
  playbackRate,
}: PreviewPanelVideoSeekControlProps) => {
  const { handleSliderChange, handleSliderCommit, isDragging } = useVideoSeek({
    isEnabled,
    isPaused,
    onPause,
    onSeek,
    onPlay,
  });

  const { displayTime } = useSmoothVideoTime({
    currentTime,
    isPaused,
    playbackRate,
    isDragging,
    isEnabled,
    duration,
  });
  return (
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
  );
};
