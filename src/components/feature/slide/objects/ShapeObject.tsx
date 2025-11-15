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
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="shape"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {object.shapeType === "triangle" ? (
        // Always use SVG for triangles (supports both fill and stroke)
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "visible",
          }}
          preserveAspectRatio="none"
        >
          <polygon
            points="50,0 100,100 0,100"
            fill={object.fillColor}
            stroke={object.strokeColor || "none"}
            strokeWidth={object.strokeWidth || 0}
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <div style={shapeStyle}></div>
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
