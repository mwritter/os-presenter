import { SlideObject } from "@/components/feature/slide/types";

export const getObjectLabel = (object: SlideObject): string => {
  if (object.type === "text") return object.content.substring(0, 20) || "Text";
  if (object.type === "shape") return `${object.shapeType} Shape`;
  if (object.type === "image") return "Image";
  if (object.type === "video") return "Video";
  return "Object";
};
