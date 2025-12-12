import { PlaylistItem } from "@/components/presenter/types";
import { useItemReorder } from "@/hooks/use-item-reorder";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import {
  usePlaylistStore,
  useSelectedPlaylist,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { createContext, useContext, useRef } from "react";
import { useItemPanelContext } from "../context";

interface ItemPanelPlaylistContextType {
  playlistId: string | null;
  items: PlaylistItem[];
  selectedIds: string[];
  selectedItem: PlaylistItem | undefined;
  isMultiSelectMode: boolean;
  handleDelete: () => void;
  handleReorder: (
    draggedItemIds: string | string[],
    targetItemId: string | null,
    position: "before" | "after" | "end"
  ) => void;
  handleClick: (itemId: string, e: React.MouseEvent) => void;
  isSelected: (id: string) => boolean;
}

const ItemPanelPlaylistContext = createContext<
  ItemPanelPlaylistContextType | undefined
>(undefined);

export const ItemPanelPlaylistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPlaylist = useSelectedPlaylist();
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const removePlaylistItem = usePlaylistStore((s) => s.removePlaylistItem);
  const reorderPlaylistItems = usePlaylistStore((s) => s.reorderPlaylistItems);
  const selectedPlaylistItemId = useSelectionStore(
    (s) => s.selectedPlaylistItem?.id ?? null
  );
  const clearPlaylistItemSelection = useSelectionStore(
    (s) => s.clearPlaylistItemSelection
  );
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

  const filteredItems = orderedItems.filter((item) => {
    return filter
      ? item.slideGroup.title.toLowerCase().includes(filter.toLowerCase())
      : true;
  });

  // Multi-select support
  const {
    selectedIds,
    handleItemClick,
    isSelected: isSidebarSelected,
    isMultiSelectMode,
  } = useSidebarMultiSelect({
    type: "playlistItem",
    items: filteredItems,
    containerRef,
  });

  // Combined selection check: sidebar multi-select OR active playlist item
  const isSelected = (id: string) => {
    if (isMultiSelectMode) {
      return isSidebarSelected(id);
    }
    return id === selectedPlaylistItemId;
  };

  // Delete playlist items
  const handleDelete = () => {
    if (!selectedPlaylist) return;

    selectedIds.forEach((id) => {
      if (selectedPlaylistItemId === id) {
        clearPlaylistItemSelection();
      }
      removePlaylistItem(selectedPlaylist.id, id);
    });

    clearSidebarSelection("playlistItem");
  };

  // Click a playlist item
  const handleClick = (itemId: string, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      handleItemClick(itemId, e);
    } else {
      handleItemClick(itemId, e);
      selectPlaylistItem(itemId, selectedPlaylist!.id);
    }
  };

  const selectedItem = filteredItems.find(
    (item) => item.id === selectedPlaylistItemId
  );

  return (
    <ItemPanelPlaylistContext
      value={{
        playlistId: selectedPlaylist?.id ?? null,
        items: filteredItems,
        handleReorder,
        selectedIds,
        selectedItem,
        isMultiSelectMode,
        isSelected,
        handleDelete,
        handleClick,
      }}
    >
      <div ref={containerRef} className="flex flex-col flex-1">
        {children}
      </div>
    </ItemPanelPlaylistContext>
  );
};

export const useItemPanelPlaylistContext = () => {
  const context = useContext(ItemPanelPlaylistContext);
  if (context === undefined) {
    throw new Error(
      "useItemPanelPlaylistContext must be used within a ItemPanelPlaylistProvider"
    );
  }
  return context;
};
