import { SlideData } from "@/components/feature/slide/types";
import { useEffect, useRef, useState } from "react";

interface UseShowViewDragOptions {
  slides: SlideData[];
  onReorder?: (slides: SlideData[]) => void;
  // Cross-group drag and drop
  slideGroupId?: string;
  onReceiveSlides?: (
    slideIds: string[],
    sourceGroupId: string,
    insertAfterSlideId?: string
  ) => void;
}

export const useShowViewDrag = ({
  slides,
  onReorder,
  slideGroupId,
  onReceiveSlides,
}: UseShowViewDragOptions) => {
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [draggedSlideIds, setDraggedSlideIds] = useState<string[]>([]);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  // Keep a ref to the current drop target so we can use it in container drop
  const dropTargetRef = useRef(dropTarget);
  dropTargetRef.current = dropTarget;

  // Reset drag state when drag ends globally
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedSlideId(null);
      setDraggedSlideIds([]);
      setDropTarget(null);
    };

    document.addEventListener("dragend", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const handleDragStart = (slideId: string, allDraggedIds?: string[]) => {
    setDraggedSlideId(slideId);
    setDraggedSlideIds(allDraggedIds ?? [slideId]);
  };

  const handleDragOver = (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault();

    // Allow drop if we have reorder capability OR receive capability
    if (!onReorder && !onReceiveSlides) return;

    // Don't allow dropping on any of the dragged slides (same group only)
    if (draggedSlideIds.includes(targetSlideId)) {
      setDropTarget(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const position = e.clientX < midpoint ? "before" : "after";

    setDropTarget({ id: targetSlideId, position });
  };

  // Container drag over - keeps the drop zone active in gaps
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Don't clear dropTarget here - we want to keep the last valid target
  };

  // Perform the actual drop operation
  const performDrop = (
    e: React.DragEvent,
    currentDropTarget: typeof dropTarget
  ) => {
    if (!currentDropTarget) return;

    // Get source group ID from dataTransfer
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    const slideIdsJson = e.dataTransfer.getData("slideIds");
    const droppedSlideIds: string[] = slideIdsJson
      ? JSON.parse(slideIdsJson)
      : [e.dataTransfer.getData("slideId")];

    // Check if this is a cross-group drop
    const isCrossGroupDrop =
      sourceGroupId && slideGroupId && sourceGroupId !== slideGroupId;

    if (isCrossGroupDrop && onReceiveSlides) {
      // Cross-group drop: receive slides from another group
      let afterSlideId: string | undefined;
      if (currentDropTarget.position === "after") {
        afterSlideId = currentDropTarget.id;
      } else {
        const targetIndex = slides.findIndex(
          (s) => s.id === currentDropTarget.id
        );
        if (targetIndex > 0) {
          afterSlideId = slides[targetIndex - 1].id;
        }
      }

      onReceiveSlides(droppedSlideIds, sourceGroupId, afterSlideId);
    } else if (onReorder && droppedSlideIds.length > 0) {
      // Same-group reorder
      const slidesToMove = slides.filter((s) => droppedSlideIds.includes(s.id));

      if (slidesToMove.length === 0) {
        return;
      }

      const remainingSlides = slides.filter(
        (s) => !droppedSlideIds.includes(s.id)
      );

      const targetIndex = remainingSlides.findIndex(
        (s) => s.id === currentDropTarget.id
      );

      if (targetIndex === -1) {
        return;
      }

      const insertIndex =
        currentDropTarget.position === "after" ? targetIndex + 1 : targetIndex;

      const newSlides = [
        ...remainingSlides.slice(0, insertIndex),
        ...slidesToMove,
        ...remainingSlides.slice(insertIndex),
      ];

      onReorder(newSlides);
    }
  };

  const handleDrop = (e: React.DragEvent, _targetSlideId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Use the current dropTarget state (from ref for latest value)
    const currentDropTarget = dropTargetRef.current;
    if (!currentDropTarget) return;

    performDrop(e, currentDropTarget);

    setDropTarget(null);
    setDraggedSlideId(null);
    setDraggedSlideIds([]);
  };

  // Container drop handler - catches drops in gaps or empty areas
  // If there's a drop target, use it. Otherwise, add to end.
  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const currentDropTarget = dropTargetRef.current;

    // Get source group ID from dataTransfer
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    const slideIdsJson = e.dataTransfer.getData("slideIds");
    const droppedSlideIds: string[] = slideIdsJson
      ? JSON.parse(slideIdsJson)
      : [e.dataTransfer.getData("slideId")];

    // Check if this is a cross-group drop
    const isCrossGroupDrop =
      sourceGroupId && slideGroupId && sourceGroupId !== slideGroupId;

    if (currentDropTarget) {
      // We have a specific drop target - use the precise position
      performDrop(e, currentDropTarget);
    } else if (isCrossGroupDrop && onReceiveSlides) {
      // No specific target - add to end (cross-group)
      // Pass the last slide's ID to insert after it, or undefined for empty group
      const lastSlideId =
        slides.length > 0 ? slides[slides.length - 1].id : undefined;
      onReceiveSlides(droppedSlideIds, sourceGroupId, lastSlideId);
    }

    setDropTarget(null);
    setDraggedSlideId(null);
    setDraggedSlideIds([]);
  };

  return {
    draggedSlideId,
    draggedSlideIds,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleContainerDragOver,
    handleContainerDrop,
  };
};
