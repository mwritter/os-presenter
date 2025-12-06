import { useSelectedPlaylist } from "@/stores/presenterStore";
import { usePlaylistHeaderContextMenu } from "../hooks/use-playlist-header-context-menu";
import { ItemPanelHeaderBase } from "./ItemPanelHeaderBase";

export const ItemPanelPlaylistHeader = () => {
  const selectedPlaylist = useSelectedPlaylist();

  const handleNewHeader = () => {
    // TODO: Implement new header functionality
    console.log("New Header clicked");
  };

  const handleNewPlaceholder = () => {
    // TODO: Implement new placeholder functionality
    console.log("New Placeholder clicked");
  };

  const { openContextMenu } = usePlaylistHeaderContextMenu({
    onNewHeader: handleNewHeader,
    onNewPlaceholder: handleNewPlaceholder,
  });

  const itemsCount = selectedPlaylist?.items.length ?? 0;

  return (
    <ItemPanelHeaderBase
      itemCount={itemsCount}
      onAdd={(e) => openContextMenu(e)}
    />
  );
};
