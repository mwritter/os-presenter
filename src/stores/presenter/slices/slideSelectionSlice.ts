import { StateCreator } from "zustand";
import { SlideData } from "@/components/feature/slide/types";

export type ClipboardOperation = "cut" | "copy";

export interface SlideClipboard {
  slides: SlideData[];
  operation: ClipboardOperation;
  sourceContext: {
    type: "library" | "playlist";
    libraryId?: string;
    slideGroupId?: string;
    playlistId?: string;
    playlistItemId?: string;
  };
}

export interface SlideSelectionSlice {
  // Selection state
  selectedSlideIds: string[];
  anchorSlideId: string | null; // First slide in selection (for Shift+click range)
  lastSelectedSlideId: string | null;
  isMultiSelectMode: boolean; // True when user is in multi-select mode (Shift/Cmd/lasso)

  // Clipboard state
  clipboard: SlideClipboard | null;

  // Actions
  selectSlide: (id: string, multiSelectMode?: boolean) => void;
  toggleSlideSelection: (id: string) => void;
  selectRange: (fromId: string, toId: string, allSlides: SlideData[]) => void;
  selectMultiple: (ids: string[], multiSelectMode?: boolean) => void;
  addToSelection: (ids: string[]) => void;
  clearSelection: () => void;
  isSlideSelected: (id: string) => boolean;

  // Clipboard actions
  cutSlides: (
    slides: SlideData[],
    sourceContext: SlideClipboard["sourceContext"]
  ) => void;
  copySlides: (
    slides: SlideData[],
    sourceContext: SlideClipboard["sourceContext"]
  ) => void;
  clearClipboard: () => void;
  getClipboardSlides: () => SlideData[] | null;
}

export const createSlideSelectionSlice: StateCreator<
  SlideSelectionSlice,
  [],
  [],
  SlideSelectionSlice
> = (set, get) => ({
  // Initial state
  selectedSlideIds: [],
  anchorSlideId: null,
  lastSelectedSlideId: null,
  isMultiSelectMode: false,
  clipboard: null,

  // Select a single slide (sets as anchor for Shift+click range)
  selectSlide: (id, multiSelectMode = false) => {
    set({
      selectedSlideIds: [id],
      anchorSlideId: id, // First click sets the anchor
      lastSelectedSlideId: id,
      isMultiSelectMode: multiSelectMode,
    });
  },

  // Toggle a slide's selection (for Cmd+click) - always multi-select mode
  toggleSlideSelection: (id) => {
    const { selectedSlideIds, anchorSlideId } = get();
    const isSelected = selectedSlideIds.includes(id);

    if (isSelected) {
      // Remove from selection
      const newSelection = selectedSlideIds.filter((slideId) => slideId !== id);
      // If we removed the anchor, set new anchor to first remaining slide
      const newAnchor =
        id === anchorSlideId
          ? newSelection.length > 0
            ? newSelection[0]
            : null
          : anchorSlideId;
      set({
        selectedSlideIds: newSelection,
        anchorSlideId: newAnchor,
        lastSelectedSlideId:
          newSelection.length > 0
            ? newSelection[newSelection.length - 1]
            : null,
        isMultiSelectMode: newSelection.length > 0,
      });
    } else {
      // Add to selection - if no anchor, this becomes the anchor
      const { anchorSlideId: currentAnchor } = get();
      set({
        selectedSlideIds: [...selectedSlideIds, id],
        anchorSlideId: currentAnchor ?? id,
        lastSelectedSlideId: id,
        isMultiSelectMode: true,
      });
    }
  },

  // Select a range of slides (for Shift+click) - always from anchor
  selectRange: (fromId, toId, allSlides) => {
    const fromIndex = allSlides.findIndex((slide) => slide.id === fromId);
    const toIndex = allSlides.findIndex((slide) => slide.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);

    const rangeIds = allSlides
      .slice(startIndex, endIndex + 1)
      .map((slide) => slide.id);

    // Keep the anchor, just update the range and last selected
    set({
      selectedSlideIds: rangeIds,
      // anchorSlideId stays the same (fromId)
      lastSelectedSlideId: toId,
      isMultiSelectMode: true,
    });
  },

  // Select multiple slides at once (for lasso)
  selectMultiple: (ids, multiSelectMode = false) => {
    set({
      selectedSlideIds: ids,
      anchorSlideId: ids.length > 0 ? ids[0] : null,
      lastSelectedSlideId: ids.length > 0 ? ids[ids.length - 1] : null,
      isMultiSelectMode: multiSelectMode,
    });
  },

  // Add slides to current selection (for lasso select with modifier)
  addToSelection: (ids) => {
    const { selectedSlideIds, anchorSlideId } = get();
    const uniqueIds = [...new Set([...selectedSlideIds, ...ids])];
    set({
      selectedSlideIds: uniqueIds,
      anchorSlideId: anchorSlideId ?? (ids.length > 0 ? ids[0] : null),
      lastSelectedSlideId: ids.length > 0 ? ids[ids.length - 1] : null,
    });
  },

  // Clear all selections
  clearSelection: () => {
    set({
      selectedSlideIds: [],
      anchorSlideId: null,
      lastSelectedSlideId: null,
      isMultiSelectMode: false,
    });
  },

  // Check if a slide is selected
  isSlideSelected: (id) => {
    return get().selectedSlideIds.includes(id);
  },

  // Cut slides to clipboard
  cutSlides: (slides, sourceContext) => {
    set({
      clipboard: {
        slides: slides.map((slide) => ({ ...slide })), // Deep copy
        operation: "cut",
        sourceContext,
      },
    });
  },

  // Copy slides to clipboard
  copySlides: (slides, sourceContext) => {
    set({
      clipboard: {
        slides: slides.map((slide) => ({ ...slide })), // Deep copy
        operation: "copy",
        sourceContext,
      },
    });
  },

  // Clear clipboard
  clearClipboard: () => {
    set({ clipboard: null });
  },

  // Get clipboard slides (returns null if clipboard is empty)
  getClipboardSlides: () => {
    const { clipboard } = get();
    if (!clipboard) return null;
    return clipboard.slides;
  },
});
