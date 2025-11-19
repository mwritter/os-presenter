import { useRef } from "react";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { SlideObjectRenderer } from "@/components/feature/slide/SlideObjectRenderer";
import { useSlideScale } from "@/components/feature/slide/hooks/use-slide-scale";
import { getSlideCanvasStyles } from "@/components/feature/slide/util/getSlideCanvasStyles";

interface AudienceSlideProps {
  data: SlideData;
  canvasSize: CanvasSize;
}

/**
 * Simplified slide component for audience view
 * - No interactivity (no clicking, editing, or selection)
 * - Focuses only on proper scaling and display
 * - Respects the presentation's canvas size
 */
export const AudienceSlide = ({ data, canvasSize }: AudienceSlideProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { scale, isReady } = useSlideScale({ canvasSize, containerRef });

  const canvasStyle = getSlideCanvasStyles({
    backgroundColor: data.backgroundColor || "black",
    canvasSize,
    scale,
    isEditable: false,
    isReady,
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div ref={canvasRef} style={canvasStyle}>
        {data.objects && data.objects.length > 0 && (
          <SlideObjectRenderer
            objects={data.objects}
            isEditable={false}
            selectedObjectId={null}
          />
        )}
      </div>
    </div>
  );
};
