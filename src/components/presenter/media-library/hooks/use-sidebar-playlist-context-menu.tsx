import { Menu } from "@tauri-apps/api/menu";

export const useSidebarPlaylistContextMenu = ({
  onDelete,
  onRename,
  selectedCount = 1,
}: {
  id: string;
  onDelete: () => void;
  onRename: () => void;
  selectedCount?: number;
}) => {
  const isMultiple = selectedCount > 1;

  const contextMenuItems = [
    {
      id: "delete-playlist",
      text: isMultiple
        ? `Delete ${selectedCount} Playlists`
        : "Delete Playlist",
      action: onDelete,
    },
    // Only show rename when single item selected
    ...(!isMultiple
      ? [
          {
            id: "rename-playlist",
            text: "Rename Playlist",
            action: onRename,
          },
        ]
      : []),
  ];

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return {
    openContextMenu,
  };
};
