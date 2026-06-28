import { useSlideScale } from "@/components/feature/slide/hooks/use-slide-scale";
import { SlideObjectRenderer } from "@/components/feature/slide/SlideObjectRenderer";
import { SlideData } from "@/components/feature/slide/types";
import { getSlideCanvasStyles } from "@/components/feature/slide/util/getSlideCanvasStyles";
import { CanvasSize } from "@/components/presenter/types";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface AudienceSlideProps {
    data: SlideData;
    canvasSize: CanvasSize;
}

export const AudienceSlide = ({ data, canvasSize }: AudienceSlideProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { scale, isReady } = useSlideScale({
        canvasSize,
        containerRef,
    });
    const canvasStyle = getSlideCanvasStyles({
        backgroundColor: data.backgroundColor || "black",
        isEditable: false,
        canvasSize,
        scale,
        isReady,
    });

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full flex items-center justify-center", {
                backgroundColor: data.backgroundColor || "black",
            })}
        >
            <div ref={canvasRef} style={canvasStyle}>
                {data.objects && data.objects.length > 0 && (
                    <SlideObjectRenderer
                        key={data.id}
                        objects={data.objects}
                        isEditable={false}
                        selectedObjectId={null}
                        forceShowVideo={true}
                        slideId={data.id}
                    />
                )}
            </div>
        </div>
    );
};