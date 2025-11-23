import { useRef, useState } from "react";
import { SlideData, SlideObject } from "./types";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/stores/presenterStore";
import { SlideObjectRenderer } from "./SlideObjectRenderer";
import { MoveableControlsLayer } from "./objects/moveable/MoveableControlsLayer";
import { CanvasSize } from "@/components/presenter/types";
import { useSlideScale } from "./hooks/use-slide-scale";
import { useIsEditRoute } from "@/hooks/use-is-edit-route";
import { getSlideCanvasStyles } from "./util/getSlideCanvasStyles";
import { getSlideMaskOverlay } from "./util/getSlideMaskOverlay";
import { SlideTag } from "./SlideTag";

export type SlideProps = {
  id: string;
  data: SlideData;
  isEditable?: boolean;
  selectedObjectId?: string | null;
  onUpdateObject?: (objectId: string, updates: Partial<SlideObject>) => void;
  canvasSize?: CanvasSize;
  onMoveableInteractionChange?: (isInteracting: boolean) => void;
  onClick?: () => void;
};

export const Slide = ({
  id,
  data,
  isEditable = false,
  selectedObjectId = null,
  onUpdateObject,
  canvasSize = { width: 1920, height: 1080 },
  onMoveableInteractionChange,
  onClick,
}: SlideProps) => {
  const activeSlideId = useSelectionStore((s) => s.activeSlide?.id ?? null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { scale, isReady } = useSlideScale({ canvasSize, containerRef });
  const isEditRoute = useIsEditRoute();
  const isActive = isEditRoute ? false : activeSlideId === id;
  const [isMoveableInteracting, setIsMoveableInteracting] = useState(false);

  const handleMoveableInteractionChange = (isInteracting: boolean) => {
    setIsMoveableInteracting(isInteracting);
    onMoveableInteractionChange?.(isInteracting);
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

  return (
    <div
      ref={containerRef}
      key={id}
      className="flex flex-col gap-4 aspect-video w-full relative"
    >
      <div
        onClick={onClick}
        className={cn("transition-all duration-200 w-full h-full relative")}
      >
        <div ref={canvasRef} style={canvasStyle}>
          {data.objects && data.objects.length > 0 && (
            <>
              <SlideObjectRenderer
                objects={data.objects}
                isEditable={isEditable}
                selectedObjectId={selectedObjectId}
              />
              {isEditable && onUpdateObject && (
                <MoveableControlsLayer
                  objects={data.objects}
                  selectedObjectId={selectedObjectId}
                  canvasRef={canvasRef as React.RefObject<HTMLElement>}
                  scale={scale}
                  onUpdateObject={onUpdateObject}
                  isInteracting={isMoveableInteracting}
                  setIsInteracting={handleMoveableInteractionChange}
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* Mask overlay to gray out areas outside the slide in edit mode */}
      {maskOverlayStyle && <div style={maskOverlayStyle} />}
    </div>
  );
};
