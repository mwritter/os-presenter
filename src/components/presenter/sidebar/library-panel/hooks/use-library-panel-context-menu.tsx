import { Menu } from "@tauri-apps/api/menu";

export const useLibraryPanelContextMenu = ({
  onNewLibrary,
  onNewPlaylist,
  onNewPresentation,
}: {
  onNewLibrary: () => void;
  onNewPlaylist: () => void;
  onNewPresentation: () => void;
}) => {
  const handleNewLibrary = () => {
    onNewLibrary();
  };

  const handleNewPlaylist = () => {
    onNewPlaylist();
  };

  const handleNewPresentation = () => {
    onNewPresentation();
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuItems = [
      {
        id: "new-library",
        text: "New Library",
        action: handleNewLibrary,
      },
      {
        id: "new-playlist",
        text: "New Playlist",
        action: handleNewPlaylist,
      },
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

