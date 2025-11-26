import { Slide } from "@/components/feature/slide/Slide";
import {
  MediaItem,
  selectSelectedMediaId,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { mediaItemToSlideData } from "@/stores/utils/mediaItemToSlideData";
import { usePlaylistStore } from "@/stores/presenterStore";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useContextMenu } from "./hooks/use-context-menu";

export type MediaLibraryItemProps = {
  mediaItem: MediaItem;
};

export const MediaLibraryItem = ({ mediaItem }: MediaLibraryItemProps) => {
  const selectedMediaId = useMediaLibraryStore(selectSelectedMediaId);
  const selectMedia = useMediaLibraryStore((state) => state.selectMedia);
  const removeMediaItem = useMediaLibraryStore(
    (state) => state.removeMediaItem
  );
  const playlists = usePlaylistStore((s) => s.playlists);
  const addMediaItemToPlaylist = usePlaylistStore(
    (s) => s.addMediaItemToPlaylist
  );
  const isSelected = selectedMediaId === mediaItem.id;

  const handleAddToPlaylist = (playlistId: string) => {
    addMediaItemToPlaylist(playlistId, mediaItem);
  };

  const handleDelete = async () => {
    const confirmed = await confirm(
      `Are you sure you want to delete "${mediaItem.name}"? This action cannot be undone.`,
      { title: "Delete Media Item", kind: "warning" }
    );

    if (confirmed) {
      removeMediaItem(mediaItem.id);
    }
  };

  const { openContextMenu } = useContextMenu({
    onDelete: handleDelete,
    onAddToPlaylist: handleAddToPlaylist,
    id: mediaItem.id,
    playlists: playlists,
  });

  return (
    <button
      onClick={() => selectMedia(mediaItem.id)}
      onContextMenu={(e) => openContextMenu(e)}
      className={`flex flex-col gap-2 p-2 rounded-md transition-colors cursor-pointer h-min shrink-0 ${
        isSelected ? "bg-white/20 ring-2 ring-white/40" : "hover:bg-white/10"
      }`}
      style={{ flexBasis: "clamp(200px, calc((100% - 5rem) / 4), 300px)" }}
    >
      <Slide id={mediaItem.id} data={mediaItemToSlideData(mediaItem)} />
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
