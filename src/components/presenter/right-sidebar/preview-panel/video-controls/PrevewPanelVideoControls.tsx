import { useVideoState } from "@/hooks/use-video-state";
import { PreviewPanelVideoSeekControl } from "./PrevewPanelVideoSeekControl";
import { PreviewPanelVideoSync } from "./PreviewPanelVideoSync";
import { PreviewPanelVideoMediaControls } from "./PreviewPanelVideoMediaControls";

export interface PreviewPanelVideoControlsProps {
  slideId: string | null;
}

export const PreviewPanelVideoControls = ({
  slideId,
}: PreviewPanelVideoControlsProps) => {
  const {
    videoState,
    handshakeState,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    retryHandshake,
  } = useVideoState({ slideId });

  const isEnabled = Boolean(slideId);
  const isPaused = videoState?.paused ?? true;
  const currentTime = videoState?.currentTime || 0;
  const duration = videoState?.duration || 0;
  const playbackRate = videoState?.playbackRate || 1;

  const onSeek = (time: number) => seek(time);
  const onSkipForward = () => skipForward(10);
  const onSkipBackward = () => skipBackward(10);

  return (
    <div className="flex flex-col pb-5 bg-shade-2">
      <PreviewPanelVideoSync
        key={slideId}
        isEnabled={isEnabled}
        handshakeState={handshakeState}
        onRetryHandshake={retryHandshake}
      />

      <PreviewPanelVideoSeekControl
        isEnabled={isEnabled}
        isPaused={isPaused}
        onPause={pause}
        onSeek={onSeek}
        onPlay={play}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
      />

      <PreviewPanelVideoMediaControls
        isEnabled={isEnabled}
        onSkipBackward={onSkipBackward}
        onPlayPause={togglePlayPause}
        onSkipForward={onSkipForward}
        isPaused={isPaused}
      />
    </div>
  );
};
