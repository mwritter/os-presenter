import { SlideData } from "./types";
import { CSSProperties } from "react";

export const TextSlide = ({ data }: { data: SlideData }) => {

    const textStyle: CSSProperties = data.text ? {
        fontSize: data.text.fontSize ? `${data.text.fontSize}px` : '16px',
        color: data.text.color || 'var(--foreground)',
        textAlign: data.text.alignment || 'center',
      } : {};

  return <div className="z-10" style={textStyle}>{data.text?.content}</div>;
};
