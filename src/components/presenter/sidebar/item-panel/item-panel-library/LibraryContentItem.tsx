import {
  useLibraryStore,
  usePlaylistStore,
  useSelectedLibrary,
  useSelectionStore,
} from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { SlideGroup } from "../../../types";
import { useContextMenu } from "../hooks/use-context-menu";

type LibraryContentItemProps = {
  isDragging: boolean;
  onClick: (slideGroupId: string) => void;
  onMultiSelectClick?: (slideGroupId: string, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  selectedCount?: number;
  slideGroup: SlideGroup;
};

export const LibraryContentItem = ({
  onClick,
  onMultiSelectClick,
  onDelete,
  selectedCount = 0,
  slideGroup,
}: LibraryContentItemProps) => {
  const selectedLibrary = useSelectedLibrary();
  const playlists = usePlaylistStore((s) => s.playlists);
  const removeLibrarySlideGroup = useLibraryStore(
    (s) => s.removeLibrarySlideGroup
  );
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const clearSlideGroupSelection = useSelectionStore(
    (s) => s.clearSlideGroupSelection
  );
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(slideGroup.id);
      return;
    }

    if (!selectedLibrary) return;

    // Clear selection if this slide group is currently selected
    if (selectedSlideGroup?.id === slideGroup.id) {
      clearSlideGroupSelection();
    }

    removeLibrarySlideGroup(selectedLibrary.id, slideGroup.id);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!selectedLibrary) return;
    addSlideGroupToPlaylist(playlistId, selectedLibrary.id, slideGroup.id);
  };

  const { openContextMenu } = useContextMenu({
    onDelete: handleDelete,
    onAddToPlaylist: handleAddToPlaylist,
    id: slideGroup.id,
    playlists: playlists,
    selectedCount,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (onMultiSelectClick && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      onMultiSelectClick(slideGroup.id, e);
    } else if (onMultiSelectClick) {
      onMultiSelectClick(slideGroup.id, e);
    } else {
      onClick(slideGroup.id);
    }
  };

  return (
    <button
      className={cn("w-full p-1")}
      onClick={handleClick}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5" color="white" />
        <span className="text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
          {slideGroup.title}
        </span>
      </div>
    </button>
  );
};
