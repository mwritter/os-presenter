import { useEffect, useRef } from "react";
import { ShowViewFooter } from "./ShowViewFooter";
import { ShowViewSlideGrid } from "./ShowViewSlideGrid";
import { useShowKeyboardNav } from "@/hooks/use-show-keyboard-nav";
import {
  usePlaylistStore,
  useSelectionStore,
  useSelectedPlaylistItemPlaylist,
} from "@/stores/presenterStore";
import { useShowViewSpacer } from "./hooks/use-show-view-spacer";
import { useSmartScroll } from "./hooks/use-smart-scroll";

export const ShowViewPlaylistContent = () => {
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);
  const addSlideToPlaylistItem = usePlaylistStore(
    (s) => s.addSlideToPlaylistItem
  );
  const playlist = useSelectedPlaylistItemPlaylist();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevSelectedItemIdRef = useRef<string | null>(null);
  const prevActiveSlideIdRef = useRef<string | null>(null);

  // Setup keyboard navigation for multiple slide groups
  const slideGroups =
    playlist?.items.map((item) => ({
      slides: item.slideGroup.slides,
      title: item.slideGroup.title,
    })) ?? [];

  const { handleKeyDown } = useShowKeyboardNav({
    slideGroups,
  });

  // Focus the container when component mounts to ensure keyboard events work
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useSmartScroll({
    scrollContainerRef,
    itemRefs,
    prevSelectedItemIdRef,
    prevActiveSlideIdRef,
  });

  const spacerHeight = useShowViewSpacer({
    scrollContainerRef,
    itemRefs: itemRefs,
  });

  const handleItemRef = (itemId: string, el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(itemId, el);
    } else {
      itemRefs.current.delete(itemId);
    }
  };

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
      <div ref={scrollContainerRef} className="h-screen overflow-y-auto">
        {playlist?.items.map((item) => {
          const canvasSize = item.slideGroup.canvasSize || {
            width: 1920,
            height: 1080,
          };

          return (
            <div key={item.id} ref={(el) => handleItemRef(item.id, el)}>
              <ShowViewSlideGrid
                slides={item.slideGroup.slides}
                title={item.slideGroup.title}
                canvasSize={canvasSize}
              />
            </div>
          );
        })}
        {/* Spacer equal to height of all items except last, preventing scroll past last item */}
        <div
          style={{
            height: `${spacerHeight}px`,
          }}
        />
      </div>
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};
