import {
  useLibraryStore,
  usePlaylistStore,
  useSelectedLibrary,
  useSelectionStore,
} from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { useItemPanelContext } from "./context";
import { SlideGroup } from "../../types";
import { useContextMenu } from "./hooks/use-context-menu";

export const ItemPanelLibraryContent = () => {
  const selectedLibrary = useSelectedLibrary();
  const selectedSlideGroupId = useSelectionStore(
    (s) => s.selectedSlideGroup?.id ?? null
  );
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const { filter } = useItemPanelContext();

  const filteredSlideGroups =
    selectedLibrary?.slideGroups.filter((slideGroup) => {
      // Ensure slide group has an ID and matches filter
      if (!slideGroup.id) {
        console.warn("SlideGroup missing id:", slideGroup);
        return false;
      }
      return slideGroup.title
        .toLowerCase()
        .includes(filter?.toLowerCase() || "");
    }) || [];

  const handleSelectSlideGroup = (slideGroupId: string) => {
    selectSlideGroup(slideGroupId, selectedLibrary!.id);
  };

  if (!selectedLibrary) return null;

  return (
    <div>
      {filteredSlideGroups.map((slideGroup) => {
        const isSelected = selectedSlideGroupId === slideGroup.id;

        return (
          <ItemPanelLibraryContentItem
            key={slideGroup.id}
            isSelected={isSelected}
            onClick={handleSelectSlideGroup}
            slideGroup={slideGroup}
          />
        );
      })}
    </div>
  );
};

const ItemPanelLibraryContentItem = ({
  isSelected,
  onClick,
  slideGroup,
}: {
  isSelected: boolean;
  onClick: (slideGroupId: string) => void;
  slideGroup: SlideGroup;
}) => {
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
  });

  return (
    <button
      className={cn(
        "w-full hover:bg-white/10 p-1",
        isSelected && "bg-white/20"
      )}
      onClick={() => onClick(slideGroup.id)}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5" color="white" />
        <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
          {slideGroup.title}
        </span>
      </div>
    </button>
  );
};
