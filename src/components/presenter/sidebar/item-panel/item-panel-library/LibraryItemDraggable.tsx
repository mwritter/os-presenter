import { cn } from "@/lib/utils";
import { LibraryContentItem } from "./LibraryContentItem";
import { useLibraryDrag } from "./hooks/use-library-drag";
import { useItemPanelLibraryContext } from "./context";
import { SlideGroup } from "@/components/presenter/types";

type LibraryItemDraggableProps = {
  slideGroup: SlideGroup;
};

export const LibraryItemDraggable = ({
  slideGroup,
}: LibraryItemDraggableProps) => {
  const {
    slideGroups,
    isSelected,
    selectedIds,
    isMultiSelectMode,
    handleReorder,
  } = useItemPanelLibraryContext();
  const isItemSelected = isSelected(slideGroup.id);
  const { onDragStart, onDragOver, onDrop, isDragging, dropTarget } =
    useLibraryDrag({
      slideGroups,
      slideGroupId: slideGroup.id,
      isSelected: isItemSelected,
      selectedIds,
      onReorder: handleReorder,
    });

  return (
    <div
      className={cn("relative ghost-no-bg ghost-no-ring py-0.5", {
        "opacity-50": isDragging,
        "bg-white/20 ring-1 ring-white/40":
          isItemSelected && !isDragging && !isMultiSelectMode,
        "bg-blue-600": isItemSelected && !isDragging && isMultiSelectMode,
      })}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drop indicator line - before */}
      {dropTarget?.position === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
      )}

      <LibraryContentItem slideGroup={slideGroup} />

      {/* Drop indicator line - after */}
      {dropTarget?.position === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
      )}
    </div>
  );
};
