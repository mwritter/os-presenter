import { CSSProperties } from "react";
import { ShadowEffect, TextObject } from "../../../types";

// Helper function to convert ShadowEffect to CSS box-shadow
const getShadowStyle = (shadow?: ShadowEffect): string => {
  if (!shadow) return "none";
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}`;
};

export const getContainerStyles = ({
  object,
  textContainerStyle,
}: {
  object: TextObject;
  textContainerStyle: CSSProperties;
}): CSSProperties => {
  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  const rotation = object.rotation ?? 0;

  return {
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
    // Shadow effect
    boxShadow: getShadowStyle(object.effect?.shadow),
  };
};
