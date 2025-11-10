import { CSSProperties, useMemo, useRef } from "react";
import { SlideData } from "./types";
import { getBackgroundStyle } from "./util/getBackgroundStyle";
import { cn } from "@/lib/utils";
import {
  selectActiveSlideId,
  usePresenterStore,
} from "@/stores/presenterStore";
import { SlideObjectRenderer } from "./SlideObjectRenderer";
import { CanvasSize } from "@/components/presenter/types";
import { useSlideScale } from "./hooks/use-slide-scale";

export type SlideProps = {
  id: string;
  data: SlideData;
  as?: "button" | "div";
  isEditable?: boolean;
  selectedObjectId?: string | null;
  onResizeStart?: (
    objectId: string,
    handle: string,
    e: React.MouseEvent
  ) => void;
  canvasSize?: CanvasSize;
};

export const Slide = ({
  id,
  data,
  as = "button",
  isEditable = false,
  selectedObjectId = null,
  onResizeStart,
  canvasSize = { width: 1920, height: 1080 },
}: SlideProps) => {
  const activeSlideId = usePresenterStore(selectActiveSlideId);
  const setActiveSlide = usePresenterStore((state) => state.setActiveSlide);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scale, isReady } = useSlideScale({ canvasSize, containerRef });
  const isActive = activeSlideId === id;

  const handleClick = () => {
    setActiveSlide(id, data);
  };

  // Use backgroundColor if available, otherwise fall back to legacy background
  // Memoize to prevent recalculation on every render
  const backgroundStyle = useMemo(() => {
    return data.backgroundColor
      ? { backgroundColor: data.backgroundColor }
      : getBackgroundStyle(data, canvasSize);
  }, [data.backgroundColor, canvasSize.width, canvasSize.height]);

  // Canvas style - fixed size that gets scaled
  const canvasStyle: CSSProperties = {
    ...backgroundStyle,
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center",
    overflow: "hidden",
    willChange: "transform",
    backfaceVisibility: "hidden",
    opacity: isReady ? 1 : 0,
  };

  const Comp = as === "button" ? "button" : "div";

  return (
    <div
      ref={containerRef}
      key={id}
      className="flex flex-col gap-4 aspect-video w-full relative"
    >
      <Comp
        type="button"
        onClick={as === "button" ? handleClick : undefined}
        className={cn(
          "rounded-xs transition-all duration-200 w-full h-full relative",
          {
            "ring-1 ring-amber-400": isActive,
            "hover:ring-2 hover:ring-white/30": !isActive && as === "button",
          }
        )}
      >
        <div style={canvasStyle}>
          {data.objects && data.objects.length > 0 && (
            <SlideObjectRenderer
              objects={data.objects}
              isEditable={isEditable}
              selectedObjectId={selectedObjectId}
              onResizeStart={onResizeStart}
            />
          )}
        </div>
      </Comp>
    </div>
  );
};
