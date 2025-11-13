import { ShapeObject as ShapeObjectType } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";

export type ShapeObjectProps = {
  object: ShapeObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ShapeObject = ({
  object,
  isEditable = false,
}: ShapeObjectProps) => {
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
  };

  const shapeStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: object.fillColor,
    border:
      object.strokeColor && object.strokeWidth
        ? `${object.strokeWidth}px solid ${object.strokeColor}`
        : "none",
    ...(object.shapeType === "circle" && { borderRadius: "50%" }),
    ...(object.shapeType === "triangle" && {
      backgroundColor: "transparent",
      border: "none",
      width: 0,
      height: 0,
    }),
  };

  // For triangle, we use CSS borders trick
  if (object.shapeType === "triangle") {
    const triangleWidth = object.size.width;
    const triangleHeight = object.size.height;
    shapeStyle.borderLeft = `${triangleWidth / 2}px solid transparent`;
    shapeStyle.borderRight = `${triangleWidth / 2}px solid transparent`;
    shapeStyle.borderBottom = `${triangleHeight}px solid ${object.fillColor}`;
  }

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="shape"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div style={shapeStyle}></div>
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
