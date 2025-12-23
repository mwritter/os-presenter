import { Slide } from "@/components/feature/slide/Slide";
import {
  MediaItem,
  selectSelectedMediaId,
  selectSelectedPlaylistId,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { mediaItemToSlideData } from "@/stores/utils/mediaItemToSlideData";
import { usePlaylistStore } from "@/stores/presenterStore";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useContextMenu } from "./hooks/use-content-item-context-menu";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { AppDragData } from "@/components/dnd/AppDndProvider";
import { SlideTag } from "@/components/feature/slide/SlideTag";

export type MediaLibraryItemProps = {
  index: number;
  mediaItem: MediaItem;
  playlistId: string;
  isDragging?: boolean;
  dropPosition?: "before" | "after" | null;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  selectedIds?: string[];
  onClick?: (e: React.MouseEvent) => void;
  registerRef?: (mediaId: string, element: HTMLElement | null) => void;
};

export const MediaLibraryItem = ({
  index,
  mediaItem,
  playlistId,
  isDragging = false,
  dropPosition = null,
  isSelected = false,
  isMultiSelectMode = false,
  selectedIds = [],
  onClick,
  registerRef,
}: MediaLibraryItemProps) => {
  const selectedMediaId = useMediaLibraryStore(selectSelectedMediaId);
  const selectedPlaylistId = useMediaLibraryStore(selectSelectedPlaylistId);
  const removeMediaFromPlaylist = useMediaLibraryStore(
    (state) => state.removeMediaFromPlaylist
  );
  const playlists = usePlaylistStore((s) => s.playlists);
  const addMediaItemToPlaylist = usePlaylistStore(
    (s) => s.addMediaItemToPlaylist
  );
  const isActive = selectedMediaId === mediaItem.id;
  // Show multi-select UI when in multi-select mode AND this item is selected
  const showMultiSelectUI = isMultiSelectMode && isSelected;

  const dragData: AppDragData = {
    type: "mediaItem",
    sourceId: playlistId,
    mediaPlaylistId: playlistId,
    mediaItem,
    selectedIds: selectedIds.includes(mediaItem.id) ? selectedIds : undefined,
  };

  const { attributes, listeners, setNodeRef } = useSortable({
    id: mediaItem.id,
    data: dragData,
  });

  const handleAddToPlaylist = (playlistId: string) => {
    addMediaItemToPlaylist(playlistId, mediaItem);
  };

  const handleDelete = async () => {
    if (!selectedPlaylistId) return;

    const confirmed = await confirm(
      `Are you sure you want to delete "${mediaItem.name}"? This action cannot be undone.`,
      { title: "Delete Media Item", kind: "warning" }
    );

    if (confirmed) {
      removeMediaFromPlaylist(selectedPlaylistId, mediaItem.id);
    }
  };

  const { openContextMenu } = useContextMenu({
    onDelete: handleDelete,
    onAddToPlaylist: handleAddToPlaylist,
    id: mediaItem.id,
    playlists: playlists,
  });

  // Combined ref handler for sortable and lasso selection
  const handleRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    registerRef?.(mediaItem.id, el);
  };

  return (
    <div
      ref={handleRef}
      data-media-item
      onClick={onClick}
      onContextMenu={(e) => openContextMenu(e)}
      className={cn("cursor-pointer h-min shrink-0 relative", {
        "opacity-50": isDragging,
      })}
      style={{ flexBasis: "clamp(200px, calc((100% - 5rem) / 4), 300px)" }}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator - before (left side) */}
      {dropPosition === "before" && (
        <div className="absolute -left-[10px] top-0 bottom-0 w-1 bg-selected z-10 rounded-full" />
      )}

      <div
        className={cn("overflow-hidden transition-all duration-75 relative pb-5", {
          "ring-2 ring-amber-400": isActive && !showMultiSelectUI,
          "ring-2 ring-blue-500": showMultiSelectUI,
          "hover:ring-2 hover:ring-white/30": !isSelected && !isActive,
        })}
      >
        <Slide id={mediaItem.id} data={mediaItemToSlideData(mediaItem)} />
        <SlideTag
          index={index}
          slide={mediaItemToSlideData(mediaItem)}
          name={mediaItem.name}
          showSelectionUI={showMultiSelectUI}
        />
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-0.5 w-full text-[8px] text-muted-foreground transition-colors",
          showMultiSelectUI ? "bg-selected/30" : "bg-shade-lighter"
        )}
      ></div>

      {/* Drop indicator - after (right side) */}
      {dropPosition === "after" && (
        <div className="absolute -right-[10px] top-0 bottom-0 w-1 bg-selected z-10 rounded-full" />
      )}
    </div>
  );
};
