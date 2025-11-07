// This will be view for seeing the contents of Playlists and Items from the Library

import { ShowViewEmptyState } from "@/components/presenter/show/ShowViewEmpty";
import { ShowViewFooter } from "@/components/presenter/show/ShowViewFooter";
import { ShowViewSlideGrid } from "@/components/presenter/show/ShowViewSlideGrid";
import {
  selectSelectedPlaylistItemData,
  selectSelectedSlideGroupData,
  selectSelectedSlideGroup,
  selectSelectedPlaylistItem,
  usePresenterStore,
} from "@/stores/presenterStore";

const Show = () => {
  // Check if a library item or playlist item is selected
  const selectedSlideGroupData = usePresenterStore(
    selectSelectedSlideGroupData
  );
  const selectedPlaylistItemData = usePresenterStore(
    selectSelectedPlaylistItemData
  );
  return (
    <>
      {selectedSlideGroupData && <ShowViewLibraryContent />}
      {selectedPlaylistItemData && <ShowViewPlaylistContent />}
      {!selectedSlideGroupData && !selectedPlaylistItemData && (
        <ShowViewEmptyState />
      )}
    </>
  );
};

export default Show;

/* For Library Items this should be one header and one grid */
const ShowViewLibraryContent = () => {
  const selectedSlideGroupData = usePresenterStore(
    selectSelectedSlideGroupData
  );
  const selectedSlideGroup = usePresenterStore(selectSelectedSlideGroup);
  const addSlideToSlideGroup = usePresenterStore(
    (state) => state.addSlideToSlideGroup
  );
  const handleAddBlankSlide = () => {
    if (!selectedSlideGroup) return;
    addSlideToSlideGroup(
      selectedSlideGroup.libraryId,
      selectedSlideGroup.index
    );
  };
  return (
    <div className="flex flex-col h-full w-full relative">
      <ShowViewSlideGrid
        slides={selectedSlideGroupData?.slides ?? []}
        title={selectedSlideGroupData?.title ?? ""}
      />
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};

/* For Playlist Items this should be a collection of headers and grids */
const ShowViewPlaylistContent = () => {
  const selectedPlaylistItem = usePresenterStore(selectSelectedPlaylistItem);
  const addSlideToPlaylistItem = usePresenterStore(
    (state) => state.addSlideToPlaylistItem
  );
  const playlist = usePresenterStore((s) =>
    s.playlists.find((p) => p.id === selectedPlaylistItem?.playlistId)
  );
  const handleAddBlankSlide = () => {
    if (!selectedPlaylistItem) return;
    addSlideToPlaylistItem(
      selectedPlaylistItem.playlistId,
      selectedPlaylistItem.id
    );
  };
  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 overflow-y-auto pb-20">
        {playlist?.items.map((item) => (
          <div key={item.id}>
            <ShowViewSlideGrid
              slides={item.slideGroup.slides}
              title={item.slideGroup.title}
            />
          </div>
        ))}
      </div>
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};
