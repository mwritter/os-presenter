import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { ShowViewSlideGridHeader } from "./ShowViewSlideGridHeader";

type ShowViewSlideGridProps = {
  slides: SlideData[];
  title: string;
};

export const ShowViewSlideGrid = ({
  slides,
  title,
}: ShowViewSlideGridProps) => {
  if (!slides || slides.length === 0) {
    return <ShowViewEmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 text-white/70 relative">
      <ShowViewSlideGridHeader title={title} />
      <div className="flex flex-wrap gap-4 p-5">
        {slides.map((slide, index) => (
          <div
            key={slide.id + index}
            className="shrink-0"
            style={{
              flexBasis: "clamp(300px, calc((100% - 5rem) / 4), 300px)",
            }}
          >
            <Slide id={slide.id} data={slide} />
          </div>
        ))}
      </div>
    </div>
  );
};
