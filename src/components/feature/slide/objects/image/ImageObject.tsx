import { ImageObject as ImageObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getObjectStyles } from "./utils/getObjectStyles";
import { getContainerStyles } from "./utils/getContainerStyles";

export type ImageObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ImageObject = ({
  object,
  isEditable = false,
}: ImageObjectProps) => {
  // Type narrowing - this component should only receive image objects
  if (object.type !== "image") return null;

  const imageObject = object as ImageObjectType;

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
  } = useTextEditing({ object: imageObject, isEditable });

  const containerStyle = getContainerStyles({
    object: imageObject,
    isEditable,
  });

  const imageStyle = getObjectStyles({ object: imageObject });

  return (
    <div
      style={containerStyle}
      data-object-id={imageObject.id}
      data-object-type="image"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <img src={imageObject.src} alt="" style={imageStyle} draggable={false} />
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
