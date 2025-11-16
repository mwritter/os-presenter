import { SVGProps } from "react";

export const Square = ({
  fillColor,
  strokeColor,
  strokeWidth,
  ...props
}: SVGProps<SVGSVGElement> & {
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
      }}
      {...props}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill={fillColor}
        stroke={strokeColor || "none"}
        strokeWidth={strokeWidth || 0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

