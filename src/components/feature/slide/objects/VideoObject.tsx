import { VideoObject as VideoObjectType, ShadowEffect } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";

// Helper function to convert ShadowEffect to CSS box-shadow
const getShadowStyle = (shadow?: ShadowEffect): string => {
  if (!shadow) return "none";
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}`;
};

export type VideoObjectProps = {
  object: VideoObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const VideoObject = ({
  object,
  isEditable = false,
}: VideoObjectProps) => {
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
  } = useTextEditing({ object, isEditable });

  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const rotation = object.rotation ?? 0;

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`,
    zIndex: object.zIndex,
    cursor: isEditable ? "move" : "default",
    userSelect: "none",
    overflow: "hidden",
    // Border around the video bounds
    border:
      object.borderColor && object.borderWidth
        ? `${object.borderWidth}px solid ${object.borderColor}`
        : "none",
    boxSizing: "border-box",
    // Shadow effect
    boxShadow: getShadowStyle(object.effect?.shadow),
  };

  const videoStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: isEditable ? "none" : "auto",
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="video"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <video
        src={object.src}
        autoPlay={object.autoPlay}
        loop={object.loop}
        muted={object.muted}
        style={videoStyle}
      />
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
