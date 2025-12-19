import { usePlaylistStore, useSelectedLibrary } from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { useContextMenu } from "../hooks/use-context-menu";
import { useItemPanelLibraryContext } from "./context";
import { SlideGroup } from "@/components/presenter/types";

export const LibraryContentItem = ({
  slideGroup,
}: {
  slideGroup: SlideGroup;
}) => {
  const { handleDelete, handleClick, selectedIds } =
    useItemPanelLibraryContext();
  const selectedLibrary = useSelectedLibrary();
  const playlists = usePlaylistStore((s) => s.playlists);

  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );

  const handleAddToPlaylist = (playlistId: string) => {
    if (!selectedLibrary || !slideGroup) return;
    addSlideGroupToPlaylist(playlistId, selectedLibrary.id, slideGroup.id);
  };

  const { openContextMenu } = useContextMenu({
    onDelete: handleDelete,
    onAddToPlaylist: handleAddToPlaylist,
    id: slideGroup.id,
    playlists: playlists,
    selectedCount: selectedIds.length,
  });

  return (
    <button
      className={cn("w-full p-1")}
      onClick={(e) => handleClick(slideGroup.id, e)}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5 shrink-0" color="white" />
        <span className="text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
          {slideGroup.title}
        </span>
      </div>
    </button>
  );
};
