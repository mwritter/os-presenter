import { CSSProperties } from "react";
import { SlideData } from "./types";
import { TextSlide } from "./TextSlide";
import { VideoSlide } from "./VideoSlide";
import { defaultSlideTheme } from "./theme/defaultTheme";
import { getBackgroundStyle } from "./util/getBackgroundStyle";

export type SlideProps = {
  id: string;
  data: SlideData;
};

export const Slide = ({ id, data }: SlideProps) => {
  const backgroundStyle = getBackgroundStyle(data);

  const slideStyle: CSSProperties = {
    ...defaultSlideTheme,
    ...backgroundStyle,
  };

  return (
    <div
      key={id}
      className="flex flex-col gap-4 aspect-video max-h-[200px] min-h-[150px]"
    >
      <div style={slideStyle}>
        {data.background?.type === "video" && <VideoSlide data={data} />}
        {data.text && <TextSlide data={data} />}
      </div>
    </div>
  );
};
