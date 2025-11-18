import {
  useSelectedLibrary,
  usePlaylistStore,
  useSelectionStore,
} from "@/stores/presenterStore";
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
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { useItemPanelContext } from "./context";

export const ItemPanelLibraryContent = () => {
  const selectedLibrary = useSelectedLibrary();
  const selectedSlideGroupId = useSelectionStore((s) => s.selectedSlideGroup?.index ?? null);
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const playlists = usePlaylistStore((s) => s.playlists);
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const { filter } = useItemPanelContext();

  const filteredSlideGroups =
    selectedLibrary?.slideGroups.filter((slideGroup) => {
      return slideGroup.title
        .toLowerCase()
        .includes(filter?.toLowerCase() || "");
    }) || [];

  const handleAddToPlaylist = (playlistId: string, slideGroupIndex: number) => {
    addSlideGroupToPlaylist(playlistId, selectedLibrary!.id, slideGroupIndex);
  };

  const handleSelectSlideGroup = (index: number) => {
    selectSlideGroup(index, selectedLibrary!.id);
  };

  if (!selectedLibrary) return null;

  return (
    <div>
      {filteredSlideGroups.map((slideGroup, index) => {
        const isSelected = selectedSlideGroupId === index;
        return (
          <ContextMenu key={index}>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  "w-full hover:bg-white/10 p-1",
                  isSelected && "bg-white/20"
                )}
                onClick={() => handleSelectSlideGroup(index)}
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
                    <ContextMenuItem disabled>
                      No playlists available
                    </ContextMenuItem>
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
