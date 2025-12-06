import { createDragGhost, createMultiItemDragGhost } from "@/lib/drag-utils";
import { useEffect, useState } from "react";
import { useItemPanelContext } from "@/components/presenter/sidebar/item-panel/context";

interface DataTransferConfig {
  /** The type identifier (e.g., "slideGroup", "playlistItem") */
  type: string;
  /** Key for single item ID (e.g., "slideGroupId", "itemId") */
  itemIdKey: string;
  /** Key for multiple item IDs (e.g., "slideGroupIds", "itemIds") */
  itemIdsKey: string;
  /** Key for source container ID (e.g., "sourceLibraryId", "sourcePlaylistId") */
  sourceIdKey: string;
}

interface UsePanelItemDragOptions<T extends { id: string }> {
  /** All items in the list */
  items: T[];
  /** The ID of this specific item */
  itemId: string;
  /** Whether this item is currently selected */
  isSelected: boolean;
  /** All currently selected item IDs */
  selectedIds: string[];
  /** The source container ID (library ID or playlist ID) */
  sourceId: string;
  /** Shared drag state from context */
  dragState: {
    draggedItemId: string | null;
    setDraggedItemId: (id: string | null) => void;
  };
  /** Data transfer configuration */
  dataTransfer: DataTransferConfig;
  /** Callback when items are reordered */
  onReorder: (
    draggedItemIds: string | string[],
    targetItemId: string,
    position: "before" | "after"
  ) => void;
}

export function usePanelItemDrag<T extends { id: string }>({
  items,
  itemId,
  isSelected,
  selectedIds,
  sourceId,
  dragState,
  dataTransfer,
  onReorder,
}: UsePanelItemDragOptions<T>) {
  const { draggedItemId, setDraggedItemId } = dragState;
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  const { filter } = useItemPanelContext();

  const isDragging = draggedItemId === itemId || (draggedItemId && isSelected);

  const getDraggedIds = () => {
    setDraggedItemId(itemId);
    // Return selected IDs if this item is part of multi-selection
    if (isSelected && selectedIds.length > 1) {
      return selectedIds;
    }
    return [itemId];
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const draggedIds = getDraggedIds();

    if (draggedIds.length > 1) {
      createMultiItemDragGhost(e, e.currentTarget, draggedIds.length);
      e.dataTransfer.setData(dataTransfer.itemIdsKey, JSON.stringify(draggedIds));
    } else {
      createDragGhost(e, e.currentTarget);
    }

    e.dataTransfer.setData("type", dataTransfer.type);
    e.dataTransfer.setData(dataTransfer.itemIdKey, itemId);
    e.dataTransfer.setData(dataTransfer.sourceIdKey, sourceId);
    e.dataTransfer.setData("application/x-item-drop", "true");
  };

  const onDragOver = (e: React.DragEvent) => {
    // Don't show reorder indicators when filtering
    if (!!filter) return;
    if (!draggedItemId) return;

    // Check if we're in a multi-select drag
    const isMultiSelectDrag =
      selectedIds.length > 1 && selectedIds.includes(draggedItemId);

    // Don't show drop indicator on any of the items being dragged
    if (isMultiSelectDrag) {
      if (selectedIds.includes(itemId)) {
        setDropTarget(null);
        return;
      }
    } else if (draggedItemId === itemId) {
      // Single drag: don't drop on itself
      setDropTarget(null);
      return;
    }

    // CRITICAL: Must call preventDefault to allow drop
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";

    setDropTarget({ id: itemId, position });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const dragSourceId = e.dataTransfer.getData(dataTransfer.sourceIdKey);

    // Only reorder if dragging within the same source container
    if (dragSourceId !== sourceId || !dropTarget) {
      setDropTarget(null);
      setDraggedItemId(null);
      return;
    }

    // Check for multi-select drag first
    const itemIdsJson = e.dataTransfer.getData(dataTransfer.itemIdsKey);
    if (itemIdsJson) {
      const draggedIds: string[] = JSON.parse(itemIdsJson);
      onReorder(draggedIds, dropTarget.id, dropTarget.position);
    } else {
      const draggedId = e.dataTransfer.getData(dataTransfer.itemIdKey);
      if (draggedId) {
        onReorder(draggedId, dropTarget.id, dropTarget.position);
      }
    }

    setDropTarget(null);
    setDraggedItemId(null);
  };

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
  }, [setDraggedItemId]);

  // Clear drag state when items change (e.g., after cross-list drop)
  useEffect(() => {
    if (draggedItemId && !items.some((item) => item.id === draggedItemId)) {
      setDraggedItemId(null);
      setDropTarget(null);
    }
  }, [items, draggedItemId, setDraggedItemId]);

  return {
    onDragStart,
    onDragOver,
    onDrop,
    isDragging,
    dropTarget,
  };
}

