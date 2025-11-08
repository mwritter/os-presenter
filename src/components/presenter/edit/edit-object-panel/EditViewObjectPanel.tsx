import { useEditContext } from "@/presenter/edit/context";
import { Reorder } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Shapes,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  GripVertical,
} from "lucide-react";
import { SlideObject } from "@/components/feature/slide/types";
import { useState, useEffect, useMemo, useRef } from "react";

export const EditSlideObjectPanel = () => {
  const { selectedSlide } = useEditContext();
  const objects = selectedSlide?.objects || [];
  const sortedObjects = [...objects].sort((a, b) => b.zIndex - a.zIndex); // Highest z-index first

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-shade-4 border-b border-shade-1">
        <p className="text-gray-400 text-xs">Objects (drag to reorder)</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedObjects.length === 0 ? (
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
  
  // Create a stable sorted array
  const sortedObjects = useMemo(
    () => [...objects].sort((a, b) => b.zIndex - a.zIndex),
    [objects]
  );
  
  const [orderedObjects, setOrderedObjects] = useState<SlideObject[]>(sortedObjects);

  // Sync local state with context when objects change externally (not from our own reorder)
  useEffect(() => {
    if (!isReorderingRef.current) {
      setOrderedObjects(sortedObjects);
    }
    // Reset the flag after the update propagates
    isReorderingRef.current = false;
  }, [sortedObjects]);

  const handleReorder = (newOrderedObjects: SlideObject[]) => {
    // Mark that we're in the middle of a reorder operation
    isReorderingRef.current = true;
    
    // update object list UI immediately for smooth animation
    setOrderedObjects(newOrderedObjects);
    
    // Update the slide objects layers based on the new order
    reorderObjects(newOrderedObjects);
  };

  return (
    <Reorder.Group values={orderedObjects} onReorder={handleReorder}>
      {orderedObjects.map((object) => (
        <Reorder.Item key={object.id} value={object}>
          <ReorderableObjectItem obj={object} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

const ReorderableObjectItem = ({ obj }: { obj: SlideObject }) => {
  const { selectObject, deleteObject } = useEditContext();

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "text":
        return <span className="text-xs font-bold">T</span>;
      case "shape":
        return <Shapes className="h-3 w-3" />;
      case "image":
        return <ImageIcon className="h-3 w-3" />;
      case "video":
        return <VideoIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getObjectLabel = (obj: any) => {
    if (obj.type === "text") return obj.content.substring(0, 20) || "Text";
    if (obj.type === "shape") return `${obj.shapeType} Shape`;
    if (obj.type === "image") return "Image";
    if (obj.type === "video") return "Video";
    return "Object";
  };

  return (
    <div
      key={obj.id}
      className={cn(
        "p-2 border-b border-shade-1 hover:bg-shade-2 transition-all select-none"
      )}
      onClick={() => selectObject(obj.id)}
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="text-gray-400 shrink-0 cursor-grab active:cursor-grabbing hover:text-white"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="text-white shrink-0">{getObjectIcon(obj.type)}</div>
          <span className="text-white text-xs truncate">
            {getObjectLabel(obj)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="text-red-400 hover:text-red-300 p-1"
            onClick={(e) => {
              e.stopPropagation();
              deleteObject(obj.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
