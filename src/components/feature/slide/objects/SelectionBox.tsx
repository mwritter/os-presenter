import { CSSProperties } from "react";
import { SlideObject } from "../types";

export type SelectionBoxProps = {
  object: SlideObject;
  onResizeStart?: (handle: string, e: React.MouseEvent) => void;
};

export const SelectionBox = ({ object, onResizeStart }: SelectionBoxProps) => {
  const boxStyle: CSSProperties = {
    position: "absolute",
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex + 1000, // Always on top
    border: "2px solid #3b82f6",
    pointerEvents: "none",
    boxSizing: "border-box",
  };

  const handleStyle: CSSProperties = {
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "#3b82f6",
    border: "2px solid white",
    borderRadius: "50%",
    pointerEvents: "auto",
    cursor: "pointer",
  };

  const handles = [
    {
      name: "nw",
      style: { ...handleStyle, top: "-5px", left: "-5px", cursor: "nw-resize" },
    },
    {
      name: "n",
      style: {
        ...handleStyle,
        top: "-5px",
        left: "calc(50% - 5px)",
        cursor: "n-resize",
      },
    },
    {
      name: "ne",
      style: {
        ...handleStyle,
        top: "-5px",
        right: "-5px",
        cursor: "ne-resize",
      },
    },
    {
      name: "e",
      style: {
        ...handleStyle,
        top: "calc(50% - 5px)",
        right: "-5px",
        cursor: "e-resize",
      },
    },
    {
      name: "se",
      style: {
        ...handleStyle,
        bottom: "-5px",
        right: "-5px",
        cursor: "se-resize",
      },
    },
    {
      name: "s",
      style: {
        ...handleStyle,
        bottom: "-5px",
        left: "calc(50% - 5px)",
        cursor: "s-resize",
      },
    },
    {
      name: "sw",
      style: {
        ...handleStyle,
        bottom: "-5px",
        left: "-5px",
        cursor: "sw-resize",
      },
    },
    {
      name: "w",
      style: {
        ...handleStyle,
        top: "calc(50% - 5px)",
        left: "-5px",
        cursor: "w-resize",
      },
    },
  ];

  return (
    <div style={boxStyle}>
      {handles.map(({ name, style }) => (
        <div
          key={name}
          style={style}
          onMouseDown={(e) => onResizeStart?.(name, e)}
          data-handle={name}
        />
      ))}
    </div>
  );
};
