import { SVGProps } from "react";
import { ShadowEffect } from "@/components/feature/slide/types";

export const Rectangle = ({
  fillColor,
  strokeColor,
  strokeWidth,
  shadow,
  ...props
}: SVGProps<SVGSVGElement> & {
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: ShadowEffect;
}) => {
  // Create a stable filter ID based on shadow properties to force re-render when they change
  const filterId = shadow
    ? `shadow-rect-${shadow.offsetX}-${shadow.offsetY}-${shadow.blurRadius}-${shadow.color.replace(/[^a-z0-9]/gi, "")}`
    : undefined;

  return (
    <svg
      key={filterId || "no-shadow"}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      {...props}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
        ...props.style,
      }}
    >
      {shadow && (
        <defs>
          <filter id={filterId} x="-200%" y="-200%" width="500%" height="500%">
            <feDropShadow
              dx={shadow.offsetX / 2}
              dy={shadow.offsetY / 2}
              stdDeviation={shadow.blurRadius / 2}
              floodColor={shadow.color}
              floodOpacity={0.7}
            />
          </filter>
        </defs>
      )}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill={fillColor}
        stroke={strokeColor || "none"}
        strokeWidth={strokeWidth || 0}
        vectorEffect="non-scaling-stroke"
        filter={shadow ? `url(#${filterId})` : undefined}
      />
    </svg>
  );
};
