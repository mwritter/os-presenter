import { ShapeObject as ShapeObjectType } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";
import { Triangle } from "./shapes/Triangle";
import { Circle } from "./shapes/Circle";
import { Square } from "./shapes/Square";

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
    boxSizing: "border-box",
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="shape"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {object.shapeType === "triangle" && (
        <Triangle
          fillColor={object.fillColor}
          strokeColor={object.strokeColor}
          strokeWidth={object.strokeWidth}
        />
      )}
      {object.shapeType === "circle" && (
        <Circle
          fillColor={object.fillColor}
          strokeColor={object.strokeColor}
          strokeWidth={object.strokeWidth}
        />
      )}
      {object.shapeType === "rectangle" && (
        <Square
          fillColor={object.fillColor}
          strokeColor={object.strokeColor}
          strokeWidth={object.strokeWidth}
        />
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
