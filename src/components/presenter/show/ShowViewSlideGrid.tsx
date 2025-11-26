import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { ShowViewSlideGridHeader } from "./ShowViewSlideGridHeader";
import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { useSelectionStore } from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import { MAX_GRID_COLUMNS, useShowViewContext } from "./context";

type ShowViewSlideGridProps = {
  slides: SlideData[];
  title: string;
  canvasSize: CanvasSize;
};

export const ShowViewSlideGrid = ({
  slides,
  title,
  canvasSize,
}: ShowViewSlideGridProps) => {
  const setActiveSlide = useSelectionStore((s) => s.setActiveSlide);
  const activeSlideId = useSelectionStore((s) => s.activeSlide?.id ?? null);

  if (!slides || slides.length === 0) {
    return <ShowViewEmptyState />;
  }

  const { gridColumns } = useShowViewContext();

  return (
    <div className="flex flex-col gap-4 text-white/70 relative">
      <ShowViewSlideGridHeader title={title} />
      <div
        className="grid gap-4 p-5"
        style={{
          gridTemplateColumns: `repeat(${Math.max(MAX_GRID_COLUMNS - gridColumns, 1)}, 1fr)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn("overflow-hidden", {
              "ring-1 ring-amber-400": activeSlideId === slide.id,
              "hover:ring-2 hover:ring-white/30": activeSlideId !== slide.id,
            })}
          >
            <Slide
              id={slide.id}
              data={slide}
              canvasSize={canvasSize}
              onClick={() => setActiveSlide(slide.id, slide, canvasSize)}
            />
            <SlideTag index={index} slide={slide} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SlideTag = ({ index, slide }: { index: number; slide: SlideData }) => {
  const getMediaById = useMediaLibraryStore((s) => s.getMediaById);
  const videoBackgroundObject = slide.objects?.find(
    (obj) => obj.type === "video" && obj.videoType === "background"
  );

  let mediaName = null;

  if (videoBackgroundObject) {
    const mediaItem = getMediaById(videoBackgroundObject.id);
    mediaName = mediaItem?.name;
    const extension = mediaItem?.source.split(".").pop();
    if (extension) {
      mediaName = mediaName + "." + extension;
    }
  }

  return (
    <div className=" flex items-center justify-between bg-shade-lighter px-1 w-full">
      <p className="text-white text-xs">{index + 1}</p>
      {mediaName && <p className="text-white text-xs">{mediaName}</p>}
    </div>
  );
};
