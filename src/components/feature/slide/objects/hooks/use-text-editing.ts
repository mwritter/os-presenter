import { CSSProperties, useEffect, useRef, useState } from "react";
import { useEditContextSafe } from "@/presenter/edit/context";

type TextableObject = {
  id: string;
  content?: string;
  fontSize?: number;
  color?: string;
  alignment?: "left" | "center" | "right";
  fontFamily?: string;
  fontWeight?: number;
  bold?: boolean; // Deprecated: for backward compatibility
  fontStyle?: "normal" | "italic" | "oblique";
  underline?: boolean;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  textTransform?: "uppercase" | "lowercase" | "capitalize";
};

type UseTextEditingOptions = {
  object: TextableObject;
  isEditable: boolean;
  mode?: "overlay" | "direct"; // overlay for shapes/images/videos, direct for text objects
  showPlaceholder?: boolean; // show "Text" placeholder when empty in editable mode
};

export const useTextEditing = ({
  object,
  isEditable,
  mode = "overlay",
  showPlaceholder = false,
}: UseTextEditingOptions) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editContext = useEditContextSafe();
  const updateTextContent = editContext?.updateTextContent;
  const selectedObjectId = editContext?.selectedObjectId;
  const isSelected = selectedObjectId === object.id;

  // Handle placeholder text for TextObject
  const textContent =
    showPlaceholder && isEditable
      ? Boolean(object.content) || !isEditable
        ? object.content
        : Boolean(editContext)
          ? "Text"
          : ""
      : object.content || "";

  // Focus and select all text when editing starts
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

  // Exit editing mode when object is deselected
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
        contentRef.current.textContent = object.content || "";
      }
      setIsEditing(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditable) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      // Prevent drag while editing
      e.stopPropagation();
    }
  };

  // Styles for overlay mode (shapes, images, videos)
  const textOverlayStyle: CSSProperties =
    mode === "overlay"
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: isEditing ? "auto" : "none",
          overflow: isEditable && isSelected ? "visible" : "hidden",
        }
      : {};

  // Styles for direct mode (text objects)
  const textContainerStyle: CSSProperties =
    mode === "direct"
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: isEditable && isSelected ? "visible" : "hidden",
        }
      : {};

  const textContentStyle: CSSProperties = {
    width: "100%",
    minHeight: "1em",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: `${object.fontSize || 48}px`,
    color: object.color || "#FFFFFF",
    textAlign: object.alignment || "center",
    // fontFamily now contains the full font name (e.g., "American Typewriter Bold")
    fontFamily: object.fontFamily || "Arial",
    textDecoration: object.underline ? "underline" : "none",
    textTransform: object.textTransform || "none",
    WebkitTextStroke:
      object.textStrokeColor && object.textStrokeWidth
        ? `${object.textStrokeWidth}px ${object.textStrokeColor}`
        : "none",
    padding: "8px",
    boxSizing: "border-box",
    cursor: isEditable && !isEditing ? "move" : "text",
    userSelect: isEditing ? "auto" : "none",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    pointerEvents: isEditing ? "auto" : "none",
    // Additional styles for direct mode
    ...(mode === "direct" && {
      maxHeight: isEditing ? "none" : "100%",
      overflow: isEditing && isSelected ? "visible" : "hidden",
    }),
  };

  return {
    contentRef,
    isEditing,
    textContent,
    handleSave,
    handleKeyDown,
    handleDoubleClick,
    handleMouseDown,
    textOverlayStyle,
    textContainerStyle,
    textContentStyle,
  };
};
