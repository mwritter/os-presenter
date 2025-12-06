import { PlaylistItem } from "@/components/presenter/types";
import { usePanelItemDrag } from "@/hooks/use-panel-item-drag";
import { useItemPanelPlaylistContext } from "../context";

export const usePlaylistDrag = ({
  items,
  itemId,
  isSelected,
  selectedIds,
  onReorder,
}: {
  items: PlaylistItem[];
  itemId: string;
  isSelected: boolean;
  selectedIds: string[];
  onReorder: (
    itemIds: string | string[],
    targetItemId: string,
    position: "before" | "after"
  ) => void;
}) => {
  const { draggedItemId, setDraggedItemId, playlistId } =
    useItemPanelPlaylistContext();

  return usePanelItemDrag({
    items,
    itemId,
    isSelected,
    selectedIds,
    sourceId: playlistId!,
    dragState: { draggedItemId, setDraggedItemId },
    dataTransfer: {
      type: "playlistItem",
      itemIdKey: "itemId",
      itemIdsKey: "itemIds",
      sourceIdKey: "sourcePlaylistId",
    },
    onReorder,
  });
};
