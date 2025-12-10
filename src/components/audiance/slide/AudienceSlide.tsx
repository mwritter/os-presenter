import { useRef, useEffect } from "react";
import { SlideData, VideoObject } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { SlideObjectRenderer } from "@/components/feature/slide/SlideObjectRenderer";
import { useSlideScale } from "@/components/feature/slide/hooks/use-slide-scale";
import { getSlideCanvasStyles } from "@/components/feature/slide/util/getSlideCanvasStyles";
import { useVideoSync } from "@/hooks/use-video-sync";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsAudienceRoute } from "@/hooks/use-is-audience-route";
import { useVideoState } from "@/hooks/use-video-state";

interface AudienceSlideProps {
  data: SlideData;
  canvasSize: CanvasSize;
  useCache?: boolean;
}

export const AudienceSlide = ({
  data,
  canvasSize,
  useCache,
}: AudienceSlideProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isAudienceRoute = useIsAudienceRoute();
  const { scale, isReady } = useSlideScale({
    canvasSize,
    containerRef,
    useCache: useCache ?? isAudienceRoute,
  });

  // Find background video for sync
  const backgroundVideo = data.objects?.find(
    (obj) => obj.type === "video" && obj.videoType === "background"
  ) as VideoObject;

  const { videoState } = useVideoState({ slideId: data.id });

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
      // Clear the video ref if there's no background video
      if (videoRef.current && !backgroundVideo) {
        videoRef.current = null;
      }
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
    }
  }, [backgroundVideo?.id, videoRef, data.id]);

  // Sync video pause state from audience (for preview panel)
  useEffect(() => {
    if (videoState?.paused === undefined || !videoRef.current) return;

    const video = videoRef.current;
    if (videoState?.paused && !video.paused) {
      video.pause();
    } else if (!videoState?.paused && video.paused) {
      video.play().catch(console.warn);
    }
  }, [videoState?.paused]);

  const canvasStyle = getSlideCanvasStyles({
    backgroundColor: data.backgroundColor || "black",
    canvasSize,
    scale,
    isEditable: false,
    isReady,
  });

  return (
    <AnimatePresence>
      <motion.div
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
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
