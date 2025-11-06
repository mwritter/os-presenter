// This will be view for seeing the contents of Playlists and Items from the Library

import {
  selectSelectedSlideGroupData,
  selectSelectedSlideGroupId,
  selectSelectedPlaylistItemId,
  selectSelectedPlaylist,
  usePresenterStore,
  selectSelectedSlideGroup,
  selectSelectedPlaylistItem,
} from "@/stores/presenterStore";

import { Slide } from "@/components/feature/slide/Slide";
import { ShowViewEmptyState } from "@/components/presenter/show/ShowViewEmpty";
import { useEffect, useRef } from "react";
import { ShowViewFooter } from "@/components/presenter/show/ShowViewFooter";

const Show = () => {
  const selectedSlideGroupId = usePresenterStore(selectSelectedSlideGroupId);
  const selectedPlaylistItemId = usePresenterStore(selectSelectedPlaylistItemId);
  const selectedSlideGroup = usePresenterStore(selectSelectedSlideGroup);
  const selectedPlaylistItem = usePresenterStore(selectSelectedPlaylistItem);
  const addSlideToSlideGroup = usePresenterStore((state) => state.addSlideToSlideGroup);
  const addSlideToSelectedSlideGroup = usePresenterStore((state) => state.addSlideToSelectedSlideGroup);
  const selectedPlaylistItemData = usePresenterStore((state) => {
    if (!selectedPlaylistItem) return null;
    const playlist = state.playlists.find(pl => pl.id === selectedPlaylistItem.playlistId);
    return playlist?.items.find(item => item.id === selectedPlaylistItem.id);
  });

  const handleAddBlankSlide = () => {
    // If viewing a library slideGroup directly
    if (selectedSlideGroup) {
      addSlideToSelectedSlideGroup();
    }
    // If viewing a playlist item, add slide to its referenced slideGroup
    else if (selectedPlaylistItemData) {
      addSlideToSlideGroup(
        selectedPlaylistItemData.libraryId,
        selectedPlaylistItemData.slideGroupId
      );
    }
  };

  // Show prompt to select an item from the Item panel
  return <div className="flex flex-col h-full">
    <div className="flex-1">
      {selectedPlaylistItemId ? <ShowPlaylist /> : selectedSlideGroupId ? <ShowSlideGroup /> : <ShowViewEmptyState />}
    </div>
    <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
  </div>;
};

export default Show;

const ShowSlideGroup = () => {
  const slideGroup = usePresenterStore(selectSelectedSlideGroupData);

  if (!slideGroup) {
    return null;
  }

  const hasSlides = slideGroup.slides?.length > 0;

  return (
    <div className="flex flex-col gap-4 p-4 h-full w-full">
      <h2 className="text-xl font-semibold text-white">
        {slideGroup.title}
      </h2>
      {hasSlides ? (
        <div className="flex gap-4 flex-wrap text-white/70">
          {slideGroup.slides.map((slide, index) => (
            <Slide key={`${slideGroup.id}-${index}`} id={`${slideGroup.id}-${index}`} data={slide} />
          ))}
        </div>
      ) : (
        <div className="text-white/50">
          No slides in this slide group
        </div>
      )}
    </div>
  );
};

const ShowPlaylist = () => {
  const playlist = usePresenterStore(selectSelectedPlaylist);
  const selectedItemId = usePresenterStore(selectSelectedPlaylistItemId);
  const libraries = usePresenterStore((state) => state.libraries);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to selected item when it changes
  useEffect(() => {
    if (selectedItemId) {
      const element = itemRefs.current.get(selectedItemId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedItemId]);

  if (!playlist) {
    return null;
  }

  // Helper to get slideGroup data for a playlist item
  const getSlideGroupForItem = (item: { libraryId: string; slideGroupId: string }) => {
    const library = libraries.find(lib => lib.id === item.libraryId);
    return library?.slideGroups.find(sg => sg.id === item.slideGroupId);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full w-full overflow-y-auto">
      <h2 className="text-xl font-semibold text-white sticky top-0 bg-shade-2 py-2">
        {playlist.name}
      </h2>
      <div className="flex flex-col gap-6">
        {playlist.items.map((item) => {
          const slideGroup = getSlideGroupForItem(item);
          const isSelected = selectedItemId === item.id;
          
          if (!slideGroup) return null;

          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 rounded-lg p-2' : ''}`}
            >
              <h3 className="text-lg font-medium text-white mb-2">
                {slideGroup.title}
              </h3>
              <div className="flex flex-col gap-2">
                {slideGroup.slides.map((slide, index) => (
                  <Slide 
                    key={`${item.id}-${index}`} 
                    id={`${item.id}-${index}`} 
                    data={slide} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
