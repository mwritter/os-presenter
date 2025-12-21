import { useDroppable } from "@dnd-kit/core";
import { useAppDnd, AppDragData, AppDragType } from "@/components/dnd/AppDndProvider";
import { cn } from "@/lib/utils";

interface EndDropZoneProps {
  zoneId: string;
  zoneType: "library" | "playlist" | "libraryItem" | "playlistItem";
  sourceId: string; // The container ID for item types
  acceptTypes: AppDragType[]; // Which drag types this zone accepts
  className?: string;
}

export const EndDropZone = ({
  zoneId,
  zoneType,
  sourceId,
  acceptTypes,
  className,
}: EndDropZoneProps) => {
  const { activeData } = useAppDnd();

  const dragData: AppDragData = {
    type: "endZone",
    sourceId,
    zoneType,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: zoneId,
    data: dragData,
  });

  // Only show as active when dragging an acceptable type
  const isValidDrop =
    activeData &&
    acceptTypes.includes(activeData.type) &&
    // For item types, must be from the same container
    (zoneType !== "libraryItem" && zoneType !== "playlistItem"
      ? true
      : activeData.sourceId === sourceId);

  const showIndicator = isOver && isValidDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-8",
        {
          "border-t-2 border-selected": showIndicator,
        },
        className
      )}
    ></div>
  );
};
