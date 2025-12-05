import { PlaylistItem } from "@/components/presenter/types";
import { useEffect, useRef, useState } from "react";
import { PlaylistItemDraggable } from "./PlaylistItemDraggable";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";

export const PlaylistContentDragableGroup = ({
  items,
  sourcePlaylistId,
  selectedItemId,
  isFiltering,
  onSelect,
  onRemove,
  onReorder,
  onRemoveMultiple,
}: {
  items: PlaylistItem[];
  sourcePlaylistId: string;
  selectedItemId: string | null;
  isFiltering: boolean;
  onSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onReorder: (
    draggedItemId: string,
    targetItemId: string,
    position: "before" | "after"
  ) => void;
  onRemoveMultiple?: (ids: string[]) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  // Multi-select support
  const {
    selectedIds,
    isMultiSelectMode,
    handleItemClick,
    isSelected: isMultiSelected,
  } = useSidebarMultiSelect({
    type: "playlistItem",
    items,
    containerRef,
  });

  // Reset drop target when drag ends globally
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedItemId(null);
      setDropTarget(null);
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  // Clear drag state when items change (e.g., after cross-list drop)
  useEffect(() => {
    if (draggedItemId && !items.some((item) => item.id === draggedItemId)) {
      setDraggedItemId(null);
      setDropTarget(null);
    }
  }, [items, draggedItemId]);

  const handleDragStart = (
    itemId: string,
    _e: React.DragEvent<HTMLDivElement>
  ) => {
    setDraggedItemId(itemId);
    if (isMultiSelected(itemId) && selectedIds.length > 1) {
      return selectedIds;
    }
    return [itemId];
  };

  const handleDragOver = (e: React.DragEvent, targetItemId: string) => {
    // Don't show reorder indicators when filtering
    if (isFiltering) return;
    // Only handle reordering for items from the same playlist
    if (!draggedItemId) return;
    if (draggedItemId === targetItemId) {
      setDropTarget(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";

    setDropTarget({ id: targetItemId, position });
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId = e.dataTransfer.getData("itemId");
    const dragSourcePlaylistId = e.dataTransfer.getData("sourcePlaylistId");

    // Only reorder if dragging within the same playlist
    if (itemId && dragSourcePlaylistId === sourcePlaylistId && dropTarget) {
      onReorder(itemId, targetItemId, dropTarget.position);
    }

    setDropTarget(null);
    setDraggedItemId(null);
  };

  const handleRemove = (id: string) => {
    if (onRemoveMultiple) {
      if (isMultiSelected(id) && selectedIds.length > 1) {
        onRemoveMultiple(selectedIds);
      } else {
        onRemoveMultiple([id]);
      }
    } else {
      onRemove(id);
    }
  };

  const handleClick = (itemId: string, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      handleItemClick(itemId, e);
    } else {
      handleItemClick(itemId, e);
      onSelect(itemId);
    }
  };

  // Check if draggedItemId is still valid (item still exists in this list)
  const isDraggedItemInList = draggedItemId
    ? items.some((item) => item.id === draggedItemId)
    : false;

  return (
    <div ref={containerRef}>
      {items.map((item) => {
        const isItemMultiSelected = isMultiSelected(item.id);
        // Only show as dragging if the dragged item is still in this list
        const isDragging =
          isDraggedItemInList &&
          (draggedItemId === item.id || (draggedItemId && isItemMultiSelected));

        return (
          <PlaylistItemDraggable
            key={item.id}
            item={item}
            sourcePlaylistId={sourcePlaylistId}
            isSelected={selectedItemId === item.id}
            isMultiSelected={isItemMultiSelected && isMultiSelectMode}
            isDragging={!!isDragging}
            dropIndicator={
              dropTarget?.id === item.id ? dropTarget.position : null
            }
            onSelect={onSelect}
            onClick={handleClick}
            onRemove={handleRemove}
            selectedCount={isItemMultiSelected ? selectedIds.length : 0}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
};
