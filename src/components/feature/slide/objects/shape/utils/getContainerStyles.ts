import { CSSProperties } from "react";
import { ShapeObject } from "../../../types";

export const getContainerStyles = ({
  object,
  isEditable,
}: {
  object: ShapeObject;
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
    transform: `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg) translateZ(0)`,
    zIndex: object.zIndex,
    cursor: isEditable ? "move" : "default",
    userSelect: "none",
    boxSizing: "border-box",
    // Optimize rendering to prevent shadow artifacts during movement
    willChange: "transform",
  };
};
