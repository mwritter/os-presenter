import { useEffect } from "react";
import { useSidebarSelectionStore } from "@/stores/presenter/presenterStore";
import { SidebarSelectionType } from "@/stores/presenter/slices/sidebarSelectionSlice";

// All sidebar selection types for clearing other types
const ALL_SIDEBAR_TYPES: SidebarSelectionType[] = [
  "library",
  "playlist",
  "libraryItem",
  "playlistItem",
  "mediaPlaylist",
];

interface UseSidebarMultiSelectOptions<T extends { id: string }> {
  type: SidebarSelectionType;
  items: T[];
  onSelect?: (id: string) => void; // Called for non-multi-select clicks
  containerRef?: React.RefObject<HTMLElement | null>; // Optional container to detect outside clicks
}

export function useSidebarMultiSelect<T extends { id: string }>({
  type,
  items,
  onSelect,
  containerRef,
}: UseSidebarMultiSelectOptions<T>) {
  const selectedIds = useSidebarSelectionStore(
    (s) => s.sidebarSelectedIds[type]
  );
  const anchorId = useSidebarSelectionStore((s) => s.sidebarAnchorId[type]);
  const isMultiSelectMode = useSidebarSelectionStore(
    (s) => s.sidebarIsMultiSelectMode[type]
  );
  const selectItem = useSidebarSelectionStore((s) => s.sidebarSelectItem);
  const toggleSelection = useSidebarSelectionStore(
    (s) => s.sidebarToggleSelection
  );
  const selectRange = useSidebarSelectionStore((s) => s.sidebarSelectRange);
  const clearSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  const allIds = items.map((item) => item.id);

  // Track if we're in multi-select mode for this type to enable escape/outside click
  const isActiveMultiSelect = isMultiSelectMode && selectedIds.length > 0;

  // Escape key and outside click to cancel multi-select
  useEffect(() => {
    if (!isActiveMultiSelect) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection(type);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // If containerRef is provided, check if click is outside
      if (containerRef?.current) {
        if (!containerRef.current.contains(e.target as Node)) {
          clearSelection(type);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActiveMultiSelect, type, clearSelection, containerRef]);

  /**
   * Clear selections of all other types (user can only multi-select same type)
   */
  const clearOtherTypes = () => {
    ALL_SIDEBAR_TYPES.forEach((t) => {
      if (t !== type) {
        clearSelection(t);
      }
    });
  };

  /**
   * Handle click on an item with modifier key detection
   */
  const handleItemClick = (id: string, e: React.MouseEvent) => {
    const isShiftKey = e.shiftKey;
    const isMetaKey = e.metaKey || e.ctrlKey;

    // Always clear other types when clicking (can only multi-select same type)
    clearOtherTypes();

    if (isShiftKey) {
      // Shift+click: Select range from anchor to clicked item
      if (anchorId) {
        selectRange(type, anchorId, id, allIds);
      } else {
        // No anchor yet, start fresh selection
        selectItem(type, id, true);
      }
    } else if (isMetaKey) {
      // Cmd/Ctrl+click: Toggle individual item selection
      toggleSelection(type, id);
    } else {
      // Regular click: Clear selection and select normally
      selectItem(type, id, true);
      //   clearSelection(type);
      onSelect?.(id);
    }
  };

  /**
   * Check if an item is selected
   */
  const isSelected = (id: string) => {
    return selectedIds.includes(id);
  };

  /**
   * Get selected items data
   */
  const getSelectedItems = () => {
    return items.filter((item) => selectedIds.includes(item.id));
  };

  /**
   * Get items to operate on - if target is in selection use selection, otherwise use target
   */
  const getItemsToOperate = (targetId?: string): T[] => {
    if (targetId && selectedIds.includes(targetId)) {
      return items.filter((item) => selectedIds.includes(item.id));
    }
    if (targetId) {
      const targetItem = items.find((item) => item.id === targetId);
      return targetItem ? [targetItem] : [];
    }
    return items.filter((item) => selectedIds.includes(item.id));
  };

  return {
    selectedIds,
    isMultiSelectMode,
    handleItemClick,
    isSelected,
    getSelectedItems,
    getItemsToOperate,
    clearSelection: () => clearSelection(type),
  };
}
