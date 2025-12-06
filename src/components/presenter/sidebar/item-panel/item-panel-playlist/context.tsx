import { PlaylistItem } from "@/components/presenter/types";
import { useItemReorder } from "@/hooks/use-item-reorder";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import {
  usePlaylistStore,
  useSelectedPlaylist,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { createContext, useContext, useRef, useState } from "react";
import { useItemPanelContext } from "../context";

interface ItemPanelPlaylistContextType {
  playlistId: string | null;
  items: PlaylistItem[];
  selectedIds: string[];
  selectedItem: PlaylistItem | undefined;
  isMultiSelectMode: boolean;
  draggedItemId: string | null;
  handleDelete: () => void;
  handleReorder: (
    draggedItemIds: string | string[],
    targetItemId: string,
    position: "before" | "after"
  ) => void;
  handleClick: (itemId: string, e: React.MouseEvent) => void;
  isSelected: (id: string) => boolean;
  setDraggedItemId: (id: string | null) => void;
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
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
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
    // When not in multi-select mode, show the active playlist item as selected
    return id === selectedPlaylistItemId;
  };

  // Delete playlist items
  const handleDelete = () => {
    if (!selectedPlaylist) return;

    selectedIds.forEach((id) => {
      // Clear selection if this item is currently selected
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
      // Clear multi-selection and do normal select
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
        draggedItemId,
        isSelected,
        handleDelete,
        handleClick,
        setDraggedItemId,
      }}
    >
      <div ref={containerRef}>{children}</div>
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
