import { Menu } from "@tauri-apps/api/menu";

export const useContextMenu = ({
  onDelete,
  onRename,
  id,
  selectedCount = 0,
}: {
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  id: string;
  selectedCount?: number;
}) => {
  const handleDelete = () => {
    onDelete(id);
  };

  const handleRename = () => {
    onRename(id);
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Build context menu items based on selection
    const isMultipleSelected = selectedCount > 1;
    const deleteText = isMultipleSelected
      ? `Delete ${selectedCount} Items`
      : "Delete";

    const contextMenuItems = [
      {
        id: `${id}-rename`,
        text: "Rename",
        action: handleRename,
        // Disable rename when multiple items are selected
        enabled: !isMultipleSelected,
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
