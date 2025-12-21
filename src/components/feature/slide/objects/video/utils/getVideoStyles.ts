import { CSSProperties } from "react";
import { VideoObject } from "../../../types";

export const getVideoStyles = ({
  object,
  isEditable,
}: {
  object: VideoObject;
  isEditable: boolean;
}): CSSProperties => {
  return {
    width: "100%",
    height: "100%",
    objectFit: object.objectFit ?? "contain",
    pointerEvents: isEditable ? "none" : "auto",
  };
};
