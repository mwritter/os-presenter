import { ItemPanelHeader } from "./ItemPanelHeader";
import { ItemPanelFooter } from "./ItemPanelFooter";
import {
  useSelectedPlaylist,
  useSelectedLibrary,
} from "@/stores/presenterStore";
import { ItemPanelProvider } from "./context";
import { ItemPanelLibraryContent } from "./ItemPanelLibraryContent";
import { ItemPanelPlaylistContent } from "./ItemPanelPlaylistContent";

export const ItemPanel = () => {
  return (
    <ItemPanelProvider>
      <div className="flex flex-col h-full">
        <ItemPanelHeader />
        <div className="flex-1">
          <ItemPanelContent />
        </div>
        <ItemPanelFooter />
      </div>
    </ItemPanelProvider>
  );
};

const ItemPanelContent = () => {
  const selectedLibrary = useSelectedLibrary();
  const selectedPlaylist = useSelectedPlaylist();

  if (selectedLibrary) {
    return <ItemPanelLibraryContent />;
  }
  if (selectedPlaylist) {
    return <ItemPanelPlaylistContent />;
  }
  return null;
};
