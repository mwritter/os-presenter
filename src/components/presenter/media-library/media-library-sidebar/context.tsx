import {
  type MediaPlaylist,
  selectSelectedPlaylist,
  useMediaLibraryStore,
} from "@/stores/presenter/mediaLibraryStore";
import { createContext, ReactNode, useContext } from "react";

interface MediaLibrarySidebarContextType {
  selectedItem: MediaPlaylist | null | undefined;
  onSelectItem: (item: MediaPlaylist) => void;
}

const MediaLibrarySidebarContext = createContext<
  MediaLibrarySidebarContextType | undefined
>(undefined);

export const MediaLibrarySidebarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const selectedItem = useMediaLibraryStore(selectSelectedPlaylist);
  const selectPlaylist = useMediaLibraryStore((state) => state.selectPlaylist);

  const onSelectItem = (item: MediaPlaylist) => {
    selectPlaylist(item.id);
  };

  return (
    <MediaLibrarySidebarContext value={{ selectedItem, onSelectItem }}>
      {children}
    </MediaLibrarySidebarContext>
  );
};

export const useMediaLibrarySidebarContext = () => {
  const context = useContext(MediaLibrarySidebarContext);
  if (!context) {
    throw new Error(
      "useMediaLibrarySidebarContext must be used within a MediaLibrarySidebarProvider"
    );
  }
  return context;
};
