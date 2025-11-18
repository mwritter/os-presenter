import { CSSProperties } from "react";

export const getVideoStyles = ({
  isEditable,
}: {
  isEditable: boolean;
}): CSSProperties => {
  return {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: isEditable ? "none" : "auto",
  };
};
