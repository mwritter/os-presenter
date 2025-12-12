import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useRef } from "react";

interface UseSortableListOptions<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  /** IDs of currently selected items for multi-select drag */
  selectedIds?: string[];
  /** Whether reordering is disabled (e.g., when filtering) */
  disabled?: boolean;
}

interface UseSortableListReturn<T extends { id: string }> {
  /** Items in their current order */
  sortedItems: T[];
  /** Currently dragging item ID */
  activeId: string | null;
  /** IDs being dragged (for multi-select) */
  draggedIds: string[];
  /** Handle drag start */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handle drag end with reorder */
  handleDragEnd: (event: DragEndEvent) => void;
  /** Check if an item is being dragged */
  isDragging: (id: string) => boolean;
}

/**
 * Hook for managing sortable list state and reordering
 */
export function useSortableList<T extends { id: string }>({
  items,
  onReorder,
  selectedIds = [],
  disabled = false,
}: UseSortableListOptions<T>): UseSortableListReturn<T> {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedIds, setDraggedIds] = useState<string[]>([]);
  
  // Keep ref to items for use in callbacks
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return;

    const id = event.active.id as string;
    setActiveId(id);

    // If dragging a selected item, drag all selected items
    if (selectedIds.includes(id) && selectedIds.length > 1) {
      setDraggedIds(selectedIds);
    } else {
      setDraggedIds([id]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedIds([]);

    if (disabled || !over || active.id === over.id) {
      return;
    }

    const currentItems = itemsRef.current;
    const activeIndex = currentItems.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = currentItems.findIndex((item) => item.id === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    // Handle multi-select reorder
    if (draggedIds.length > 1) {
      const itemsToMove = currentItems.filter((item) =>
        draggedIds.includes(item.id)
      );
      const remainingItems = currentItems.filter(
        (item) => !draggedIds.includes(item.id)
      );

      // Find the new target index in the remaining items
      const targetItem = currentItems[overIndex];
      const newTargetIndex = remainingItems.findIndex(
        (item) => item.id === targetItem.id
      );

      if (newTargetIndex === -1) {
        // Target is one of the dragged items, skip
        return;
      }

      // Insert at the target position
      const newItems = [
        ...remainingItems.slice(0, newTargetIndex),
        ...itemsToMove,
        ...remainingItems.slice(newTargetIndex),
      ];

      // Update order property
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onReorder(reorderedItems);
    } else {
      // Single item reorder
      const newItems = arrayMove(currentItems, activeIndex, overIndex);

      // Update order property
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onReorder(reorderedItems);
    }
  };

  const isDragging = (id: string) => {
    if (!activeId) return false;
    return draggedIds.includes(id);
  };

  return {
    sortedItems: items,
    activeId,
    draggedIds,
    handleDragStart,
    handleDragEnd,
    isDragging,
  };
}

