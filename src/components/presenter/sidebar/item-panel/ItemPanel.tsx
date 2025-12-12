import { ItemPanelHeader } from "./item-panel-header/ItemPanelHeader";
import { ItemPanelFooter } from "./ItemPanelFooter";
import {
  useSelectedPlaylist,
  useSelectedLibrary,
} from "@/stores/presenterStore";
import { ItemPanelProvider } from "./context";
import { ItemPanelLibraryContent } from "./item-panel-library/ItemPanelLibraryContent";
import { ItemPanelPlaylistContent } from "./item-panel-playlist/ItemPanelPlaylistContent";

export const ItemPanel = () => {
  return (
    <ItemPanelProvider>
      <div className="flex flex-col h-full">
        <ItemPanelHeader />
        <div className="flex flex-col flex-1">
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
