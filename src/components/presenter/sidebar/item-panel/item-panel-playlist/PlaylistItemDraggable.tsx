import { cn } from "@/lib/utils";
import { PlaylistContentItem } from "./PlaylistContentItem";
import { usePlaylistDrag } from "./hooks/use-playlist-drag";
import { useItemPanelPlaylistContext } from "./context";
import { PlaylistItem } from "@/components/presenter/types";

type PlaylistItemDraggableProps = {
  item: PlaylistItem;
};

export const PlaylistItemDraggable = ({ item }: PlaylistItemDraggableProps) => {
  const {
    items,
    isSelected,
    selectedIds,
    isMultiSelectMode,
    handleReorder,
    handleDelete,
    handleClick,
  } = useItemPanelPlaylistContext();
  const isItemSelected = isSelected(item.id);
  const { onDragStart, onDragOver, onDrop, isDragging, dropTarget } =
    usePlaylistDrag({
      items,
      itemId: item.id,
      isSelected: isItemSelected,
      selectedIds,
      onReorder: handleReorder,
    });

  return (
    <div
      className={cn("relative ghost-no-bg ghost-no-ring py-0.5", {
        "opacity-50": isDragging,
        "bg-white/20 ring-1 ring-white/40":
          isItemSelected && !isDragging && !isMultiSelectMode,
        "bg-blue-600": isItemSelected && !isDragging && isMultiSelectMode,
      })}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drop indicator line - before */}
      {dropTarget?.position === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
      )}

      <PlaylistContentItem
        item={item}
        onClick={handleClick}
        onDelete={handleDelete}
      />

      {/* Drop indicator line - after */}
      {dropTarget?.position === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
      )}
    </div>
  );
};
