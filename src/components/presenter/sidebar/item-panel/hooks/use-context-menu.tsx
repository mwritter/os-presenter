import { Menu } from "@tauri-apps/api/menu";

export const useContextMenu = ({
  onDelete,
  onAddToPlaylist,
  id,
  playlists,
}: {
  onDelete: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  id: string;
  playlists: Array<{ id: string; name: string }>;
}) => {
  const handleDelete = () => {
    onDelete();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    onAddToPlaylist(playlistId);
  };

  // Create the playlist submenu with a header
  const playlistSubmenuItems =
    playlists.length > 0
      ? [
          // Add "Playlists" header as a disabled item
          {
            id: "playlists-header",
            text: "Playlists",
            enabled: false,
          },
          // Add all playlist items with icon and indentation
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
      text: "Add To",
      items: playlistSubmenuItems,
    },
    {
      id: `${id}-delete`,
      text: "Delete",
      action: handleDelete,
    },
  ];

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
