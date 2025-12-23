import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import { SlideData, ImageObject, VideoObject } from "./types";
import { cn } from "@/lib/utils";

export const SlideTag = ({
  index,
  slide,
  showSelectionUI = false,
  name,
}: {
  index: number;
  slide: SlideData;
  showSelectionUI: boolean;
  name?: string;
}) => {
  const getMediaById = useMediaLibraryStore((s) => s.getMediaById);

  // Find background media (video or image from media library)
  const backgroundMediaObject = slide.objects?.find(
    (obj) =>
      (obj.type === "video" &&
        (obj as VideoObject).videoType === "background") ||
      (obj.type === "image" && (obj as ImageObject).imageType === "background")
  );

  let mediaName = name ?? undefined;

  if (backgroundMediaObject) {
    const mediaItem = getMediaById(backgroundMediaObject.id);
    mediaName = mediaItem?.name;
    const extension = mediaItem?.source.split(".").pop();
    if (extension) {
      mediaName = mediaName + "." + extension;
    }
  }

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 flex items-center px-1 transition-colors gap-2",
        showSelectionUI ? "bg-selected/30" : "bg-shade-lighter"
      )}
    >
      <p className="text-white text-xs shrink-0">{index + 1}</p>
      {mediaName && (
        <span className="text-white text-xs truncate min-w-0 text-right flex-1">
          {mediaName}
        </span>
      )}
    </div>
  );
};
