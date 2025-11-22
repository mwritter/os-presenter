import { Button, ButtonProps } from "@/components/ui/button";
import { useSelectionStore } from "@/stores/presenterStore";
import {
  File,
  Image,
  Layers,
  Megaphone,
  Music,
  Send,
  Video,
} from "lucide-react";

// TODO: figure out what all these do.  Currently we only clear the slide.

export const PreviewPanelClearItemActions = () => {
  const clearActiveSlide = useSelectionStore((s) => s.clearActiveSlide);

  const handleClearSlide = () => {
    clearActiveSlide();
  };

  return (
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
