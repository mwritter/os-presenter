import { AudienceSlide } from "@/components/audiance/slide/AudienceSlide";
import { Button, ButtonProps } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useSelectionStore } from "@/stores/presenterStore";
import {
  Circle,
  Image,
  Layers,
  Megaphone,
  Music,
  Play,
  Rewind,
  Send,
  SkipBack,
  SkipForward,
  Video,
  X,
} from "lucide-react";

export const PreviewPanel = () => {
  const activeSlide = useSelectionStore((s) => s.activeSlide);
  const clearActiveSlide = useSelectionStore((s) => s.clearActiveSlide);
  const handleClearSlide = () => {
    clearActiveSlide();
  };

  return (
    <>
      <div className="flex justify-between h-full w-full max-h-[200px] border-b border-black bg-shade-2">
        <div className="relative h-full w-full overflow-hidden">
          {activeSlide && (
            <AudienceSlide
              data={activeSlide.data}
              canvasSize={activeSlide.canvasSize}
            />
          )}
        </div>
        <div className="flex h-full">
          <Button
            variant="default"
            size="icon"
            className="h-full bg-red-800/50 hover:bg-red-800/70 transition-all ease-in-out duration-500 rounded-none w-[25px]"
            onClick={handleClearSlide}
          >
            <span className="rounded-full bg-white">
              <X className="size-4" />
            </span>
          </Button>
          <div className="flex-1 flex flex-col items-center h-full *:flex-1 *:border-b *:border-b-shade-1 *rounded-none">
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
            <PreviewPanelClearButton>
              <Circle className="size-4" />
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
      <PreviewPanelVideoControls />
    </>
  );
};

const PreviewPanelClearButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex-1 border-b border-b-shade-1 rounded-none bg-black"
      {...props}
    >
      {children}
    </Button>
  );
};

const PreviewPanelVideoControls = () => {
  return (
    <div className="flex flex-col gap-2 py-10 bg-shade-2">
      <div className="w-full max-w-[90%] mx-auto">
        {/* Hide slider thumb */}
        <Slider className="w-full" hideThumb />
      </div>
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="icon">
          <SkipBack className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Play className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <SkipForward className="size-4" />
        </Button>
      </div>
    </div>
  );
};
