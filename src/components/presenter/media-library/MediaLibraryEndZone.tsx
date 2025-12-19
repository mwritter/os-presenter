import { useDroppable } from "@dnd-kit/core";
import {
  useMediaLibraryDnd,
  MediaLibraryDragData,
} from "./MediaLibraryDndProvider";
import { cn } from "@/lib/utils";

interface MediaLibraryEndZoneProps {
  playlistId: string;
  className?: string;
}

export const MediaLibraryEndZone = ({
  playlistId,
  className,
}: MediaLibraryEndZoneProps) => {
  const { activeData } = useMediaLibraryDnd();

  const dragData: MediaLibraryDragData = {
    type: "mediaEndZone",
    playlistId,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `media-library-end-zone-${playlistId}`,
    data: dragData,
  });

  // Accept media items from same playlist
  const isValidDrop =
    activeData &&
    activeData.type === "mediaItem" &&
    activeData.playlistId === playlistId;

  const showIndicator = isOver && isValidDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex items-center min-h-[60px] flex-1 transition-colors",
        showIndicator && "bg-selected/10",
        className
      )}
    >
      {/* Drop indicator - vertical line at the start of the zone */}
      {showIndicator && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-selected rounded-full -translate-x-[10px]" />
      )}
    </div>
  );
};
