import {
  useSelectedPlaylist,
  usePlaylistStore,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { useItemPanelContext } from "../context";
import { PlaylistItem } from "@/components/presenter/types";
import { PlaylistContentDragableGroup } from "./PlaylistContentDragableGroup";
import { useItemReorder } from "@/hooks/use-item-reorder";

export const ItemPanelPlaylistContent = () => {
  const selectedPlaylist = useSelectedPlaylist();
  const selectedPlaylistItemId = useSelectionStore(
    (s) => s.selectedPlaylistItem?.id ?? null
  );
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const clearPlaylistItemSelection = useSelectionStore(
    (s) => s.clearPlaylistItemSelection
  );
  const removePlaylistItem = usePlaylistStore((s) => s.removePlaylistItem);
  const reorderPlaylistItems = usePlaylistStore((s) => s.reorderPlaylistItems);
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );
  const { filter } = useItemPanelContext();

  const { orderedItems, handleReorder } = useItemReorder<PlaylistItem>({
    items: selectedPlaylist?.items ?? [],
    onReorder: (items) => {
      reorderPlaylistItems(selectedPlaylist!.id, items);
    },
    active: !filter,
  });

  const filteredItems =
    selectedPlaylist?.items.filter((item) => {
      return item.slideGroup.title.toLowerCase().includes(filter.toLowerCase());
    }) || [];

  const handleSelectPlaylistItem = (itemId: string) => {
    console.log("handleSelectPlaylistItem", itemId);
    selectPlaylistItem(itemId, selectedPlaylist!.id);
  };

  const handleRemovePlaylistItem = (itemId: string) => {
    if (selectedPlaylist) {
      removePlaylistItem(selectedPlaylist.id, itemId);
    }
  };

  const handleRemoveMultiple = (ids: string[]) => {
    if (!selectedPlaylist) return;

    ids.forEach((id) => {
      if (selectedPlaylistItemId === id) {
        clearPlaylistItemSelection();
      }
      removePlaylistItem(selectedPlaylist.id, id);
    });

    clearSidebarSelection("playlistItem");
  };

  if (!selectedPlaylist) return null;

  const items = filter ? filteredItems : orderedItems;

  return (
    <PlaylistContentDragableGroup
      items={items}
      sourcePlaylistId={selectedPlaylist.id}
      selectedItemId={selectedPlaylistItemId}
      isFiltering={!!filter}
      onSelect={handleSelectPlaylistItem}
      onRemove={handleRemovePlaylistItem}
      onReorder={handleReorder}
      onRemoveMultiple={handleRemoveMultiple}
    />
  );
};
