import { useRef } from "react";
import { VideoObject as VideoObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getContainerStyles } from "./utils/getContainerStyles";
import { getVideoStyles } from "./utils/getVideoStyles";
import { useMediaSrc } from "../hooks/use-media-src";
import { useIsAudienceRoute } from "@/hooks/use-is-audience-route";
import { useVideoThumbnail } from "@/hooks/use-video-thumbnail";
import { useAudienceVideoSync } from "@/hooks/use-video-control";

export type VideoObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
  forceShowVideo?: boolean; // Force showing actual video element (for AudienceSlide)
  slideId?: string; // When set, listen for video:control (play/pause) from backend
};

export const VideoObject = ({
  object,
  isEditable = false,
  forceShowVideo = false,
  slideId,
}: VideoObjectProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Type narrowing - this component should only receive video objects
  if (object.type !== "video") return null;

  const videoObject = object as VideoObjectType;
  const videoSrc = useMediaSrc(videoObject.src);

  // Get thumbnail from video object or look it up from media library (fallback for old objects)
  const thumbnailFromLibrary = useVideoThumbnail(
    videoObject.src,
    videoObject.thumbnail
  );
  const thumbnailSrc = thumbnailFromLibrary
    ? useMediaSrc(thumbnailFromLibrary)
    : null;
  const isAudienceRoute = useIsAudienceRoute();

  // Default to 'object' type for backward compatibility
  const videoType = videoObject.videoType || "object";
  const isBackgroundVideo = videoType === "background";

  // Show actual video on audience routes OR when forced (AudienceSlide component)
  // All other surfaces (Show View, Edit View) show thumbnails
  const shouldShowVideo = isAudienceRoute || forceShowVideo;

  const {
    contentRef,
    isEditing,
    textContent,
    handleSave,
    handleKeyDown,
    handleDoubleClick,
    handleMouseDown,
    textOverlayStyle,
    textContentStyle,
  } = useTextEditing({ object: videoObject, isEditable });

  const containerStyle = getContainerStyles({
    object: videoObject,
    isEditable,
  });

  const videoStyle = getVideoStyles({ object: videoObject, isEditable });
  const autoPlay = false;

  // Both the audience window and the preview panel render a real <video> for a background video
  // and mirror control commands. The preview panel (main window, next to the controls) is the
  // authoritative clock: it broadcasts playback state so the seek bar works even when the
  // audience window is closed (single-monitor case).
  const syncEnabled = Boolean(slideId) && isBackgroundVideo && shouldShowVideo;
  const isPreviewStateSource = forceShowVideo && !isAudienceRoute;
  useAudienceVideoSync({
    videoRef,
    slideId: slideId ?? "",
    enabled: syncEnabled,
    broadcastState: syncEnabled && isPreviewStateSource,
  });

  return (
    <div
      style={containerStyle}
      data-object-id={videoObject.id}
      data-object-type="video"
      data-video-type={videoType}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {shouldShowVideo ? (
        <video
          ref={slideId && isBackgroundVideo ? videoRef : undefined}
          src={videoSrc}
          autoPlay={autoPlay}
          loop={videoObject.loop ?? true}
          // Background video plays audio only on the real audience output. The in-window preview
          // mirror is muted to avoid doubled audio. NOTE: an unmuted audience video may be blocked
          // by autoplay policy until first playback; play() is retried on the operator's command.
          muted={
            isBackgroundVideo
              ? !isAudienceRoute
              : (videoObject.muted ?? true)
          }
          style={videoStyle}
        />
      ) : thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt="Video thumbnail"
          style={videoStyle}
        />
      ) : (
        <div
          style={{
            ...videoStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontSize: "48px",
          }}
        >
          🎬
        </div>
      )}
      {(textContent || isEditing) && (
        <div style={textOverlayStyle} className={cn({ editing: isEditing })}>
          <div
            ref={contentRef}
            style={textContentStyle}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={isEditing ? handleSave : undefined}
            onKeyDown={isEditing ? handleKeyDown : undefined}
          >
            {textContent}
          </div>
        </div>
      )}
    </div>
  );
};
