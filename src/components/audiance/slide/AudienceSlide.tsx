import { useRef, useEffect } from "react";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { SlideObjectRenderer } from "@/components/feature/slide/SlideObjectRenderer";
import { useSlideScale } from "@/components/feature/slide/hooks/use-slide-scale";
import { getSlideCanvasStyles } from "@/components/feature/slide/util/getSlideCanvasStyles";
import { useVideoSync } from "@/hooks/use-video-sync";

interface AudienceSlideProps {
  data: SlideData;
  canvasSize: CanvasSize;
}

/**
 * Simplified slide component for audience view
 * - No interactivity (no clicking, editing, or selection)
 * - Focuses only on proper scaling and display
 * - Respects the presentation's canvas size
 * - Handles video sync for 'background' type videos
 */
export const AudienceSlide = ({ data, canvasSize }: AudienceSlideProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { scale, isReady } = useSlideScale({ canvasSize, containerRef });

  // Find background video for sync
  const backgroundVideo = data.objects?.find(
    (obj) => obj.type === "video" && obj.videoType === "background"
  );

  // Use video sync hook for background videos
  const videoRef = useVideoSync({
    slideId: data.id,
    isActive: true, // Audience slide is always active when visible
  });

  // Attach video ref to the background video element after render
  useEffect(() => {
    if (!backgroundVideo || !canvasRef.current) return;

    // Find the video element with matching data attributes
    const videoElement = canvasRef.current.querySelector(
      `[data-object-id="${backgroundVideo.id}"][data-video-type="background"] video`
    ) as HTMLVideoElement;

    if (videoElement && videoRef.current !== videoElement) {
      videoRef.current = videoElement;

      // Auto-play background video when slide becomes active
      videoElement.play().catch((error) => {
        console.error("Failed to auto-play background video:", error);
      });
    }
  }, [backgroundVideo, videoRef, data.id]);

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
            forceShowVideo={true}
          />
        )}
      </div>
    </div>
  );
};
