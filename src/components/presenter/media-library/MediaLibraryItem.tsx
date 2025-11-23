import { Slide } from "@/components/feature/slide/Slide";
import {
  MediaItem,
  selectSelectedMediaId,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { mediaItemToSlideData } from "@/stores/utils/mediaItemToSlideData";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { usePlaylistStore } from "@/stores/presenterStore";
import { Trash2 } from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => selectMedia(mediaItem.id)}
          className={`flex flex-col gap-2 p-2 rounded-md transition-colors cursor-pointer h-min shrink-0 ${
            isSelected
              ? "bg-white/20 ring-2 ring-white/40"
              : "hover:bg-white/10"
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 dark">
        <ContextMenuSub>
          <ContextMenuSubTrigger>Add To</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 dark">
            <ContextMenuLabel>Playlists</ContextMenuLabel>
            {playlists.length === 0 ? (
              <ContextMenuItem disabled>No playlists available</ContextMenuItem>
            ) : (
              playlists.map((playlist) => (
                <ContextMenuItem
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  {playlist.name}
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-red-500"
          onSelect={(e) => {
            e.preventDefault();
            // Use setTimeout to ensure the context menu closes first
            setTimeout(() => {
              handleDelete();
            }, 0);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
