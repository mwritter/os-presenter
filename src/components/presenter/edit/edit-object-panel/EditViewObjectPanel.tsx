import { useEditContext } from "@/presenter/edit/context";
import { useState, useEffect, useMemo } from "react";
import { EditViewObjectPanelItem } from "./EditViewObjectPanelItem";
import { cn } from "@/lib/utils";
import { createDragGhost } from "@/lib/drag-utils";

export const EditSlideObjectPanel = () => {
  const { selectedSlide } = useEditContext();
  const objects = selectedSlide?.objects || [];

  // Filter out background videos for display
  const editableObjects = useMemo(
    () =>
      objects.filter((obj) => {
        // Hide background video objects from the panel
        if (obj.type === "video" && obj.videoType === "background") {
          return false;
        }
        return true;
      }),
    [objects]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-shade-4 border-b border-shade-1">
        <p className="text-gray-400 text-xs">Objects</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {editableObjects.length === 0 ? (
          <p className="text-gray-500 text-xs p-4 text-center">
            No objects on slide
          </p>
        ) : (
          <DraggableObjectsList />
        )}
      </div>
    </div>
  );
};

const DraggableObjectsList = () => {
  const { selectedSlide, reorderObjects } = useEditContext();
  const objects = selectedSlide?.objects || [];

  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  // Create a stable sorted array, filtering out background videos
  const sortedObjects = useMemo(
    () =>
      [...objects]
        .filter((obj) => {
          // Hide background video objects from the panel
          if (obj.type === "video" && obj.videoType === "background") {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.zIndex - a.zIndex),
    [objects]
  );

  // Reset drag state when drag ends globally
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedObjectId(null);
      setDropTarget(null);
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    objectId: string
  ) => {
    setDraggedObjectId(objectId);
    createDragGhost(e, e.currentTarget);
    e.dataTransfer.setData("objectId", objectId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetObjectId: string) => {
    e.preventDefault();

    if (!draggedObjectId) return;
    if (draggedObjectId === targetObjectId) {
      setDropTarget(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";

    setDropTarget({ id: targetObjectId, position });
  };

  const handleDrop = (e: React.DragEvent, targetObjectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dropTarget || !draggedObjectId) return;

    const draggedObject = sortedObjects.find(
      (obj) => obj.id === draggedObjectId
    );
    if (!draggedObject) return;

    // Remove the dragged object from the list
    const remainingObjects = sortedObjects.filter(
      (obj) => obj.id !== draggedObjectId
    );

    // Find the target index
    const targetIndex = remainingObjects.findIndex(
      (obj) => obj.id === targetObjectId
    );
    if (targetIndex === -1) return;

    // Calculate insert position
    const insertIndex =
      dropTarget.position === "after" ? targetIndex + 1 : targetIndex;

    // Insert the dragged object at the new position
    const newOrder = [
      ...remainingObjects.slice(0, insertIndex),
      draggedObject,
      ...remainingObjects.slice(insertIndex),
    ];

    reorderObjects(newOrder);
    setDropTarget(null);
    setDraggedObjectId(null);
  };

  return (
    <div>
      {sortedObjects.map((object) => {
        const isDragging = draggedObjectId === object.id;

        return (
          <div
            key={object.id}
            className={cn("relative", {
              "opacity-50": isDragging,
            })}
            draggable
            onDragStart={(e) => handleDragStart(e, object.id)}
            onDragOver={(e) => handleDragOver(e, object.id)}
            onDrop={(e) => handleDrop(e, object.id)}
          >
            {/* Drop indicator - before */}
            {dropTarget?.id === object.id &&
              dropTarget.position === "before" && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
              )}

            <EditViewObjectPanelItem object={object} />

            {/* Drop indicator - after */}
            {dropTarget?.id === object.id &&
              dropTarget.position === "after" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
              )}
          </div>
        );
      })}
    </div>
  );
};
