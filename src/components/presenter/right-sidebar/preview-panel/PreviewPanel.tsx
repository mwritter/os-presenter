"use client";
import { AudienceSlide } from "@/components/audiance/slide/AudienceSlide";
import { Button } from "@/components/ui/button";
import { useSelectionStore } from "@/stores/presenter/presenterStore";
import {} from "lucide-react";
import { DEFAULT_CANVAS_PRESET } from "@/consts/canvas";
import { CanvasSize } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import { PreviewPanelClearItemActions } from "./PreviewPanelClearItemActions";
import { PreviewPanelVideoControls } from "./video-controls/PrevewPanelVideoControls";

export const PreviewPanel = () => {
  const activeSlide = useSelectionStore((s) => s.activeSlide);

  const slideData: SlideData = activeSlide?.data || {
    id: "",
    objects: [],
    backgroundColor: "black",
  };
  const canvasSize: CanvasSize =
    activeSlide?.canvasSize || DEFAULT_CANVAS_PRESET.value;

  const hasBackgroundVideo = Boolean(
    activeSlide?.data.objects?.some(
      (obj) => obj.type === "video" && obj.videoType === "background"
    )
  );

  const slideIdForVideoState = hasBackgroundVideo ? slideData.id : null;

  return (
    <>
      <div className="flex flex-col h-full bg-shade-2">
        <div
          key={hasBackgroundVideo ? slideData.id : "preview-panel"}
          className="flex  h-full w-full max-h-[250px] "
        >
          <div className="relative h-full w-full overflow-hidden">
            <AudienceSlide data={slideData} canvasSize={canvasSize} />
          </div>
          <PreviewPanelClearItemActions />
        </div>
        <div className="flex items-center justify-between gap-1 bg-shade-4 w-full py-1 px-2">
          <span className="text-xs! h-min!">Screen 1</span>
          <Button
            variant="ghost"
            className="text-xs! h-min! hover:bg-red-800/50!"
          >
            Clear to Logo
          </Button>
        </div>
        <PreviewPanelVideoControls slideId={slideIdForVideoState} />
      </div>
    </>
  );
};
