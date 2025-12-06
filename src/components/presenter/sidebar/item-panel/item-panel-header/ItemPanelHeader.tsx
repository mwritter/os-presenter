import {
  useSelectedPlaylist,
  useSelectedLibrary,
} from "@/stores/presenterStore";

import { ItemPanelPlaylistHeader } from "./ItemPanelPlaylistHeader";
import { ItemPanelLibraryHeader } from "./ItemPanelLibraryHeader";

export const ItemPanelHeader = () => {
  const selectedLibrary = useSelectedLibrary();
  const selectedPlaylist = useSelectedPlaylist();

  if (selectedLibrary) {
    return <ItemPanelLibraryHeader />;
  }
  if (selectedPlaylist) {
    return <ItemPanelPlaylistHeader />;
  }
  return <ItemPanelLibraryHeader />;
};
