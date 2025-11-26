import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/stores/presenterStore";
import {
  File,
  Image,
  Layers,
  Megaphone,
  Music,
  Send,
  Video,
  XCircleIcon,
} from "lucide-react";

// TODO: figure out what all these do.  Currently we only clear the slide.

export const PreviewPanelClearItemActions = () => {
  const clearActiveSlide = useSelectionStore((s) => s.clearActiveSlide);
  const activeSlide = useSelectionStore((s) => s.activeSlide);

  const activeClearActions = [];

  if (activeSlide !== null) {
    activeClearActions.push("slide");
  }

  const handleClearAll = () => {
    clearActiveSlide();
  };

  const handleClearSlide = () => {
    clearActiveSlide();
  };

  return (
    <div className="flex">
      <button
        className={cn(
          "peer bg-red-800/25 border border-r-0 w-8 flex items-center justify-center",
          {
            "bg-red-800/50 hover:bg-red-800/70! flex items-center justify-center":
              activeClearActions.length > 0,
          }
        )}
        onClick={handleClearAll}
        disabled={activeClearActions.length === 0}
      >
        <XCircleIcon fill="white" className="size-5 rounded-full text-black" />
      </button>
      <div className="flex flex-col peer-hover:[&>button:not([disabled])]:bg-red-800/70!">
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
        <PreviewPanelClearButton
          isActive={activeClearActions.includes("slide")}
          onClick={handleClearSlide}
        >
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
  );
};

const PreviewPanelClearButton = ({
  children,
  isActive,
  ...props
}: ButtonProps & { isActive?: boolean }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "flex-1 rounded-none not-disabled:bg-red-800/50 not-disabled:hover:bg-red-800/70! border",
        {
          "border-l-0": isActive,
        }
      )}
      disabled={!isActive}
      {...props}
    >
      {children}
    </Button>
  );
};
