import { Menu } from "@tauri-apps/api/menu";

export const useContextMenu = ({
  onDelete,
  onAddToPlaylist,
  id,
  playlists,
  selectedCount = 0,
}: {
  onDelete: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  id: string;
  playlists: Array<{ id: string; name: string }>;
  selectedCount?: number;
}) => {
  const handleDelete = () => {
    onDelete();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(playlistId);
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isMultipleSelected = selectedCount > 1;
    const deleteText = isMultipleSelected
      ? `Delete ${selectedCount} Items`
      : "Delete";

    // Create the playlist submenu with a header
    const playlistSubmenuItems =
      playlists.length > 0
        ? [
            {
              id: "playlists-header",
              text: "Playlists",
              enabled: false,
            },
            ...playlists.map((playlist) => ({
              id: `playlist-${playlist.id}`,
              text: `  ${playlist.name}`,
              action: () => handleAddToPlaylist(playlist.id),
            })),
          ]
        : [
            {
              id: "no-playlists",
              text: "  No playlists available",
              enabled: false,
            },
          ];

    const contextMenuItems = [
      {
        id: `${id}-add-to`,
        text: isMultipleSelected ? `Add ${selectedCount} Items To` : "Add To",
        items: playlistSubmenuItems,
      },
      {
        id: `${id}-delete`,
        text: deleteText,
        action: handleDelete,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
