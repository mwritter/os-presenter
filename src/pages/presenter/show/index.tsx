// This will be view for seeing the contents of Playlists and Items from the Library

import { ShowViewEmptyState } from "@/components/presenter/show/ShowViewEmpty";
import {
  useSelectedPlaylistItemData,
  useSelectedSlideGroupData,
} from "@/stores/presenter/presenterStore";
import { ShowViewLibraryContent } from "@/components/presenter/show/ShowViewLibraryContent";
import { ShowViewPlaylistContent } from "@/components/presenter/show/ShowViewPlaylistContent";

const Show = () => {
  // Check if a library item or playlist item is selected
  const selectedSlideGroupData = useSelectedSlideGroupData();
  const selectedPlaylistItemData = useSelectedPlaylistItemData();
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
