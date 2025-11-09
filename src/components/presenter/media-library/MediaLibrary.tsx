import { IconButton } from "@/components/feature/icon-button/IconButton";
import { Slide } from "@/components/feature/slide/Slide";
import {
  MediaItem,
  mediaItemToSlideData,
  selectMediaItems,
  selectSelectedMediaId,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { ArrowDown, Plus, Loader2 } from "lucide-react";
import { useImportMedia } from "./hooks/use-import-media";
import { Button } from "@/components/ui/button";

// TODO: Media library should take into account a canvas size (maybe just Full HD by default)
// and look into using the new slide object data for images and videos

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

const MediaLibraryItem = ({ mediaItem }: { mediaItem: MediaItem }) => {
  const selectedMediaId = useMediaLibraryStore(selectSelectedMediaId);
  const selectMedia = useMediaLibraryStore((state) => state.selectMedia);
  const isSelected = selectedMediaId === mediaItem.id;

  return (
    <button
      onClick={() => selectMedia(mediaItem.id)}
      className={`flex flex-col gap-2 p-2 rounded-md transition-colors cursor-pointer h-min shrink-0 ${
        isSelected ? "bg-white/20 ring-2 ring-white/40" : "hover:bg-white/10"
      }`}
      style={{ flexBasis: "clamp(200px, calc((100% - 5rem) / 4), 300px)" }}
    >
      <Slide
        id={mediaItem.id}
        data={mediaItemToSlideData(mediaItem)}
        as={"div"}
      />
      <div className="flex flex-col items-start gap-0.5 w-full ml-2">
        <div className="text-white text-[8px] font-medium truncate w-full text-left">
          {mediaItem.name}
        </div>
        <div className="text-white/60 text-[8px]">
          {mediaItem.createdAt.toLocaleDateString()}
        </div>
      </div>
    </button>
  );
};

const MediaLibraryEmpty = () => {
  const { isImporting, handleImport } = useImportMedia();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <IconButton
        className="bg-white/10 hover:bg-white/20 text-white"
        label={isImporting ? "Importing..." : "Import Media"}
        Icon={isImporting ? Loader2 : ArrowDown}
        size="lg"
        onClick={handleImport}
        disabled={isImporting}
      />
    </div>
  );
};

const MediaLibraryHeader = () => {
  return (
    <div className="flex w-full bg-shade-4 h-10 items-center justify-between px-3"></div>
  );
};

const MediaLibraryFooter = () => {
  const { isImporting, handleImport } = useImportMedia();

  return (
    <div className="flex w-full h-10 items-center justify-between bg-shade-3 px-2">
      <Button
        className="text-gray-400 rounded-sm hover:text-gray-400 hover:bg-white/10"
        variant="ghost"
        size="icon-xs"
        onClick={handleImport}
        disabled={isImporting}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
