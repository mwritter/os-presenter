import { useMediaLibraryStore } from "@/stores/presenter/mediaLibraryStore";
import { SlideData, ImageObject, VideoObject } from "../types";
import { cn } from "@/lib/utils";
import { selectTagGroupById, useSettingsStore } from "@/stores/settings/settingsStore";

// TODO: Create a way for users to create 'slide tag groups' and the UI
// a 'slide tag group' will be a label and a color
// This slide tag group should be on the slide data itself, each slide can have a tag group

export const SlideTag = ({
  index,
  slide,
  name,
  showTagGroupName,
}: {
  index: number;
  slide: SlideData;
  name?: string;
  showTagGroupName: boolean;
}) => {
  const getMediaById = useMediaLibraryStore((s) => s.getMediaById);
  const tagGroup = useSettingsStore(selectTagGroupById(slide.tagGroup?.id));
  
  // Debug: Log when tagGroup changes
  console.log("SlideTag render:", { slideTagGroupId: slide.tagGroup?.id, tagGroup });
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
        "absolute bottom-0 left-0 right-0 flex items-center px-1 bg-shade-lighter gap-2",
        slide.tagGroup ? `` : "bg-shade-lighter"
      )}
      style={{
        backgroundColor: tagGroup?.color,
      }}
    >
      <div className="flex items-center gap-1">
        <p className="text-white text-xs shrink-0">{index + 1}</p>
        {showTagGroupName && (
          <p className="text-white text-xs shrink-0">{slide.tagGroup?.name}</p>
        )}
      </div>
      {mediaName && (
        <span className="text-white text-xs truncate min-w-0 text-right flex-1">
          {mediaName}
        </span>
      )}
    </div>
  );
};
