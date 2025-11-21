import { VideoObject as VideoObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getContainerStyles } from "./utils/getContainerStyles";
import { getVideoStyles } from "./utils/getVideoStyles";
import { useMediaSrc } from "../hooks/use-media-src";
import { RefObject } from "react";
import { useIsAudienceRoute } from "@/hooks/use-is-audience-route";

export type VideoObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
  videoRef?: RefObject<HTMLVideoElement>; // For synced control in audience view
  forceShowVideo?: boolean; // Force showing actual video element (for AudienceSlide)
};

export const VideoObject = ({
  object,
  isEditable = false,
  videoRef,
  forceShowVideo = false,
}: VideoObjectProps) => {
  // Type narrowing - this component should only receive video objects
  if (object.type !== "video") return null;

  const videoObject = object as VideoObjectType;
  const videoSrc = useMediaSrc(videoObject.src);
  const thumbnailSrc = videoObject.thumbnail
    ? useMediaSrc(videoObject.thumbnail)
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

  const videoStyle = getVideoStyles({ isEditable });

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
          ref={videoRef}
          src={videoSrc}
          autoPlay={true}
          loop={true}
          muted={isBackgroundVideo ? false : (videoObject.muted ?? true)}
          style={videoStyle}
        />
      ) : thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt="Video thumbnail"
          style={{
            ...videoStyle,
            objectFit: "cover",
          }}
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
