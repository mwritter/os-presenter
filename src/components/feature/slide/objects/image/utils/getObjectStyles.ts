import { CSSProperties } from "react";
import { ImageObject } from "../../../types";

export const getObjectStyles = ({
  object,
}: {
  object: ImageObject;
}): CSSProperties => {
  return {
    width: "100%",
    height: "100%",
    objectFit: object.objectFit ?? "contain",
    pointerEvents: "none",
  };
};
