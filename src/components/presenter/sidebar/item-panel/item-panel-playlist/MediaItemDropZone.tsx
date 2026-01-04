import { useDroppable } from "@dnd-kit/core";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";
import { cn } from "@/lib/utils";

interface MediaItemDropZoneProps {
  playlistId: string;
  className?: string;
}

export const MediaItemDropZone = ({
  playlistId,
  className,
}: MediaItemDropZoneProps) => {
  const { activeData } = useAppDnd();

  const dragData: AppDragData = {
    type: "endZone",
    sourceId: playlistId,
    zoneType: "playlistItem",
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `playlist-item-end-zone-${playlistId}`,
    data: dragData,
  });

  // Accept playlist items from same playlist or media items from anywhere
  const isValidPlaylistItemDrop =
    activeData &&
    activeData.type === "playlistItem" &&
    activeData.sourceId === playlistId;

  const isValidMediaItemDrop = activeData && activeData.type === "mediaItem";

  const isValidDrop = isValidPlaylistItemDrop || isValidMediaItemDrop;
  const showIndicator = isOver && isValidDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-4 flex-1 transition-colors",
        {
          // Only show indicator when hovering over this zone with a valid drop
          "border-t-2 border-selected min-h-8 bg-selected/10": showIndicator,
        },
        className
      )}
    />
  );
};
