import { useEffect, useRef, useState } from "react";
import { useSlideSelectionStore } from "@/stores/presenter/presenterStore";

interface LassoRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseLassoSelectOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  slideRefs: Map<string, HTMLElement>;
  enabled?: boolean;
}

export function useLassoSelect({
  containerRef,
  slideRefs,
  enabled = true,
}: UseLassoSelectOptions) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [lassoRect, setLassoRect] = useState<LassoRect | null>(null);
  const selectMultiple = useSlideSelectionStore((s) => s.selectMultiple);
  const clearSelection = useSlideSelectionStore((s) => s.clearSelection);

  // Track if we started on the container background (not on a slide)
  const startedOnBackgroundRef = useRef(false);

  const getSlideIdsInRect = (rect: LassoRect): string[] => {
    const minX = Math.min(rect.startX, rect.currentX);
    const maxX = Math.max(rect.startX, rect.currentX);
    const minY = Math.min(rect.startY, rect.currentY);
    const maxY = Math.max(rect.startY, rect.currentY);

    const selectedIds: string[] = [];

    slideRefs.forEach((element, slideId) => {
      const slideRect = element.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!containerRect) return;

      // Convert slide rect to container-relative coordinates
      const slideMinX = slideRect.left - containerRect.left;
      const slideMaxX = slideRect.right - containerRect.left;
      const slideMinY = slideRect.top - containerRect.top;
      const slideMaxY = slideRect.bottom - containerRect.top;

      // Check if rectangles intersect
      const intersects =
        minX < slideMaxX &&
        maxX > slideMinX &&
        minY < slideMaxY &&
        maxY > slideMinY;

      if (intersects) {
        selectedIds.push(slideId);
      }
    });

    return selectedIds;
  };

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
      const isSlideClick = target.closest("[data-slide-item]");

      if (isSlideClick) {
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

      // Clear selection if not holding shift or cmd
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        clearSelection();
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

        // Update selection in real-time (multi-select mode)
        const selectedIds = getSlideIdsInRect(newRect);
        if (selectedIds.length > 0) {
          selectMultiple(selectedIds, true); // true = multi-select mode
        }

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
  }, [enabled, containerRef, slideRefs, clearSelection, selectMultiple]);

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
  };
}
