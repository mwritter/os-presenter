import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { LibraryContentItem } from "./LibraryContentItem";
import { useItemPanelLibraryContext } from "./context";
import { useItemPanelContext } from "../context";
import { cn } from "@/lib/utils";
import { SlideGroup } from "@/components/presenter/types";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";
import { EndDropZone } from "../../EndDropZone";

export const LibraryContentDraggableGroup = () => {
  const { slideGroups, libraryId, selectedIds, isSelected, isMultiSelectMode } =
    useItemPanelLibraryContext();
  const { filter } = useItemPanelContext();
  const { activeId, activeData, overId, dropPosition } = useAppDnd();

  // Disable sorting when filtering
  const isSortingDisabled = !!filter;

  return (
    <SortableContext
      items={slideGroups.map((sg) => sg.id)}
      strategy={verticalListSortingStrategy}
      disabled={isSortingDisabled}
    >
      <div className="flex flex-col flex-1 relative">
        <ul>
          {slideGroups.map((slideGroup) => {
            const isDragging =
              activeId === slideGroup.id ||
              (activeData?.selectedIds?.includes(slideGroup.id) ?? false);

            // Get drop position when another library item is dragged over this one
            const itemDropPosition =
              overId === slideGroup.id &&
              activeData?.type === "libraryItem" &&
              activeData?.sourceId === libraryId &&
              !isDragging
                ? dropPosition
                : null;

            return (
              <SortableLibraryItem
                key={slideGroup.id}
                slideGroup={slideGroup}
                libraryId={libraryId!}
                selectedIds={selectedIds}
                isSelected={isSelected(slideGroup.id)}
                isMultiSelectMode={isMultiSelectMode}
                isDragging={isDragging}
                dropPosition={itemDropPosition}
              />
            );
          })}
        </ul>
        {/* End drop zone for reordering to end of list */}
        {libraryId && !isSortingDisabled && (
          <EndDropZone
            zoneId={`library-item-end-zone-${libraryId}`}
            zoneType="libraryItem"
            sourceId={libraryId}
            acceptTypes={["libraryItem"]}
            className="flex-1 min-h-4"
          />
        )}
      </div>
    </SortableContext>
  );
};

interface SortableLibraryItemProps {
  slideGroup: SlideGroup;
  libraryId: string;
  selectedIds: string[];
  isSelected: boolean;
  isMultiSelectMode: boolean;
  isDragging: boolean;
  dropPosition: "before" | "after" | null;
}

const SortableLibraryItem = ({
  slideGroup,
  libraryId,
  selectedIds,
  isSelected,
  isMultiSelectMode,
  isDragging,
  dropPosition,
}: SortableLibraryItemProps) => {
  const dragData: AppDragData = {
    type: "libraryItem",
    sourceId: libraryId,
    item: slideGroup,
    selectedIds: selectedIds.includes(slideGroup.id) ? selectedIds : undefined,
  };

  const { attributes, listeners, setNodeRef } = useSortable({
    id: slideGroup.id,
    data: dragData,
  });

  return (
    <li
      ref={setNodeRef}
      className={cn("relative ghost-no-bg ghost-no-ring py-0.5", {
        "opacity-50": isDragging,
        "bg-white/20 ring-1 ring-white/40":
          isSelected && !isDragging && !isMultiSelectMode,
        "bg-blue-600": isSelected && !isDragging && isMultiSelectMode,
      })}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator line - before */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}

      <LibraryContentItem slideGroup={slideGroup} />

      {/* Drop indicator line - after */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
