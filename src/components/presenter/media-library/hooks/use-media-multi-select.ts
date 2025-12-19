import { useState, useCallback, useEffect } from "react";
import { MediaItem, useMediaLibraryStore } from "@/stores/mediaLibraryStore";

interface UseMediaMultiSelectOptions {
  mediaItems: MediaItem[];
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function useMediaMultiSelect({
  mediaItems,
  containerRef,
}: UseMediaMultiSelectOptions) {
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [anchorMediaId, setAnchorMediaId] = useState<string | null>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const selectMedia = useMediaLibraryStore((s) => s.selectMedia);

  /**
   * Handle click on a media item with modifier key detection
   */
  const handleMediaClick = useCallback(
    (mediaId: string, e: React.MouseEvent) => {
      const isShiftKey = e.shiftKey;
      const isMetaKey = e.metaKey || e.ctrlKey; // Cmd on Mac, Ctrl on Windows

      if (isShiftKey) {
        // Shift+click: Select range from anchor to clicked item
        // Always enters multi-select mode (even with single item)
        if (anchorMediaId) {
          const anchorIndex = mediaItems.findIndex(
            (item) => item.id === anchorMediaId
          );
          const currentIndex = mediaItems.findIndex(
            (item) => item.id === mediaId
          );

          if (anchorIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(anchorIndex, currentIndex);
            const end = Math.max(anchorIndex, currentIndex);
            const rangeIds = mediaItems
              .slice(start, end + 1)
              .map((item) => item.id);
            setSelectedMediaIds(rangeIds);
            setIsMultiSelectMode(true);
          }
        } else {
          // No anchor yet, start fresh selection with this item as anchor
          setAnchorMediaId(mediaId);
          setSelectedMediaIds([mediaId]);
          setIsMultiSelectMode(true);
        }
      } else if (isMetaKey) {
        // Cmd/Ctrl+click: Toggle individual item selection
        // Always enters multi-select mode (even with single item)
        setSelectedMediaIds((prev) => {
          const newSelection = prev.includes(mediaId)
            ? prev.filter((id) => id !== mediaId)
            : [...prev, mediaId];

          // Exit multi-select if no items selected
          if (newSelection.length === 0) {
            setIsMultiSelectMode(false);
            setAnchorMediaId(null);
          } else {
            setIsMultiSelectMode(true);
            if (!anchorMediaId) {
              setAnchorMediaId(mediaId);
            }
          }

          return newSelection;
        });
      } else {
        // Regular click: Clear selection and select this item (exits multi-select)
        setSelectedMediaIds([]);
        setAnchorMediaId(null);
        setIsMultiSelectMode(false);
        selectMedia(mediaId);
      }
    },
    [anchorMediaId, mediaItems, selectMedia]
  );

  /**
   * Check if a media item is currently selected
   */
  const isMediaSelected = useCallback(
    (mediaId: string) => {
      return selectedMediaIds.includes(mediaId);
    },
    [selectedMediaIds]
  );

  /**
   * Select multiple items (used by lasso select)
   * Always enters multi-select mode
   */
  const selectMultiple = useCallback(
    (ids: string[]) => {
      setSelectedMediaIds(ids);
      if (ids.length > 0) {
        setIsMultiSelectMode(true);
        if (!anchorMediaId) {
          setAnchorMediaId(ids[0]);
        }
      }
    },
    [anchorMediaId]
  );

  /**
   * Clear all selection and exit multi-select mode
   */
  const clearSelection = useCallback(() => {
    setSelectedMediaIds([]);
    setAnchorMediaId(null);
    setIsMultiSelectMode(false);
  }, []);

  // Handle ESC key to exit multi-select mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMultiSelectMode) {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMultiSelectMode, clearSelection]);

  // Handle click outside to exit multi-select mode
  useEffect(() => {
    if (!containerRef?.current) return;

    const handleClickOutside = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Check if click is outside the container
      if (!container.contains(e.target as Node) && isMultiSelectMode) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef, isMultiSelectMode, clearSelection]);

  return {
    selectedMediaIds,
    isMultiSelectMode,
    handleMediaClick,
    isMediaSelected,
    selectMultiple,
    clearSelection,
  };
}

