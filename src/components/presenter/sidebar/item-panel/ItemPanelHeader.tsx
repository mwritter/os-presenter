import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  useSelectedPlaylist,
  useSelectedLibrary,
} from "@/stores/presenterStore";
import { usePresenterContext } from "@/context/presenter";
import { useLibraryHeaderContextMenu } from "./hooks/use-library-header-context-menu";
import { usePlaylistHeaderContextMenu } from "./hooks/use-playlist-header-context-menu";

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

const ItemPanelLibraryHeader = () => {
  const selectedLibrary = useSelectedLibrary();
  const { openAddPresentationDialog } = usePresenterContext();

  const { openContextMenu } = useLibraryHeaderContextMenu({
    onNewPresentation: openAddPresentationDialog,
  });

  return (
    <div className="flex justify-between items-center text-[10px] uppercase p-2 bg-shade-3">
      <span className="text-gray-400">
        {selectedLibrary?.slideGroups.length} items
      </span>
      <Button
        className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
        variant="ghost"
        size="icon-xs"
        onClick={(e) => openContextMenu(e)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};

const ItemPanelPlaylistHeader = () => {
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

  return (
    <div className="flex justify-between items-center text-[10px] uppercase p-2 bg-shade-3">
      <span className="text-gray-400">
        {selectedPlaylist?.items.length} items
      </span>
      <Button
        className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
        variant="ghost"
        size="icon-xs"
        onClick={(e) => openContextMenu(e)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
