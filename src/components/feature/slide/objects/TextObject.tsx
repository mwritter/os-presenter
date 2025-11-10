import { useEditContextSafe } from "@/presenter/edit/context";
import { TextObject as TextObjectType } from "../types";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TextObjectProps = {
  object: TextObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const TextObject = ({ object, isEditable = false }: TextObjectProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editContext = useEditContextSafe();
  const updateTextContent = editContext?.updateTextContent;
  const selectedObjectId = editContext?.selectedObjectId;

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Select all text in the contenteditable div
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditable || !selectedObjectId) return;
    const isSelected = selectedObjectId === object.id;
    if (!isSelected) {
      setIsEditing(false);
      if (contentRef.current) {
        contentRef.current.blur();
      }
    }
  }, [selectedObjectId, object.id, isEditable]);

  const handleSave = () => {
    if (!updateTextContent) return;
    const editingContent = contentRef.current?.innerText || "";
    updateTextContent(object.id, editingContent);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (contentRef.current) {
        contentRef.current.textContent = object.content;
      }
      setIsEditing(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditable) {
      e.preventDefault();
      e.stopPropagation();
      console.log("handleDoubleClick called");
      setIsEditing(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      // Prevent drag while editing
      e.stopPropagation();
    }
  };

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center", // Always vertically center
    justifyContent: "center", // Center horizontally in the flex container
    position: "absolute",
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex,
    overflow: isEditable ? "visible" : "hidden", // Hide overflow when not editable
  };

  const contentStyle: CSSProperties = {
    width: "100%",
    maxHeight: isEditing ? "none" : "100%", // Constrain height when not editing
    minHeight: "1em",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: `${object.fontSize}px`,
    color: object.color,
    textAlign: object.alignment, // horizontal alignment
    fontFamily: object.fontFamily || "inherit",
    fontWeight: object.bold ? "bold" : "normal",
    fontStyle: object.italic ? "italic" : "normal",
    textDecoration: object.underline ? "underline" : "none",
    padding: "8px",
    boxSizing: "border-box",
    cursor: isEditable && !isEditing ? "move" : "text",
    userSelect: isEditing ? "auto" : "none",
    wordWrap: "break-word",
    overflow: isEditing ? "visible" : "hidden", // Allow overflow when editing, hide otherwise
    whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
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
          style={contentStyle}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={isEditing ? handleSave : undefined}
          onKeyDown={isEditing ? handleKeyDown : undefined}
        >
          {object.content}
        </div>
      </div>
    </div>
  );
};
