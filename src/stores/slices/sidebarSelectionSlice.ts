import { StateCreator } from "zustand";

/**
 * Different types of sidebar items that can be selected
 */
export type SidebarSelectionType =
  | "library"
  | "playlist"
  | "libraryItem" // SlideGroups in a library
  | "playlistItem"; // Items in a playlist

export interface SidebarSelectionSlice {
  // Selection state - keyed by selection type to allow independent selections
  sidebarSelectedIds: Record<SidebarSelectionType, string[]>;
  sidebarAnchorId: Record<SidebarSelectionType, string | null>;
  sidebarIsMultiSelectMode: Record<SidebarSelectionType, boolean>;

  // Actions
  sidebarSelectItem: (
    type: SidebarSelectionType,
    id: string,
    multiSelectMode?: boolean
  ) => void;
  sidebarToggleSelection: (type: SidebarSelectionType, id: string) => void;
  sidebarSelectRange: (
    type: SidebarSelectionType,
    fromId: string,
    toId: string,
    allIds: string[]
  ) => void;
  sidebarSelectMultiple: (
    type: SidebarSelectionType,
    ids: string[],
    multiSelectMode?: boolean
  ) => void;
  sidebarClearSelection: (type: SidebarSelectionType) => void;
  sidebarClearAllSelections: () => void;
  sidebarIsSelected: (type: SidebarSelectionType, id: string) => boolean;
  sidebarGetSelectedIds: (type: SidebarSelectionType) => string[];
}

const initialSelectionState = (): Record<SidebarSelectionType, string[]> => ({
  library: [],
  playlist: [],
  libraryItem: [],
  playlistItem: [],
});

const initialAnchorState = (): Record<SidebarSelectionType, string | null> => ({
  library: null,
  playlist: null,
  libraryItem: null,
  playlistItem: null,
});

const initialMultiSelectState = (): Record<SidebarSelectionType, boolean> => ({
  library: false,
  playlist: false,
  libraryItem: false,
  playlistItem: false,
});

export const createSidebarSelectionSlice: StateCreator<
  SidebarSelectionSlice,
  [],
  [],
  SidebarSelectionSlice
> = (set, get) => ({
  // Initial state
  sidebarSelectedIds: initialSelectionState(),
  sidebarAnchorId: initialAnchorState(),
  sidebarIsMultiSelectMode: initialMultiSelectState(),

  // Select a single item (sets as anchor for Shift+click range)
  sidebarSelectItem: (type, id, multiSelectMode = false) => {
    const { sidebarSelectedIds, sidebarAnchorId, sidebarIsMultiSelectMode } =
      get();
    set({
      sidebarSelectedIds: {
        ...sidebarSelectedIds,
        [type]: [id],
      },
      sidebarAnchorId: {
        ...sidebarAnchorId,
        [type]: id,
      },
      sidebarIsMultiSelectMode: {
        ...sidebarIsMultiSelectMode,
        [type]: multiSelectMode,
      },
    });
  },

  // Toggle an item's selection (for Cmd+click)
  sidebarToggleSelection: (type, id) => {
    const { sidebarSelectedIds, sidebarAnchorId, sidebarIsMultiSelectMode } =
      get();
    const currentSelection = sidebarSelectedIds[type];
    const isSelected = currentSelection.includes(id);

    if (isSelected) {
      // Remove from selection
      const newSelection = currentSelection.filter((itemId) => itemId !== id);
      const currentAnchor = sidebarAnchorId[type];
      // If we removed the anchor, set new anchor to first remaining item
      const newAnchor =
        id === currentAnchor
          ? newSelection.length > 0
            ? newSelection[0]
            : null
          : currentAnchor;

      set({
        sidebarSelectedIds: {
          ...sidebarSelectedIds,
          [type]: newSelection,
        },
        sidebarAnchorId: {
          ...sidebarAnchorId,
          [type]: newAnchor,
        },
        sidebarIsMultiSelectMode: {
          ...sidebarIsMultiSelectMode,
          [type]: newSelection.length > 0,
        },
      });
    } else {
      // Add to selection
      const currentAnchor = sidebarAnchorId[type];
      set({
        sidebarSelectedIds: {
          ...sidebarSelectedIds,
          [type]: [...currentSelection, id],
        },
        sidebarAnchorId: {
          ...sidebarAnchorId,
          [type]: currentAnchor ?? id,
        },
        sidebarIsMultiSelectMode: {
          ...sidebarIsMultiSelectMode,
          [type]: true,
        },
      });
    }
  },

  // Select a range of items (for Shift+click)
  sidebarSelectRange: (type, fromId, toId, allIds) => {
    const { sidebarSelectedIds, sidebarAnchorId, sidebarIsMultiSelectMode } =
      get();
    const fromIndex = allIds.indexOf(fromId);
    const toIndex = allIds.indexOf(toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    const rangeIds = allIds.slice(startIndex, endIndex + 1);

    set({
      sidebarSelectedIds: {
        ...sidebarSelectedIds,
        [type]: rangeIds,
      },
      sidebarAnchorId: {
        ...sidebarAnchorId,
        // Keep the anchor the same
      },
      sidebarIsMultiSelectMode: {
        ...sidebarIsMultiSelectMode,
        [type]: true,
      },
    });
  },

  // Select multiple items at once
  sidebarSelectMultiple: (type, ids, multiSelectMode = false) => {
    const { sidebarSelectedIds, sidebarAnchorId, sidebarIsMultiSelectMode } =
      get();
    set({
      sidebarSelectedIds: {
        ...sidebarSelectedIds,
        [type]: ids,
      },
      sidebarAnchorId: {
        ...sidebarAnchorId,
        [type]: ids.length > 0 ? ids[0] : null,
      },
      sidebarIsMultiSelectMode: {
        ...sidebarIsMultiSelectMode,
        [type]: multiSelectMode,
      },
    });
  },

  // Clear selection for a specific type
  sidebarClearSelection: (type) => {
    const { sidebarSelectedIds, sidebarAnchorId, sidebarIsMultiSelectMode } =
      get();
    set({
      sidebarSelectedIds: {
        ...sidebarSelectedIds,
        [type]: [],
      },
      sidebarAnchorId: {
        ...sidebarAnchorId,
        [type]: null,
      },
      sidebarIsMultiSelectMode: {
        ...sidebarIsMultiSelectMode,
        [type]: false,
      },
    });
  },

  // Clear all selections
  sidebarClearAllSelections: () => {
    set({
      sidebarSelectedIds: initialSelectionState(),
      sidebarAnchorId: initialAnchorState(),
      sidebarIsMultiSelectMode: initialMultiSelectState(),
    });
  },

  // Check if an item is selected
  sidebarIsSelected: (type, id) => {
    return get().sidebarSelectedIds[type].includes(id);
  },

  // Get all selected IDs for a type
  sidebarGetSelectedIds: (type) => {
    return get().sidebarSelectedIds[type];
  },
});

