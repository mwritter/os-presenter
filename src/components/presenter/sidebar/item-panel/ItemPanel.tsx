import { ItemPanelHeader } from "./ItemPanelHeader";
import { ItemPanelFooter } from "./ItemPanelFooter";
import {
  selectSelectedPlaylist,
  usePresenterStore,
  selectSelectedLibrary,
  selectSelectedSlideGroupId,
  selectSelectedPlaylistItemId,
} from "@/stores/presenterStore";
import { File } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!selectedLibrary) return null;

  return (
    <div>
      {selectedLibrary.slideGroups.map((slideGroup) => {
        const isSelected = selectedSlideGroupId === slideGroup.id;
        return (
          <button
            className={cn(
              "w-full hover:bg-white/10 p-1",
              isSelected && "bg-white/20"
            )}
            key={slideGroup.id}
            onClick={() => selectSlideGroup(slideGroup.id, selectedLibrary.id)}
          >
            <div className="flex items-center gap-2">
              <File className="size-3.5" color="white" />
              <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                {slideGroup.title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ItemPanelPlaylistContent = () => {
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);
  const selectedPlaylistItemId = usePresenterStore(selectSelectedPlaylistItemId);
  const selectPlaylistItem = usePresenterStore((state) => state.selectPlaylistItem);
  const libraries = usePresenterStore((state) => state.libraries);

  if (!selectedPlaylist) return null;

  // Helper to get slideGroup title for a playlist item
  const getSlideGroupTitle = (item: { libraryId: string; slideGroupId: string }) => {
    const library = libraries.find(lib => lib.id === item.libraryId);
    const slideGroup = library?.slideGroups.find(sg => sg.id === item.slideGroupId);
    return slideGroup?.title ?? 'Unknown';
  };

  return (
    <div>
      {selectedPlaylist.items.map((item) => {
        const isSelected = selectedPlaylistItemId === item.id;
        const title = getSlideGroupTitle(item);
        
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
