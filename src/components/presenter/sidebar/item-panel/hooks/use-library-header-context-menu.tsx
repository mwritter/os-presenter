import { Menu } from "@tauri-apps/api/menu";

export const useLibraryHeaderContextMenu = ({
  onNewPresentation,
}: {
  onNewPresentation: () => void;
}) => {
  const handleNewPresentation = () => {
    onNewPresentation();
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuItems = [
      {
        id: "new-presentation",
        text: "New Presentation",
        action: handleNewPresentation,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};

