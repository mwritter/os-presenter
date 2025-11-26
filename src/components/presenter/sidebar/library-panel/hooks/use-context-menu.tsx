import { Menu } from "@tauri-apps/api/menu";

export const useContextMenu = ({
  onDelete,
  onRename,
  id,
}: {
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  id: string;
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
    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  const contextMenuItems = [
    {
      id: `${id}-rename`,
      text: "Rename",
      action: handleRename,
    },
    {
      id: `${id}-delete`,
      text: "Delete",
      action: handleDelete,
    },
  ];

  return { openContextMenu };
};
