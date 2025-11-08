import { useEditContext } from "@/presenter/edit/context";
import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { EditViewObjectActionbar } from "./EditViewObjectActionbar";
import { useState, useRef, useEffect } from "react";

export const EditViewContent = () => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<number>(1);

  // Calculate scale to match the Slide component's scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = containerWidth / canvasSize.width;
      const scaleY = containerHeight / canvasSize.height;
      const newScale = Math.min(scaleX, scaleY);

      scaleRef.current = newScale;
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      resizeObserver.disconnect();
    };
  }, [canvasSize.width, canvasSize.height]);

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

  return (
    <div className="flex h-full w-full bg-shade-lighter justify-center items-center relative overflow-y-auto py-20">
      {selectedSlide && (
        <>
          <EditViewObjectActionbar />
          <div className="px-10 h-full w-full max-w-[1000px] flex flex-col justify-center items-center relative">
            <div
              ref={containerRef}
              className="w-full aspect-video relative"
              onMouseDown={handleSlideMouseDown}
            >
              <Slide
                id={selectedSlide.id}
                data={{
                  ...selectedSlide,
                  backgroundColor:
                    selectedSlide.backgroundColor || "var(--color-shade-2)",
                }}
                as="div"
                isEditable={true}
                selectedObjectId={selectedObjectId}
                onResizeStart={handleResizeStart}
                canvasSize={canvasSize}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
