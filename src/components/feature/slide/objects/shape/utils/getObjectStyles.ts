import { CSSProperties } from "react";
import { ShadowEffect, ShapeObject } from "../../../types";

// Helper function to convert ShadowEffect to CSS drop-shadow filter
const getDropShadowFilter = (shadow?: ShadowEffect): string => {
  if (!shadow) return "none";
  // drop-shadow doesn't support spread radius, so we omit it
  return `drop-shadow(${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.color})`;
};

export const getObjectStyles = ({
  object,
}: {
  object: ShapeObject;
}): CSSProperties => {
  // Apply shadow to the SVG shape itself (not the container bounds)
  // This ensures shadow follows the shape contour (circle, triangle, etc.)
  return {
    filter: getDropShadowFilter(object.effect?.shadow),
  };
};
