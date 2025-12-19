import { Menu } from "@tauri-apps/api/menu";
import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";

export const useSidebarHeaderContextMenu = () => {
  const createPlaylist = useMediaLibraryStore((state) => state.createPlaylist);

  const handleNewMediaPlaylist = async () => {
    try {
      await createPlaylist();
    } catch (error) {
      console.error("Failed to create new media playlist:", error);
    }
  };

  const contextMenuItems = [
    {
      id: "new-media-playlist",
      text: "New Media Playlist",
      action: handleNewMediaPlaylist,
    },
  ];

  const openContextMenu = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return {
    openContextMenu,
    handleNewMediaPlaylist,
  };
};
