import { useEffect } from "react";
import { SlideData } from "@/components/feature/slide/types";
import {
  useSlideSelectionStore,
  usePresenterStore,
  useSelectionStore,
} from "@/stores/presenter/presenterStore";
import { SlideClipboard } from "@/stores/presenter/slices/slideSelectionSlice";

interface UseSlideClipboardOptions {
  slides: SlideData[];
  onSlidesChange?: (slides: SlideData[]) => void;
  enabled?: boolean;
  // For keyboard shortcuts - only respond if this is the active group
  slideGroupId?: string;
  playlistItemId?: string;
}

export function useSlideClipboard({
  slides,
  onSlidesChange,
  enabled = true,
  slideGroupId,
  playlistItemId,
}: UseSlideClipboardOptions) {
  // Selection state
  const selectedSlideIds = useSlideSelectionStore((s) => s.selectedSlideIds);
  const clearSelection = useSlideSelectionStore((s) => s.clearSelection);

  // Clipboard state
  const clipboard = useSlideSelectionStore((s) => s.clipboard);
  const cutSlides = useSlideSelectionStore((s) => s.cutSlides);
  const copySlides = useSlideSelectionStore((s) => s.copySlides);
  const clearClipboard = useSlideSelectionStore((s) => s.clearClipboard);

  // Context for source tracking
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);

  // Check if this is the active slide group for keyboard shortcuts
  const isActiveGroup =
    (slideGroupId && selectedSlideGroup?.id === slideGroupId) ||
    (playlistItemId && selectedPlaylistItem?.id === playlistItemId);

  /**
   * Get source context for clipboard operations
   */
  const getSourceContext = (): SlideClipboard["sourceContext"] => {
    if (selectedPlaylistItem) {
      return {
        type: "playlist",
        playlistId: selectedPlaylistItem.playlistId,
        playlistItemId: selectedPlaylistItem.id,
      };
    }
    if (selectedSlideGroup) {
      return {
        type: "library",
        libraryId: selectedSlideGroup.libraryId,
        slideGroupId: selectedSlideGroup.id,
      };
    }
    return { type: "library" };
  };

  /**
   * Get slides to operate on - if target is in selection use selection, otherwise use target
   */
  const getSlidesToOperate = (targetSlideId?: string): SlideData[] => {
    // If target slide is part of selection, use entire selection
    if (targetSlideId && selectedSlideIds.includes(targetSlideId)) {
      return slides.filter((slide) => selectedSlideIds.includes(slide.id));
    }
    // If target slide is specified but not in selection, use just that slide
    if (targetSlideId) {
      const targetSlide = slides.find((s) => s.id === targetSlideId);
      return targetSlide ? [targetSlide] : [];
    }
    // Fallback to selection
    return slides.filter((slide) => selectedSlideIds.includes(slide.id));
  };

  /**
   * Handle cut operation - copies to clipboard AND removes from source
   */
  const handleCut = (targetSlideId?: string) => {
    if (!onSlidesChange) return;

    const slidesToCut = getSlidesToOperate(targetSlideId);
    if (slidesToCut.length === 0) return;

    // Store in clipboard
    cutSlides(slidesToCut, getSourceContext());

    // Remove from source immediately
    const slideIdsToCut = slidesToCut.map((s) => s.id);
    const remainingSlides = slides.filter(
      (slide) => !slideIdsToCut.includes(slide.id)
    );
    onSlidesChange(remainingSlides);
    clearSelection();
  };

  /**
   * Handle copy operation
   */
  const handleCopy = (targetSlideId?: string) => {
    const slidesToCopy = getSlidesToOperate(targetSlideId);
    if (slidesToCopy.length === 0) return;

    copySlides(slidesToCopy, getSourceContext());
  };

  /**
   * Handle paste operation - inserts after the specified slide
   */
  const handlePaste = (afterSlideId?: string) => {
    if (!clipboard || !onSlidesChange) return;

    // Generate new IDs for pasted slides
    const pastedSlides = clipboard.slides.map((slide) => {
      const shortId = crypto.randomUUID().split("-")[0];
      // Determine prefix based on current context
      let prefix = "";
      if (selectedPlaylistItem) {
        prefix = selectedPlaylistItem.playlistId;
      } else if (selectedSlideGroup) {
        prefix = selectedSlideGroup.libraryId;
      }

      return {
        ...slide,
        id: `${prefix}-${shortId}`,
        // Deep clone objects
        objects: slide.objects?.map((obj) => ({
          ...obj,
          id: `${shortId}-${crypto.randomUUID().split("-")[0]}`,
        })),
      };
    });

    // If it was a cut operation, clear clipboard after paste
    if (clipboard.operation === "cut") {
      clearClipboard();
    }

    // Find the index to insert after
    let insertIndex = slides.length; // Default to end
    if (afterSlideId) {
      const targetIndex = slides.findIndex((s) => s.id === afterSlideId);
      if (targetIndex !== -1) {
        insertIndex = targetIndex + 1; // Insert after the target slide
      }
    }

    // Insert pasted slides at the calculated position
    const newSlides = [
      ...slides.slice(0, insertIndex),
      ...pastedSlides,
      ...slides.slice(insertIndex),
    ];
    onSlidesChange(newSlides);
  };

  /**
   * Handle delete operation
   */
  const handleDelete = (targetSlideId?: string) => {
    if (!onSlidesChange) return;

    const slidesToDelete = getSlidesToOperate(targetSlideId);
    if (slidesToDelete.length === 0) return;

    const slideIdsToDelete = slidesToDelete.map((s) => s.id);

    // Filter out slides to delete
    const remainingSlides = slides.filter(
      (slide) => !slideIdsToDelete.includes(slide.id)
    );

    onSlidesChange(remainingSlides);
    clearSelection();
  };

  /**
   * Keyboard shortcuts handler
   */
  useEffect(() => {
    if (!enabled) return;
    // Only handle keyboard shortcuts if this is the active slide group
    if (!isActiveGroup) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if there's a selection or clipboard content
      const hasSelection = selectedSlideIds.length > 0;
      const hasClipboard = clipboard !== null;

      // Check for meta key (Cmd on Mac, Ctrl on Windows)
      const isMetaKey = e.metaKey || e.ctrlKey;

      if (isMetaKey && e.key === "x" && hasSelection) {
        e.preventDefault();
        handleCut();
      } else if (isMetaKey && e.key === "c" && hasSelection) {
        e.preventDefault();
        handleCopy();
      } else if (isMetaKey && e.key === "v" && hasClipboard) {
        e.preventDefault();
        // For keyboard paste, insert after the last selected slide (or at end if none)
        const lastSelectedId =
          selectedSlideIds.length > 0
            ? selectedSlideIds[selectedSlideIds.length - 1]
            : undefined;
        handlePaste(lastSelectedId);
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        hasSelection
      ) {
        // Only handle delete if not in an input/textarea
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        handleDelete();
      } else if (isMetaKey && e.key === "a") {
        // Select all slides
        e.preventDefault();
        const allSlideIds = slides.map((s) => s.id);
        usePresenterStore.getState().selectMultiple(allSlideIds, true);
      } else if (e.key === "Escape") {
        // Clear selection
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    isActiveGroup,
    selectedSlideIds,
    clipboard,
    slides,
    clearSelection,
  ]);

  return {
    handleCut,
    handleCopy,
    handlePaste,
    handleDelete,
    hasSelection: selectedSlideIds.length > 0,
    hasClipboard: clipboard !== null,
    selectedCount: selectedSlideIds.length,
  };
}
