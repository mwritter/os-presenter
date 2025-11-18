import { useRef } from "react";
import { SlideData, SlideObject } from "./types";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/stores/presenterStore";
import { SlideObjectRenderer } from "./SlideObjectRenderer";
import { CanvasSize } from "@/components/presenter/types";
import { useSlideScale } from "./hooks/use-slide-scale";
import { useIsEditRoute } from "@/components/presenter/edit/hooks/use-is-edit-route";
import { getSlideCanvasStyles } from "./util/getSlideCanvasStyles";
import { getSlideMaskOverlay } from "./util/getSlideMaskOverlay";

export type SlideProps = {
  id: string;
  data: SlideData;
  as?: "button" | "div";
  isEditable?: boolean;
  selectedObjectId?: string | null;
  onUpdateObject?: (objectId: string, updates: Partial<SlideObject>) => void;
  canvasSize?: CanvasSize;
};

export const Slide = ({
  id,
  data,
  as = "button",
  isEditable = false,
  selectedObjectId = null,
  onUpdateObject,
  canvasSize = { width: 1920, height: 1080 },
}: SlideProps) => {
  const activeSlideId = useSelectionStore((s) => s.activeSlide?.id ?? null);
  const setActiveSlide = useSelectionStore((s) => s.setActiveSlide);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { scale, isReady } = useSlideScale({ canvasSize, containerRef });
  const isEditRoute = useIsEditRoute();
  const isActive = isEditRoute ? false : activeSlideId === id;

  const handleClick = () => {
    setActiveSlide(id, data);
  };

  const canvasStyle = getSlideCanvasStyles({
    backgroundColor: data.backgroundColor,
    canvasSize,
    scale,
    isEditable,
    isReady,
  });

  const maskOverlayStyle = isEditable
    ? getSlideMaskOverlay({ canvasSize, scale, isReady })
    : undefined;

  const Comp = as === "button" ? "button" : "div";

  return (
    <div
      ref={containerRef}
      key={id}
      className="flex flex-col gap-4 aspect-video w-full relative"
    >
      <Comp
        type={as === "button" ? "button" : undefined}
        onClick={as === "button" ? handleClick : undefined}
        className={cn(
          "rounded-xs transition-all duration-200 w-full h-full relative",
          {
            "ring-1 ring-amber-400": isActive,
            "hover:ring-2 hover:ring-white/30": !isActive && as === "button",
          }
        )}
      >
        <div ref={canvasRef} style={canvasStyle}>
          {data.objects && data.objects.length > 0 && (
            <SlideObjectRenderer
              scale={scale}
              objects={data.objects}
              isEditable={isEditable}
              selectedObjectId={selectedObjectId}
              canvasRef={canvasRef as React.RefObject<HTMLElement>}
              onUpdateObject={onUpdateObject}
            />
          )}
        </div>
      </Comp>
      {/* Mask overlay to gray out areas outside the slide in edit mode */}
      {maskOverlayStyle && <div style={maskOverlayStyle} />}
    </div>
  );
};
