import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { File } from "lucide-react";

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
    <div className="flex flex-col gap-4 text-white/70">
      <ShowViewSlideGridHeader title={title} />
      <div className="flex flex-wrap gap-4 p-5">
        {slides.map((slide, index) => (
          <div
            key={slide.id + index}
            className="border border-shade-1 shrink-0"
            style={{
              flexBasis: "clamp(200px, calc((100% - 5rem) / 4), 300px)",
            }}
          >
            <Slide id={slide.id} data={slide} />
          </div>
        ))}
      </div>
    </div>
  );
};

// This is the header for the slide grid, it could be a library or a playlist item
const ShowViewSlideGridHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex justify-between items-center text-xs p-2 text-white bg-shade-4">
      <div className="flex items-center gap-2">
        <File className="size-3.5" />
        {title}
      </div>
    </div>
  );
};
