import {
  useSelectedPlaylistItemPlaylist,
  useSelectionStore,
} from "@/stores/presenterStore";
import { useEffect } from "react";

export const useSmartScroll = ({
  scrollContainerRef,
  itemRefs,
  prevSelectedItemIdRef,
  prevActiveSlideIdRef,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<Map<string, HTMLDivElement>>;
  prevSelectedItemIdRef: React.RefObject<string | null>;
  prevActiveSlideIdRef: React.RefObject<string | null>;
}) => {
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);
  const activeSlide = useSelectionStore((s) => s.activeSlide);
  const playlist = useSelectedPlaylistItemPlaylist();
  // Smart scroll: only scroll when playlist item is manually selected, not when clicking a slide
  useEffect(() => {
    const currentItemId = selectedPlaylistItem?.id ?? null;
    const currentSlideId = activeSlide?.id ?? null;
    const prevItemId = prevSelectedItemIdRef.current;
    const prevSlideId = prevActiveSlideIdRef.current;

    // Update refs for next render
    prevSelectedItemIdRef.current = currentItemId;
    prevActiveSlideIdRef.current = currentSlideId;

    // If playlist item didn't change, don't scroll
    if (currentItemId === prevItemId) return;

    // If no item selected, don't scroll
    if (!currentItemId || !selectedPlaylistItem) return;

    // Check if active slide changed at the same time (indicates user clicked a slide)
    const slideChangedSimultaneously = currentSlideId !== prevSlideId;

    // If slide changed and it belongs to the newly selected item, user clicked a slide → don't scroll
    if (slideChangedSimultaneously && currentSlideId) {
      const selectedItem = playlist?.items.find(
        (item) => item.id === currentItemId
      );
      const slideInSelectedItem = selectedItem?.slideGroup.slides.some(
        (slide) => slide.id === currentSlideId
      );

      if (slideInSelectedItem) {
        // User clicked a slide, don't scroll
        return;
      }
    }

    // User manually selected the playlist item (keyboard or click) → scroll to it
    const itemElement = itemRefs.current.get(currentItemId);
    if (itemElement && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: itemElement.offsetTop,
        behavior: "smooth",
      });
    }
  }, [selectedPlaylistItem, activeSlide, playlist]);
};
