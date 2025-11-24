import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  useSelectedPlaylist,
  useSelectedLibrary,
} from "@/stores/presenterStore";
import { usePresenterContext } from "@/context/presenter";
import { useNativeMenu } from "@/components/feature/native-menu/hooks/use-native-menu";

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

  const { openNativeMenu } = useNativeMenu({
    items: [
      {
        id: "new-presentation",
        text: "New Presentation",
        action: openAddPresentationDialog,
      },
    ],
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
        onClick={(e) => openNativeMenu(e)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};

const ItemPanelPlaylistHeader = () => {
  const selectedPlaylist = useSelectedPlaylist();

  const { openNativeMenu } = useNativeMenu({
    items: [
      {
        id: "new-header",
        text: "New Header",
        action: () => {
          // TODO: Implement new header functionality
          console.log("New Header clicked");
        },
      },
      {
        id: "new-placeholder",
        text: "New Placeholder",
        action: () => {
          // TODO: Implement new placeholder functionality
          console.log("New Placeholder clicked");
        },
      },
    ],
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
        onClick={(e) => openNativeMenu(e)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
