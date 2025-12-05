import { useEffect, useRef, useState } from "react";
import { SlideGroup } from "../../../types";
import { LibraryItemDraggable } from "./LibraryItemDraggable";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";

type LibraryContentDraggableGroupProps = {
  slideGroups: SlideGroup[];
  libraryId: string;
  selectedSlideGroupId: string | null;
  isFiltering: boolean;
  onSelect: (slideGroupId: string) => void;
  onReorder: (
    draggedId: string,
    targetId: string,
    position: "before" | "after"
  ) => void;
  onDeleteMultiple?: (ids: string[]) => void;
};

export const LibraryContentDraggableGroup = ({
  slideGroups,
  libraryId,
  selectedSlideGroupId,
  isFiltering,
  onSelect,
  onReorder,
  onDeleteMultiple,
}: LibraryContentDraggableGroupProps) => {
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
    type: "libraryItem",
    items: slideGroups,
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
    if (draggedItemId && !slideGroups.some((sg) => sg.id === draggedItemId)) {
      setDraggedItemId(null);
      setDropTarget(null);
    }
  }, [slideGroups, draggedItemId]);

  const handleDragStart = (
    itemId: string,
    _e: React.DragEvent<HTMLDivElement>
  ) => {
    setDraggedItemId(itemId);
    // Return selected IDs if this item is part of multi-selection
    if (isMultiSelected(itemId) && selectedIds.length > 1) {
      return selectedIds;
    }
    return [itemId];
  };

  const handleDragOver = (e: React.DragEvent, targetItemId: string) => {
    // Don't show reorder indicators when filtering
    if (isFiltering) return;
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

    const slideGroupId = e.dataTransfer.getData("slideGroupId");
    const sourceLibraryId = e.dataTransfer.getData("sourceLibraryId");

    // Only reorder if dragging within the same library
    if (slideGroupId && sourceLibraryId === libraryId && dropTarget) {
      onReorder(slideGroupId, targetItemId, dropTarget.position);
    }

    setDropTarget(null);
    setDraggedItemId(null);
  };

  const handleDelete = (id: string) => {
    if (onDeleteMultiple) {
      if (isMultiSelected(id) && selectedIds.length > 1) {
        onDeleteMultiple(selectedIds);
      } else {
        onDeleteMultiple([id]);
      }
    }
  };

  const handleClick = (slideGroupId: string, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      handleItemClick(slideGroupId, e);
    } else {
      // Clear multi-selection and do normal select
      handleItemClick(slideGroupId, e);
      onSelect(slideGroupId);
    }
  };

  // Check if draggedItemId is still valid (item still exists in this list)
  const isDraggedItemInList = draggedItemId
    ? slideGroups.some((sg) => sg.id === draggedItemId)
    : false;

  return (
    <div ref={containerRef}>
      {slideGroups.map((slideGroup) => {
        const isItemMultiSelected = isMultiSelected(slideGroup.id);
        // Only show as dragging if the dragged item is still in this list
        const isDragging =
          isDraggedItemInList &&
          (draggedItemId === slideGroup.id ||
            (draggedItemId && isItemMultiSelected));

        return (
          <LibraryItemDraggable
            key={slideGroup.id}
            slideGroup={slideGroup}
            libraryId={libraryId}
            isSelected={selectedSlideGroupId === slideGroup.id}
            isMultiSelected={isItemMultiSelected && isMultiSelectMode}
            isDragging={!!isDragging}
            dropIndicator={
              dropTarget?.id === slideGroup.id ? dropTarget.position : null
            }
            onSelect={onSelect}
            onClick={handleClick}
            onDelete={handleDelete}
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
