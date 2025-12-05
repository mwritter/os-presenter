import { Menu } from "@tauri-apps/api/menu";

export const usePlaylistItemContextMenu = ({
  onRemove,
  id,
  selectedCount = 0,
}: {
  onRemove: () => void;
  id: string;
  selectedCount?: number;
}) => {
  const handleRemove = () => {
    onRemove();
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isMultipleSelected = selectedCount > 1;
    const removeText = isMultipleSelected
      ? `Remove ${selectedCount} Items`
      : "Remove";

    const contextMenuItems = [
      {
        id: `${id}-remove`,
        text: removeText,
        action: handleRemove,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
