import { useEditContext } from "@/presenter/edit/context";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { EditViewObjectPanelItem } from "./EditViewObjectPanelItem";
import { cn } from "@/lib/utils";
import { ItemDragOverlay } from "@/components/dnd";
import { getObjectLabel } from "../utils/getObjectLabel";
import { getObjectIcon } from "../utils/getObjectIcon";
import {
  SlideObject,
  ImageObject,
  VideoObject,
} from "@/components/feature/slide/types";

export const EditSlideObjectPanel = () => {
  const { selectedSlide } = useEditContext();
  const objects = selectedSlide?.objects || [];

  // Filter out background media (videos and images from media library) for display
  const editableObjects = objects.filter((obj) => {
    // Hide background video objects from the panel
    if (
      obj.type === "video" &&
      (obj as VideoObject).videoType === "background"
    ) {
      return false;
    }
    // Hide background image objects from the panel
    if (
      obj.type === "image" &&
      (obj as ImageObject).imageType === "background"
    ) {
      return false;
    }
    return true;
  });

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Create a stable sorted array, filtering out background media
  const sortedObjects = [...objects]
    .filter((obj) => {
      // Hide background video objects from the panel
      if (
        obj.type === "video" &&
        (obj as VideoObject).videoType === "background"
      ) {
        return false;
      }
      // Hide background image objects from the panel
      if (
        obj.type === "image" &&
        (obj as ImageObject).imageType === "background"
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.zIndex - a.zIndex);

  const activeObject = sortedObjects.find((obj) => obj.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;

    if (!over) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    setOverId(over.id as string);

    // Calculate drop position
    const activeIndex = sortedObjects.findIndex((obj) => obj.id === active.id);
    const overIndex = sortedObjects.findIndex((obj) => obj.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      setDropPosition(activeIndex < overIndex ? "after" : "before");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);
    setDropPosition(null);

    if (!over || active.id === over.id) {
      return;
    }

    const draggedObject = sortedObjects.find((obj) => obj.id === active.id);
    if (!draggedObject) return;

    // Remove the dragged object from the list
    const remainingObjects = sortedObjects.filter(
      (obj) => obj.id !== active.id
    );

    // Find the target index
    const targetIndex = remainingObjects.findIndex((obj) => obj.id === over.id);
    if (targetIndex === -1) return;

    // Calculate insert position based on original indices
    const activeIndex = sortedObjects.findIndex((obj) => obj.id === active.id);
    const overIndex = sortedObjects.findIndex((obj) => obj.id === over.id);
    const insertIndex = activeIndex < overIndex ? targetIndex + 1 : targetIndex;

    // Insert the dragged object at the new position
    const newOrder = [
      ...remainingObjects.slice(0, insertIndex),
      draggedObject,
      ...remainingObjects.slice(insertIndex),
    ];

    reorderObjects(newOrder);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedObjects.map((obj) => obj.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {sortedObjects.map((object) => {
            const isDragging = activeId === object.id;
            const isDropTarget = overId === object.id && activeId !== object.id;
            const itemDropPosition = isDropTarget ? dropPosition : null;

            return (
              <SortableObjectItem
                key={object.id}
                object={object}
                isDragging={isDragging}
                dropPosition={itemDropPosition}
              />
            );
          })}
        </div>
      </SortableContext>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeId && activeObject && (
            <ItemDragOverlay>
              <div className="flex items-center gap-2 text-white text-xs">
                {getObjectIcon(activeObject.type)}
                <span>{getObjectLabel(activeObject)}</span>
              </div>
            </ItemDragOverlay>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

interface SortableObjectItemProps {
  object: SlideObject;
  isDragging: boolean;
  dropPosition: "before" | "after" | null;
}

const SortableObjectItem = ({
  object,
  isDragging,
  dropPosition,
}: SortableObjectItemProps) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: object.id,
  });

  // Don't apply transform - we only want indicators, not shifting items
  return (
    <div
      ref={setNodeRef}
      className={cn("relative", {
        "opacity-50": isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator - before */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}

      <EditViewObjectPanelItem object={object} />

      {/* Drop indicator - after */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </div>
  );
};
