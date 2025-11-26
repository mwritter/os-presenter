import { Menu } from "@tauri-apps/api/menu";

export const usePlaylistHeaderContextMenu = ({
  onNewHeader,
  onNewPlaceholder,
}: {
  onNewHeader: () => void;
  onNewPlaceholder: () => void;
}) => {
  const handleNewHeader = () => {
    onNewHeader();
  };

  const handleNewPlaceholder = () => {
    onNewPlaceholder();
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuItems = [
      {
        id: "new-header",
        text: "New Header",
        action: handleNewHeader,
      },
      {
        id: "new-placeholder",
        text: "New Placeholder",
        action: handleNewPlaceholder,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};

