import { Menu } from "@tauri-apps/api/menu";

export const useContextMenu = ({
  onDelete,
  onRename,
  id,
  selectedCount,
}: {
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  id: string;
  selectedCount: number;
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

    const contextMenuItems = [
      {
        id: `${id}-rename`,
        text: "Rename",
        action: handleRename,
        // Disable rename when multiple items are selected
        enabled: selectedCount === 1,
      },
      {
        id: `${id}-delete`,
        text: `Delete`,
        action: handleDelete,
        enabled: true,
      },
    ].filter(({ enabled }) => enabled);

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
