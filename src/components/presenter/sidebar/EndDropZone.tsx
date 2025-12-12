import { useDroppable } from "@dnd-kit/core";
import {
  useSidebarDnd,
  SidebarDragData,
  SidebarDragType,
} from "./SidebarDndProvider";
import { cn } from "@/lib/utils";

interface EndDropZoneProps {
  zoneId: string;
  zoneType: "library" | "playlist" | "libraryItem" | "playlistItem";
  sourceId: string; // The container ID for item types
  acceptTypes: SidebarDragType[]; // Which drag types this zone accepts
  className?: string;
}

export const EndDropZone = ({
  zoneId,
  zoneType,
  sourceId,
  acceptTypes,
  className,
}: EndDropZoneProps) => {
  const { activeData } = useSidebarDnd();

  const dragData: SidebarDragData = {
    type: "endZone",
    sourceId,
    item: {} as any, // End zones don't represent an item
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
