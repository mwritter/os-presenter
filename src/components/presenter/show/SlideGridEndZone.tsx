import { useDroppable } from "@dnd-kit/core";
import { useShowViewDnd, ShowViewDragData } from "./ShowViewDndProvider";
import { cn } from "@/lib/utils";

interface SlideGridEndZoneProps {
  playlistId: string;
  playlistItemId: string;
  totalColumns: number;
  slideCount: number;
  className?: string;
}

export const SlideGridEndZone = ({
  playlistId,
  playlistItemId,
  totalColumns,
  slideCount,
  className,
}: SlideGridEndZoneProps) => {
  const { activeData } = useShowViewDnd();

  // Calculate how many columns to span (remaining cells in the last row)
  // If slides fill the row exactly, span all columns (new row)
  const slidesInLastRow = slideCount % totalColumns;
  const columnsToSpan =
    slidesInLastRow === 0 ? totalColumns : totalColumns - slidesInLastRow;

  const dragData: ShowViewDragData = {
    type: "slideGridEndZone",
    playlistId,
    playlistItemId,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `slide-grid-end-zone-${playlistItemId}`,
    data: dragData,
  });

  // Accept slides from same playlist (for reorder within same group or move from different group)
  const isValidDrop =
    activeData &&
    activeData.type === "slide" &&
    activeData.playlistId === playlistId;

  const showIndicator = isOver && isValidDrop;

  // When empty, span all columns and show a centered indicator
  const isEmpty = slideCount === 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex items-center transition-colors",
        isEmpty ? "min-h-[100px]" : "min-h-[60px]",
        showIndicator && "bg-selected/10",
        className
      )}
      style={{
        gridColumn: isEmpty ? `span ${totalColumns}` : `span ${columnsToSpan}`,
      }}
    >
      {/* Drop indicator - vertical line at the start of the zone */}
      {showIndicator && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-selected rounded-full -translate-x-[10px]" />
      )}
    </div>
  );
};
