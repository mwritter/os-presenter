"use client";
import { AudienceSlide } from "@/components/audiance/slide/AudienceSlide";
import { Button } from "@/components/ui/button";
import { useSelectionStore } from "@/stores/presenterStore";
import {} from "lucide-react";
import { DEFAULT_CANVAS_PRESET } from "@/consts/canvas";
import { CanvasSize } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import { Label } from "@/components/ui/label";
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
      <div
        key={activeSlide?.id || "preview-panel"}
        className="flex flex-col h-full w-full max-h-[250px] border-b border-black bg-shade-2 gap-2"
      >
        <div className="relative h-full w-full overflow-hidden">
          <AudienceSlide data={slideData} canvasSize={canvasSize} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1 @container">
            <Label className="text-xs! @min-[200px]:block hidden">
              Clear Items
            </Label>
            <Button
              variant="outline"
              className="text-xs! h-min w-full @min-[200px]:w-auto"
            >
              Clear to Logo
            </Button>
          </div>
          <PreviewPanelClearItemActions />
        </div>
      </div>
      <PreviewPanelVideoControls slideId={slideIdForVideoState} />
    </>
  );
};
