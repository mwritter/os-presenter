import { ImageObject as ImageObjectType } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";

export type ImageObjectProps = {
  object: ImageObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ImageObject = ({
  object,
  isEditable = false,
}: ImageObjectProps) => {
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
    // Border around the image bounds
    border:
      object.borderColor && object.borderWidth
        ? `${object.borderWidth}px solid ${object.borderColor}`
        : "none",
    boxSizing: "border-box",
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: (object.objectFit as any) || "cover",
    pointerEvents: "none",
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="image"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <img src={object.src} alt="" style={imageStyle} draggable={false} />
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
