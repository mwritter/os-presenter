import { ItemPanelHeader } from "./ItemPanelHeader";
import { ItemPanelFooter } from "./ItemPanelFooter";
import {
  selectSelectedPlaylist,
  usePresenterStore,
  selectSelectedLibrary,
  selectSelectedSlideGroupId,
  selectSelectedPlaylistItemId,
  selectPlaylists,
} from "@/stores/presenterStore";
import { File } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const ItemPanel = () => {
  return (
    <div className="flex flex-col h-full">
      <ItemPanelHeader />
      <div className="flex-1">
        <ItemPanelContent />
      </div>
      <ItemPanelFooter />
    </div>
  );
};

const ItemPanelContent = () => {
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);

  if (selectedLibrary) {
    return <ItemPanelLibraryContent />;
  }
  if (selectedPlaylist) {
    return <ItemPanelPlaylistContent />;
  }
  return null;
};

const ItemPanelLibraryContent = () => {
  const selectedLibrary = usePresenterStore(selectSelectedLibrary);
  const selectedSlideGroupId = usePresenterStore(selectSelectedSlideGroupId);
  const selectSlideGroup = usePresenterStore((state) => state.selectSlideGroup);
  const playlists = usePresenterStore(selectPlaylists);
  const addSlideGroupToPlaylist = usePresenterStore((state) => state.addSlideGroupToPlaylist);

  if (!selectedLibrary) return null;

  const handleAddToPlaylist = (playlistId: string, slideGroupIndex: number) => {
    addSlideGroupToPlaylist(playlistId, selectedLibrary.id, slideGroupIndex);
  };

  return (
    <div>
      {selectedLibrary.slideGroups.map((slideGroup, index) => {
        const isSelected = selectedSlideGroupId === index;
        return (
          <ContextMenu key={index}>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  "w-full hover:bg-white/10 p-1",
                  isSelected && "bg-white/20"
                )}
                onClick={() => selectSlideGroup(index, selectedLibrary.id)}
              >
                <div className="flex items-center gap-2">
                  <File className="size-3.5" color="white" />
                  <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                    {slideGroup.title}
                  </span>
                </div>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 dark">
              <ContextMenuSub>
                <ContextMenuSubTrigger>Add To</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48 dark">
                  <ContextMenuLabel>Playlists</ContextMenuLabel>
                  {playlists.length === 0 ? (
                    <ContextMenuItem disabled>No playlists available</ContextMenuItem>
                  ) : (
                    playlists.map((playlist) => (
                      <ContextMenuItem
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id, index)}
                      >
                        {playlist.name}
                      </ContextMenuItem>
                    ))
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};

const ItemPanelPlaylistContent = () => {
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);
  const selectedPlaylistItemId = usePresenterStore(selectSelectedPlaylistItemId);
  const selectPlaylistItem = usePresenterStore((state) => state.selectPlaylistItem);

  if (!selectedPlaylist) return null;

  return (
    <div>
      {selectedPlaylist.items.map((item) => {
        const isSelected = selectedPlaylistItemId === item.id;
        const title = item.slideGroup.title; // Access embedded slide group directly
        
        return (
          <button
            className={cn(
              "w-full hover:bg-white/10 p-1",
              isSelected && "bg-white/20"
            )}
            key={item.id}
            onClick={() => selectPlaylistItem(item.id, selectedPlaylist.id)}
          >
            <div className="flex items-center gap-2">
              <File className="size-3.5" color="white" />
              <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                {title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
