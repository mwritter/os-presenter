import {
  selectMediaItems,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { MediaLibraryFooter } from "./MediaLibraryFooter";
import { MediaLibraryHeader } from "./MediaLibraryHeader";
import { MediaLibraryEmpty } from "./MediaLibraryEmpty";
import { MediaLibraryItem } from "./MediaLibraryItem";

export const MediaLibrary = () => {
  const mediaItems = useMediaLibraryStore(selectMediaItems);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full w-full">
      <MediaLibraryHeader />

      <div className="flex flex-wrap gap-4 p-5">
        {mediaItems.length > 0 ? (
          mediaItems.map((mediaItem) => (
            <MediaLibraryItem key={mediaItem.id} mediaItem={mediaItem} />
          ))
        ) : (
          <MediaLibraryEmpty />
        )}
      </div>
      <MediaLibraryFooter />
    </div>
  );
};
