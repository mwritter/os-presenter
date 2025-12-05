import { List } from "lucide-react";
import {
  useLibraryStore,
  usePlaylistStore,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { DragDropData, LibraryPanelItem } from "./LibraryPanelItem";

type PlaylistItemProps = {
  id: string;
  name: string;
  isMultiSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  selectedCount?: number;
};

export const PlaylistItem = ({
  id,
  name,
  isMultiSelected,
  onClick,
  onDelete,
  selectedCount,
}: PlaylistItemProps) => {
  const selectedPlaylistId = useSelectionStore((s) => s.selectedPlaylistId);
  const selectPlaylist = useSelectionStore((s) => s.selectPlaylist);
  const isSelected = selectedPlaylistId === id;
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);
  const playlists = usePlaylistStore((s) => s.playlists);
  const libraries = useLibraryStore((s) => s.libraries);
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  const handleDelete = (itemId: string) => {
    if (onDelete) {
      onDelete(itemId);
    } else {
      removePlaylist(itemId);
    }
  };

  const handleItemDrop = (data: DragDropData) => {
    if (data.type === "playlistItem") {
      // Don't do anything if dropping on the same playlist
      if (data.sourcePlaylistId === id) return;

      // Find the source playlist and the item being moved
      const sourcePlaylist = playlists.find(
        (pl) => pl.id === data.sourcePlaylistId
      );
      const targetPlaylist = playlists.find((pl) => pl.id === id);

      if (!sourcePlaylist || !targetPlaylist) return;

      // Get all items to move (deep copy to avoid reference issues)
      const itemsToMove = sourcePlaylist.items
        .filter((item) => data.itemIds.includes(item.id))
        .map((item) => ({ ...item }));
      if (itemsToMove.length === 0) return;

      // Remove from source playlist
      const updatedSourceItems = sourcePlaylist.items.filter(
        (item) => !data.itemIds.includes(item.id)
      );

      // Add to target playlist with new orders
      const newItems = itemsToMove.map((item, index) => ({
        ...item,
        order: targetPlaylist.items.length + index,
      }));
      const updatedTargetItems = [...targetPlaylist.items, ...newItems];

      // Update both playlists
      updatePlaylist(data.sourcePlaylistId, { items: updatedSourceItems });
      updatePlaylist(id, { items: updatedTargetItems });

      // Clear the sidebar selection after successful move
      clearSidebarSelection("playlistItem");
    } else if (data.type === "slideGroup") {
      // Add slide groups from library to this playlist
      const sourceLibrary = libraries.find(
        (lib) => lib.id === data.sourceLibraryId
      );
      if (!sourceLibrary) return;

      // Add each slide group to the playlist
      data.slideGroupIds.forEach((slideGroupId) => {
        const slideGroup = sourceLibrary.slideGroups.find(
          (sg) => sg.id === slideGroupId
        );
        if (slideGroup) {
          addSlideGroupToPlaylist(id, data.sourceLibraryId, slideGroupId);
        }
      });

      // Clear the sidebar selection after successful add
      clearSidebarSelection("libraryItem");
    }
  };

  return (
    <LibraryPanelItem
      id={id}
      name={name}
      icon={
        <div className="bg-blue-400 rounded-xs p-[2px]">
          <List className="size-3.5" color="white" />
        </div>
      }
      onUpdate={updatePlaylist}
      onDelete={handleDelete}
      onSelect={selectPlaylist}
      isSelected={isSelected}
      isMultiSelected={isMultiSelected}
      onItemDrop={handleItemDrop}
      onClick={onClick}
      selectedCount={selectedCount}
    />
  );
};
