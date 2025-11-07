import { CSSProperties } from "react";
import { SlideData } from "./types";
import { TextSlide } from "./TextSlide";
import { VideoSlide } from "./VideoSlide";
import { defaultSlideTheme } from "./theme/defaultTheme";
import { getBackgroundStyle } from "./util/getBackgroundStyle";
import { cn } from "@/lib/utils";
import { selectActiveSlideId, usePresenterStore } from "@/stores/presenterStore";

export type SlideProps = {
  id: string;
  data: SlideData;
  as?: 'button' | 'div';
};

export const Slide = ({ id, data, as = 'button' }: SlideProps) => {
  const activeSlideId = usePresenterStore(selectActiveSlideId);
  const setActiveSlide = usePresenterStore((state) => state.setActiveSlide);
  
  const isActive = activeSlideId === id;

  const handleClick = () => {
    setActiveSlide(id, data);
  };

  const backgroundStyle = getBackgroundStyle(data);
  const slideStyle: CSSProperties = {
    ...defaultSlideTheme,
    ...backgroundStyle,
  };

  const Comp = as === 'button' ? 'button' : 'div';

  return (
    <div
      key={id}
      className="flex flex-col gap-4 aspect-video max-h-[200px] min-h-[150px]"
    >
      <Comp
        type="button"
        onClick={as === 'button' ? handleClick : undefined}
        className={cn(
          "hover:cursor-pointer rounded-sm transition-all duration-200 w-full h-full",
          {
            "ring-4 ring-amber-400 shadow-lg shadow-amber-400/50": isActive,
            "hover:ring-2 hover:ring-white/30": !isActive && as === 'button',
          }
        )}
        style={slideStyle}
      >
        {data.background?.type === "video" && <VideoSlide data={data} />}
        {data.text && <TextSlide data={data} />}
      </Comp>
    </div>
  );
};
