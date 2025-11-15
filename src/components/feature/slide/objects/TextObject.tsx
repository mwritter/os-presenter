import { TextObject as TextObjectType } from "../types";
import { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTextEditing } from "./hooks/use-text-editing";

export type TextObjectProps = {
  object: TextObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const TextObject = ({ object, isEditable = false }: TextObjectProps) => {
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
    object,
    isEditable,
    mode: "direct",
    showPlaceholder: true,
  });

  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const rotation = object.rotation ?? 0;
  
  const containerStyle: CSSProperties = {
    ...textContainerStyle,
    position: "absolute",
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`,
    zIndex: object.zIndex,
    // Text box bounds (background and border)
    backgroundColor: object.backgroundColor,
    border:
      object.borderColor && object.borderWidth
        ? `${object.borderWidth}px solid ${object.borderColor}`
        : "none",
    boxSizing: "border-box",
  };

  return (
    <div
      className={cn({
        editing: isEditing,
      })}
      style={containerStyle}
      data-object-id={object.id}
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
