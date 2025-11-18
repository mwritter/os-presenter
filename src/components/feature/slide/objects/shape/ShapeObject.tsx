import { ShapeObject as ShapeObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getContainerStyles } from "./utils/getContainerStyles";
import { getObjectStyles } from "./utils/getObjectStyles";
import { getShape } from "./utils/getShape";

export type ShapeObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ShapeObject = ({
  object,
  isEditable = false,
}: ShapeObjectProps) => {
  // Type narrowing - this component should only receive shape objects
  if (object.type !== "shape") return null;

  const shapeObject = object as ShapeObjectType;

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
  } = useTextEditing({ object: shapeObject, isEditable });

  const containerStyle = getContainerStyles({
    object: shapeObject,
    isEditable,
  });

  const shapeStyle = getObjectStyles({ object: shapeObject });

  const Shape = getShape({ object: shapeObject });

  return (
    <div
      style={containerStyle}
      data-object-id={shapeObject.id}
      data-object-type="shape"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <Shape
        fillColor={shapeObject.fillColor}
        strokeColor={shapeObject.strokeColor}
        strokeWidth={shapeObject.strokeWidth}
        style={shapeStyle}
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
