import { cn } from "@/lib/utils";
import { createDragGhost, createMultiItemDragGhost } from "@/lib/drag-utils";
import { SlideGroup } from "../../../types";
import { LibraryContentItem } from "./LibraryContentItem";

type LibraryItemDraggableProps = {
  slideGroup: SlideGroup;
  libraryId: string;
  isSelected: boolean;
  isMultiSelected?: boolean;
  isDragging: boolean;
  dropIndicator: "before" | "after" | null;
  onSelect: (slideGroupId: string) => void;
  onClick?: (slideGroupId: string, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  selectedCount?: number;
  onDragStart: (itemId: string, e: React.DragEvent<HTMLDivElement>) => string[];
  onDragOver: (e: React.DragEvent, targetItemId: string) => void;
  onDrop: (e: React.DragEvent, targetItemId: string) => void;
};

export const LibraryItemDraggable = ({
  slideGroup,
  libraryId,
  isSelected,
  isMultiSelected = false,
  isDragging,
  dropIndicator,
  onSelect,
  onClick,
  onDelete,
  selectedCount = 0,
  onDragStart,
  onDragOver,
  onDrop,
}: LibraryItemDraggableProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const draggedIds = onDragStart(slideGroup.id, e);

    if (draggedIds.length > 1) {
      createMultiItemDragGhost(e, e.currentTarget, draggedIds.length);
      e.dataTransfer.setData("slideGroupIds", JSON.stringify(draggedIds));
    } else {
      createDragGhost(e, e.currentTarget);
    }

    e.dataTransfer.setData("type", "slideGroup");
    e.dataTransfer.setData("slideGroupId", slideGroup.id);
    e.dataTransfer.setData("sourceLibraryId", libraryId);
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
        onDragOver(e, slideGroup.id);
      }}
      onDrop={(e) => onDrop(e, slideGroup.id)}
    >
      {/* Drop indicator line - before */}
      {dropIndicator === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
      )}

      <LibraryContentItem
        isDragging={isDragging}
        onClick={onClick ? () => {} : onSelect}
        onMultiSelectClick={onClick}
        onDelete={onDelete}
        selectedCount={selectedCount}
        slideGroup={slideGroup}
      />

      {/* Drop indicator line - after */}
      {dropIndicator === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
      )}
    </div>
  );
};
