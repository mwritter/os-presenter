// This will be view for seeing the contents of Playlists and Items from the Library

import { ShowViewEmptyState } from "@/components/presenter/show/ShowViewEmpty";
import { ShowViewFooter } from "@/components/presenter/show/ShowViewFooter";
import { ShowViewSlideGrid } from "@/components/presenter/show/ShowViewSlideGrid";
import {
  useSelectedPlaylistItemData,
  useSelectedSlideGroupData,
  useSelectionStore,
  useLibraryStore,
  usePlaylistStore,
} from "@/stores/presenterStore";
import { useShowKeyboardNav } from "@/hooks/use-show-keyboard-nav";
import { useEffect, useRef } from "react";

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

/* For Library Items this should be one header and one grid */
const ShowViewLibraryContent = () => {
  const selectedSlideGroupData = useSelectedSlideGroupData();
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);
  const addSlideToSlideGroup = useLibraryStore((s) => s.addSlideToSlideGroup);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup keyboard navigation for single slide group
  const slideGroups = selectedSlideGroupData
    ? [
        {
          slides: selectedSlideGroupData.slides,
          title: selectedSlideGroupData.title,
        },
      ]
    : [];

  const { handleKeyDown } = useShowKeyboardNav({
    slideGroups,
    enableMultiGroupNavigation: false,
  });

  // Focus the container when component mounts to ensure keyboard events work
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleAddBlankSlide = () => {
    if (!selectedSlideGroup) return;
    addSlideToSlideGroup(
      selectedSlideGroup.libraryId,
      selectedSlideGroup.index
    );
  };

  const canvasSize = selectedSlideGroupData?.canvasSize || {
    width: 1920,
    height: 1080,
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full relative outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto">
        <ShowViewSlideGrid
          slides={selectedSlideGroupData?.slides ?? []}
          title={selectedSlideGroupData?.title ?? ""}
          canvasSize={canvasSize}
        />
      </div>
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};

/* For Playlist Items this should be a collection of headers and grids */
const ShowViewPlaylistContent = () => {
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);
  const addSlideToPlaylistItem = usePlaylistStore(
    (s) => s.addSlideToPlaylistItem
  );
  const playlist = usePlaylistStore((s) =>
    s.playlists.find((p) => p.id === selectedPlaylistItem?.playlistId)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup keyboard navigation for multiple slide groups
  const slideGroups =
    playlist?.items.map((item) => ({
      slides: item.slideGroup.slides,
      title: item.slideGroup.title,
    })) ?? [];

  const { handleKeyDown } = useShowKeyboardNav({
    slideGroups,
    enableMultiGroupNavigation: true, // Enable double-press navigation between groups
  });

  // Focus the container when component mounts to ensure keyboard events work
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleAddBlankSlide = () => {
    if (!selectedPlaylistItem) return;
    addSlideToPlaylistItem(
      selectedPlaylistItem.playlistId,
      selectedPlaylistItem.id
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full relative outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto pb-20">
        {playlist?.items.map((item) => {
          const canvasSize = item.slideGroup.canvasSize || {
            width: 1920,
            height: 1080,
          };
          return (
            <div key={item.id}>
              <ShowViewSlideGrid
                slides={item.slideGroup.slides}
                title={item.slideGroup.title}
                canvasSize={canvasSize}
              />
            </div>
          );
        })}
      </div>
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};
