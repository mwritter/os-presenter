import { SVGProps } from "react";

export const Circle = ({
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
      <ellipse
        cx="50"
        cy="50"
        rx="50"
        ry="50"
        fill={fillColor}
        stroke={strokeColor || "none"}
        strokeWidth={strokeWidth || 0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

