import { SVGProps } from "react";

export const Triangle = ({
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
      <polygon
        points="50,0 100,100 0,100"
        fill={fillColor}
        stroke={strokeColor || "none"}
        strokeWidth={strokeWidth || 0}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
