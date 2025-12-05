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
    draggedItemId: string,
    targetItemId: string,
    position: "before" | "after"
  ) => {
    if (!active) return;

    const draggedIndex = orderedItems.findIndex(
      (item) => item.id === draggedItemId
    );
    const targetIndex = orderedItems.findIndex(
      (item) => item.id === targetItemId
    );

    if (draggedIndex === -1 || targetIndex === -1) return;
    if (draggedIndex === targetIndex) return;

    const newItems = [...orderedItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);

    // Calculate new index after removal
    let insertIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      insertIndex = position === "after" ? targetIndex : targetIndex - 1;
    } else {
      insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
    }

    newItems.splice(insertIndex, 0, draggedItem);

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
