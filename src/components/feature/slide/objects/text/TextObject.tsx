import { TextObject as TextObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getContainerStyles } from "./utils/getContainerStyles";

export type TextObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const TextObject = ({ object, isEditable = false }: TextObjectProps) => {
  // Type narrowing - this component should only receive text objects
  if (object.type !== "text") return null;

  const textObject = object as TextObjectType;

  const {
    contentRef,
    isEditing,
    textContent,
    handleSave,
    handleKeyDown,
    handleDoubleClick,
    handleMouseDown,
    textContainerStyle,
    textContentStyle,
  } = useTextEditing({
    object: textObject,
    isEditable,
    mode: "direct",
    showPlaceholder: true,
  });

  const containerStyle = getContainerStyles({
    object: textObject,
    textContainerStyle,
  });

  return (
    <div
      className={cn({
        editing: isEditing,
      })}
      style={containerStyle}
      data-object-id={textObject.id}
      data-object-type="text"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div className={cn("w-full h-min-content")}>
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
    </div>
  );
};
