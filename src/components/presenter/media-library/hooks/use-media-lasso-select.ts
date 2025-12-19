import { useEffect, useRef, useState, useCallback } from "react";

interface LassoRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseMediaLassoSelectOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  mediaRefs: Map<string, HTMLElement>;
  enabled?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  onClearSelection?: () => void;
}

export function useMediaLassoSelect({
  containerRef,
  mediaRefs,
  enabled = true,
  onSelectionChange,
  onClearSelection,
}: UseMediaLassoSelectOptions) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [lassoRect, setLassoRect] = useState<LassoRect | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Track if we started on the container background (not on a media item)
  const startedOnBackgroundRef = useRef(false);

  const getMediaIdsInRect = useCallback(
    (rect: LassoRect): string[] => {
      const minX = Math.min(rect.startX, rect.currentX);
      const maxX = Math.max(rect.startX, rect.currentX);
      const minY = Math.min(rect.startY, rect.currentY);
      const maxY = Math.max(rect.startY, rect.currentY);

      const intersectingIds: string[] = [];

      mediaRefs.forEach((element, mediaId) => {
        const mediaRect = element.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (!containerRect) return;

        // Convert media rect to container-relative coordinates
        const mediaMinX = mediaRect.left - containerRect.left;
        const mediaMaxX = mediaRect.right - containerRect.left;
        const mediaMinY = mediaRect.top - containerRect.top;
        const mediaMaxY = mediaRect.bottom - containerRect.top;

        // Check if rectangles intersect
        const intersects =
          minX < mediaMaxX &&
          maxX > mediaMinX &&
          minY < mediaMaxY &&
          maxY > mediaMinY;

        if (intersects) {
          intersectingIds.push(mediaId);
        }
      });

      return intersectingIds;
    },
    [containerRef, mediaRefs]
  );

  // Attach global event listeners
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;

      // Only start lasso on left-click (button 0), not right-click (button 2)
      if (e.button !== 0) {
        return;
      }

      // Only start lasso if clicking on the container background
      const target = e.target as HTMLElement;
      const isMediaClick = target.closest("[data-media-item]");

      if (isMediaClick) {
        startedOnBackgroundRef.current = false;
        return;
      }

      // Check if the click is within the container
      const containerRect = containerRef.current.getBoundingClientRect();
      if (
        e.clientX < containerRect.left ||
        e.clientX > containerRect.right ||
        e.clientY < containerRect.top ||
        e.clientY > containerRect.bottom
      ) {
        return;
      }

      startedOnBackgroundRef.current = true;

      // Clear selection if not holding shift or cmd (exits multi-select mode)
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        setSelectedIds([]);
        onClearSelection?.();
      }

      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      setLassoRect({
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      });
      setIsSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!startedOnBackgroundRef.current) return;

      setLassoRect((currentLassoRect) => {
        if (!currentLassoRect) return null;

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return currentLassoRect;

        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;

        const newRect = {
          ...currentLassoRect,
          currentX: x,
          currentY: y,
        };

        // Update selection in real-time
        const newSelectedIds = getMediaIdsInRect(newRect);
        setSelectedIds(newSelectedIds);
        onSelectionChange?.(newSelectedIds);

        return newRect;
      });
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setLassoRect(null);
      startedOnBackgroundRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [enabled, containerRef, mediaRefs, getMediaIdsInRect, onSelectionChange, onClearSelection]);

  // Calculate the CSS rect for the lasso overlay
  const lassoStyle = lassoRect
    ? {
        left: Math.min(lassoRect.startX, lassoRect.currentX),
        top: Math.min(lassoRect.startY, lassoRect.currentY),
        width: Math.abs(lassoRect.currentX - lassoRect.startX),
        height: Math.abs(lassoRect.currentY - lassoRect.startY),
      }
    : null;

  return {
    isSelecting,
    lassoStyle,
    selectedIds,
  };
}

