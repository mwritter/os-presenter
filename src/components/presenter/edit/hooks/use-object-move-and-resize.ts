import { useEditContext } from "@/presenter/edit/context";
import { useEffect, useState } from "react";

export const useObjectMoveAndResize = ({ 
  containerRef, 
  scaleRef, 
  editingObjectId 
}: { 
  containerRef: React.RefObject<HTMLDivElement | null>; 
  scaleRef: React.RefObject<number>;
  editingObjectId: string | null;
}) => {
    const {
        selectedSlide,
        selectedObjectId,
        selectObject,
        updateObject,
        canvasSize,
      } = useEditContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  useEffect(() => {
    if ((!isDragging && !isResizing) || !selectedSlide) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectedObjectId) return;

      // Calculate delta in pixels, accounting for scale (use ref to get current value)
      const currentScale = scaleRef.current;
      const deltaX = (e.clientX - dragStart.x) / currentScale;
      const deltaY = (e.clientY - dragStart.y) / currentScale;

      const selectedObject = selectedSlide.objects?.find(
        (obj) => obj.id === selectedObjectId
      );
      if (!selectedObject) return;

      if (isDragging) {
        // Update position in pixels
        updateObject(selectedObjectId, {
          position: {
            x: Math.max(
              0,
              Math.min(
                canvasSize.width - selectedObject.size.width,
                selectedObject.position.x + deltaX
              )
            ),
            y: Math.max(
              0,
              Math.min(
                canvasSize.height - selectedObject.size.height,
                selectedObject.position.y + deltaY
              )
            ),
          },
        });
      } else if (isResizing && resizeHandle) {
        // Update size based on handle
        const newSize = { ...selectedObject.size };
        const newPosition = { ...selectedObject.position };

        if (resizeHandle.includes("e")) {
          newSize.width = Math.max(20, selectedObject.size.width + deltaX);
        }
        if (resizeHandle.includes("w")) {
          const widthChange = -deltaX;
          newSize.width = Math.max(20, selectedObject.size.width + widthChange);
          newPosition.x = selectedObject.position.x - widthChange;
        }
        if (resizeHandle.includes("s")) {
          newSize.height = Math.max(20, selectedObject.size.height + deltaY);
        }
        if (resizeHandle.includes("n")) {
          const heightChange = -deltaY;
          newSize.height = Math.max(
            20,
            selectedObject.size.height + heightChange
          );
          newPosition.y = selectedObject.position.y - heightChange;
        }

        updateObject(selectedObjectId, {
          size: newSize,
          position: newPosition,
        });
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    selectedObjectId,
    selectedSlide,
    updateObject,
    resizeHandle,
    canvasSize,
  ]);

  const handleSlideMouseDown = (e: React.MouseEvent) => {
    // Don't interfere with resize handles
    const target = e.target as HTMLElement;
    if (target.dataset.handle) return;

    // Don't start dragging if we're in edit mode
    if (editingObjectId) return;

    const objectId =
      target.dataset.objectId ||
      target.closest("[data-object-id]")?.getAttribute("data-object-id");

    if (objectId) {
      e.preventDefault(); // Prevent text selection etc.

      // Recalculate scale at the start of drag to ensure it's current
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const scaleX = containerWidth / canvasSize.width;
        const scaleY = containerHeight / canvasSize.height;
        scaleRef.current = Math.min(scaleX, scaleY);
      }

      // Select the object
      selectObject(objectId);

      // Start dragging immediately if already selected
      if (objectId === selectedObjectId) {
        setIsDragging(true);
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Clicked on empty canvas, deselect
      selectObject(null);
    }
  };

  const handleResizeStart = (
    objectId: string,
    handle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    selectObject(objectId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return {
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    dragStart,
    setDragStart,
    resizeHandle,
    setResizeHandle,
    handleSlideMouseDown,
    handleResizeStart,
  };
};
