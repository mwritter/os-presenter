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

  const contextMenuItems = [
    {
      id: `${id}-add-to`,
      text: "Add To",
      items:
        playlists.length === 0
          ? [
              {
                id: "no-playlists",
                text: "No playlists available",
                enabled: false,
                action: () => {},
              },
            ]
          : playlists.map((playlist) => ({
              id: `playlist-${playlist.id}`,
              text: playlist.name,
              action: () => handleAddToPlaylist(playlist.id),
            })),
    },
    {
      item: "Separator" as const,
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

