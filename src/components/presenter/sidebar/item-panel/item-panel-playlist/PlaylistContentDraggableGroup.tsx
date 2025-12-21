import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { PlaylistContentItem } from "./PlaylistContentItem";
import { useItemPanelPlaylistContext } from "./context";
import { useItemPanelContext } from "../context";
import { cn } from "@/lib/utils";
import { PlaylistItem } from "@/components/presenter/types";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";
import { MediaItemDropZone } from "./MediaItemDropZone";

export const PlaylistContentDraggableGroup = () => {
  const {
    items,
    playlistId,
    selectedIds,
    isSelected,
    isMultiSelectMode,
    handleClick,
    handleDelete,
  } = useItemPanelPlaylistContext();
  const { filter } = useItemPanelContext();
  const { activeId, activeData, overId, dropPosition } = useAppDnd();

  // Disable sorting when filtering
  const isSortingDisabled = !!filter;

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
      disabled={isSortingDisabled}
    >
      <div className="flex flex-col flex-1 relative">
        <ul>
          {items.map((playlistItem) => {
            const isDragging =
              activeId === playlistItem.id ||
              (activeData?.selectedIds?.includes(playlistItem.id) ?? false);

            // Get drop position when another playlist item is dragged over this one
            const isValidPlaylistItemDrop =
              overId === playlistItem.id &&
              activeData?.type === "playlistItem" &&
              activeData?.sourceId === playlistId &&
              !isDragging;

            // Also show drop indicator for media item drops
            const isValidMediaItemDrop =
              overId === playlistItem.id &&
              activeData?.type === "mediaItem" &&
              !isDragging;

            const itemDropPosition =
              isValidPlaylistItemDrop || isValidMediaItemDrop
                ? dropPosition
                : null;

            return (
              <SortablePlaylistItem
                key={playlistItem.id}
                playlistItem={playlistItem}
                playlistId={playlistId!}
                selectedIds={selectedIds}
                isSelected={isSelected(playlistItem.id)}
                isMultiSelectMode={isMultiSelectMode}
                isDragging={isDragging}
                dropPosition={itemDropPosition}
                onClick={handleClick}
                onDelete={handleDelete}
              />
            );
          })}
        </ul>
        {/* Drop zone for media items (and playlist items) */}
        {playlistId && !isSortingDisabled && (
          <MediaItemDropZone playlistId={playlistId} />
        )}
      </div>
    </SortableContext>
  );
};

interface SortablePlaylistItemProps {
  playlistItem: PlaylistItem;
  playlistId: string;
  selectedIds: string[];
  isSelected: boolean;
  isMultiSelectMode: boolean;
  isDragging: boolean;
  dropPosition: "before" | "after" | null;
  onClick: (itemId: string, e: React.MouseEvent) => void;
  onDelete: () => void;
}

const SortablePlaylistItem = ({
  playlistItem,
  playlistId,
  selectedIds,
  isSelected,
  isMultiSelectMode,
  isDragging,
  dropPosition,
  onClick,
  onDelete,
}: SortablePlaylistItemProps) => {
  const dragData: AppDragData = {
    type: "playlistItem",
    sourceId: playlistId,
    item: playlistItem,
    selectedIds: selectedIds.includes(playlistItem.id)
      ? selectedIds
      : undefined,
  };

  const { attributes, listeners, setNodeRef: setSortableRef } = useSortable({
    id: playlistItem.id,
    data: dragData,
  });

  // Make this item a droppable for media items
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: playlistItem.id,
    data: dragData,
  });

  // Combined ref handler
  const handleRef = (el: HTMLLIElement | null) => {
    setSortableRef(el);
    setDroppableRef(el);
  };

  return (
    <li
      ref={handleRef}
      className={cn("relative ghost-no-bg ghost-no-ring py-0.5", {
        "opacity-50": isDragging,
        "bg-white/20 ring-1 ring-white/40":
          isSelected && !isDragging && !isMultiSelectMode,
        "bg-blue-600": isSelected && !isDragging && isMultiSelectMode,
      })}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator line - before */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}

      <PlaylistContentItem
        item={playlistItem}
        onClick={onClick}
        onDelete={onDelete}
      />

      {/* Drop indicator line - after */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
