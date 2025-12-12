import { useEffect, useState } from "react";

export function useItemReorder<T extends { id: string }>({
  items,
  onReorder,
  active = true,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  active?: boolean;
}) {
  const [orderedItems, setOrderedItems] = useState<T[]>([]);

  useEffect(() => {
    setOrderedItems(items);
  }, [items, active]);

  const handleReorder = (
    draggedItemIds: string | string[],
    targetItemId: string | null,
    position: "before" | "after" | "end"
  ) => {
    if (!active) return;

    // Normalize to array
    const idsToMove = Array.isArray(draggedItemIds)
      ? draggedItemIds
      : [draggedItemIds];

    // Get the items being dragged in their current order
    const draggedItems = idsToMove
      .map((id) => orderedItems.find((item) => item.id === id))
      .filter((item): item is T => item !== undefined);

    if (draggedItems.length === 0) return;

    // Remove all dragged items from the list
    const newItems = orderedItems.filter(
      (item) => !idsToMove.includes(item.id)
    );

    let insertIndex: number;

    if (position === "end" || targetItemId === null) {
      // Drop at end
      insertIndex = newItems.length;
    } else {
      const targetIndex = orderedItems.findIndex(
        (item) => item.id === targetItemId
      );
      if (targetIndex === -1) return;

      // Don't reorder if dropping on one of the dragged items
      if (idsToMove.includes(targetItemId)) return;

      // Find the new target index (after removing dragged items)
      const newTargetIndex = newItems.findIndex(
        (item) => item.id === targetItemId
      );
      if (newTargetIndex === -1) return;

      insertIndex = position === "after" ? newTargetIndex + 1 : newTargetIndex;
    }

    // Insert all dragged items at the new position
    newItems.splice(insertIndex, 0, ...draggedItems);

    // Update order property
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setOrderedItems(reorderedItems);
    onReorder(reorderedItems);
  };

  return {
    orderedItems,
    handleReorder,
  };
}
