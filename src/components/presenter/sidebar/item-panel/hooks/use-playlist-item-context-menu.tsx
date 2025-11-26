import { Menu } from "@tauri-apps/api/menu";

export const usePlaylistItemContextMenu = ({
  onRemove,
  id,
}: {
  onRemove: () => void;
  id: string;
}) => {
  const handleRemove = () => {
    onRemove();
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuItems = [
      {
        id: `${id}-remove`,
        text: "Remove",
        action: handleRemove,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};

