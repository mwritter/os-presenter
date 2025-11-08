import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { File } from "lucide-react";

type ShowViewSlideGridProps = {
  slides: SlideData[];
  title: string;
};

// Just displays the slides in a grid, these could be from a library or a playlist item
export const ShowViewSlideGrid = ({
  slides,
  title,
}: ShowViewSlideGridProps) => {
  if (!slides || slides.length === 0) {
    return <ShowViewEmptyState />;
  }

  return (
    <div className="grid gap-4 flex-wrap text-white/70">
      <ShowViewSlideGridHeader title={title} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-5">
        {slides.map((slide, index) => (
          <Slide key={slide.id + index} id={slide.id} data={slide} />
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
