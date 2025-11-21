import { useEditContext } from "@/presenter/edit/context";
import { Reorder } from "motion/react";
import { SlideObject } from "@/components/feature/slide/types";
import { useState, useEffect, useMemo, useRef } from "react";
import { EditViewObjectPanelItem } from "./EditViewObjectPanelItem";

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
          <ReorderableObjectsList />
        )}
      </div>
    </div>
  );
};

const ReorderableObjectsList = () => {
  const { selectedSlide, reorderObjects } = useEditContext();
  const objects = selectedSlide?.objects || [];
  const isReorderingRef = useRef(false);

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

  const [orderedObjects, setOrderedObjects] =
    useState<SlideObject[]>(sortedObjects);

  useEffect(() => {
    if (!isReorderingRef.current) {
      setOrderedObjects(sortedObjects);
    }
    isReorderingRef.current = false;
  }, [sortedObjects]);

  const handleReorder = (newOrderedObjects: SlideObject[]) => {
    isReorderingRef.current = true;
    // update object list UI immediately for smooth animation
    setOrderedObjects(newOrderedObjects);
    // Update the slide objects layers based on the new order
    reorderObjects(newOrderedObjects);
  };

  return (
    <Reorder.Group values={orderedObjects} onReorder={handleReorder}>
      {orderedObjects.map((object) => (
        <Reorder.Item
          className="cursor-grab relative"
          key={object.id}
          value={object}
        >
          <EditViewObjectPanelItem object={object} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
