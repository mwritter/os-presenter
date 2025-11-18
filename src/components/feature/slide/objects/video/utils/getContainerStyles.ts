import { CSSProperties } from "react";
import { ShadowEffect, VideoObject } from "../../../types";

// Helper function to convert ShadowEffect to CSS box-shadow
const getShadowStyle = (shadow?: ShadowEffect): string => {
  if (!shadow) return "none";
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}`;
};

export const getContainerStyles = ({
  object,
  isEditable,
}: {
  object: VideoObject;
  isEditable: boolean;
}): CSSProperties => {
  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const rotation = object.rotation ?? 0;

  return {
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
    // Border around the video bounds
    border:
      object.borderColor && object.borderWidth
        ? `${object.borderWidth}px solid ${object.borderColor}`
        : "none",
    boxSizing: "border-box",
    // Shadow effect
    boxShadow: getShadowStyle(object.effect?.shadow),
  };
};
