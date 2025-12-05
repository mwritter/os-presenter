import { PlaylistItem } from "@/components/presenter/types";
import { createDragGhost, createMultiItemDragGhost } from "@/lib/drag-utils";
import { cn } from "@/lib/utils";
import { PlaylistContentItem } from "./PlaylistContentItem";

export const PlaylistItemDraggable = ({
  item,
  sourcePlaylistId,
  isSelected,
  isMultiSelected = false,
  isDragging,
  dropIndicator,
  onSelect,
  onClick,
  onRemove,
  selectedCount = 0,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: PlaylistItem;
  sourcePlaylistId: string;
  isSelected: boolean;
  isMultiSelected?: boolean;
  isDragging: boolean;
  dropIndicator: "before" | "after" | null;
  onSelect: (itemId: string) => void;
  onClick?: (itemId: string, e: React.MouseEvent) => void;
  onRemove: (itemId: string) => void;
  selectedCount?: number;
  onDragStart: (itemId: string, e: React.DragEvent<HTMLDivElement>) => string[];
  onDragOver: (e: React.DragEvent, targetItemId: string) => void;
  onDrop: (e: React.DragEvent, targetItemId: string) => void;
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const draggedIds = onDragStart(item.id, e);

    if (draggedIds.length > 1) {
      createMultiItemDragGhost(e, e.currentTarget, draggedIds.length);
      e.dataTransfer.setData("itemIds", JSON.stringify(draggedIds));
    } else {
      createDragGhost(e, e.currentTarget);
    }

    e.dataTransfer.setData("type", "playlistItem");
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("sourcePlaylistId", sourcePlaylistId);
    e.dataTransfer.setData("application/x-item-drop", "true");
  };

  return (
    <div
      className={cn("relative ghost-no-bg ghost-no-ring", {
        "opacity-50": isDragging,
        "bg-white/20 ring-1 ring-white/40":
          isSelected && !isDragging && !isMultiSelected,
        "bg-blue-600": isMultiSelected && !isDragging,
      })}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, item.id);
      }}
      onDrop={(e) => onDrop(e, item.id)}
    >
      {/* Drop indicator line - before */}
      {dropIndicator === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
      )}

      <PlaylistContentItem
        item={item}
        title={item.slideGroup.title}
        onSelect={onSelect}
        onClick={onClick}
        onRemove={onRemove}
        selectedCount={selectedCount}
      />

      {/* Drop indicator line - after */}
      {dropIndicator === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
      )}
    </div>
  );
};
