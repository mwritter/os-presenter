import { useRef, useEffect } from "react";
import { SlideData, VideoObject } from "@/components/feature/slide/types";
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
  ) as VideoObject;

  // Use video sync hook for background videos
  const videoRef = useVideoSync({
    slideId: data.id,
    isActive: Boolean(backgroundVideo),
    videoType: backgroundVideo?.videoType || "object",
  });

  // Attach video ref to the background video element after render
  useEffect(() => {
    if (!backgroundVideo || !canvasRef.current) {
      console.log("No background video or canvas ref", {
        backgroundVideo: !!backgroundVideo,
        canvasRef: !!canvasRef.current,
      });
      return;
    }

    // Find the video element with matching data attributes
    const videoElement = canvasRef.current.querySelector(
      `[data-object-id="${backgroundVideo.id}"][data-video-type="background"] video`
    ) as HTMLVideoElement;

    console.log("Looking for video element", {
      found: !!videoElement,
      objectId: backgroundVideo.id,
      slideId: data.id,
    });

    if (videoElement && videoRef.current !== videoElement) {
      console.log("Attaching video ref to element", {
        slideId: data.id,
      });
      videoRef.current = videoElement;

      // Note: Auto-play is now controlled by the handshake protocol
      // The video will play after receiving acknowledgment from presenter
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
