import { SlideGroup } from "@/components/presenter/types";
import { usePanelItemDrag } from "@/hooks/use-panel-item-drag";
import { useItemPanelLibraryContext } from "../context";

export const useLibraryDrag = ({
  slideGroups,
  slideGroupId,
  isSelected,
  selectedIds,
  onReorder,
}: {
  slideGroups: SlideGroup[];
  slideGroupId: string;
  isSelected: boolean;
  selectedIds: string[];
  onReorder: (
    slideGroupIds: string | string[],
    targetItemId: string,
    position: "before" | "after"
  ) => void;
}) => {
  const { draggedItemId, setDraggedItemId, libraryId } =
    useItemPanelLibraryContext();

  return usePanelItemDrag({
    items: slideGroups,
    itemId: slideGroupId,
    isSelected,
    selectedIds,
    sourceId: libraryId!,
    dragState: { draggedItemId, setDraggedItemId },
    dataTransfer: {
      type: "slideGroup",
      itemIdKey: "slideGroupId",
      itemIdsKey: "slideGroupIds",
      sourceIdKey: "sourceLibraryId",
    },
    onReorder,
  });
};
