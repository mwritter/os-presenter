import { VideoObject as VideoObjectType } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";

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

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex,
    cursor: isEditable ? "move" : "default",
    userSelect: "none",
    overflow: "hidden",
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
