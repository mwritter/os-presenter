import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { SlideData } from "./types";

export const SlideTag = ({
  index,
  slide,
  name,
}: {
  index: number;
  slide: SlideData;
  name?: string;
}) => {
  const videoBackgroundObject = slide.objects?.find(
    (obj) => obj.type === "video" && obj.videoType === "background"
  );

  return videoBackgroundObject ? (
    <SlideTagWithVideoBackground index={index} slide={slide} />
  ) : (
    <SlideTagBase index={index} name={name} />
  );
};

const SlideTagBase = ({
  index,
  children,
  name,
}: {
  index: number;
  children?: React.ReactNode;
  name?: string;
}) => {
  return (
    <div className="flex items-center justify-between bg-shade-lighter px-1 w-full h-6 select-none">
      <p className="text-white text-xs">{index + 1}</p>
      {name && <p className="text-white text-xs">{name}</p>}
      {children}
    </div>
  );
};

const SlideTagWithVideoBackground = ({
  index,
  slide,
}: {
  index: number;
  slide: SlideData;
}) => {
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
    <SlideTagBase index={index}>
      {mediaName && <p className="text-white text-xs">{mediaName}</p>}
    </SlideTagBase>
  );
};
