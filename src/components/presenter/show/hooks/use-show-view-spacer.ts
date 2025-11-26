import { useSelectedPlaylistItemPlaylist } from "@/stores/presenterStore";
import { useEffect, useState } from "react";

export const useShowViewSpacer = ({
  scrollContainerRef,
  itemRefs,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<Map<string, HTMLDivElement>>;
}) => {
  const [spacerHeight, setSpacerHeight] = useState(0);
  const playlist = useSelectedPlaylistItemPlaylist();

  useEffect(() => {
    const updateSpacerHeight = () => {
      if (!playlist?.items.length || !scrollContainerRef.current) {
        setSpacerHeight(0);
        return;
      }

      const containerHeight = scrollContainerRef.current.clientHeight;
      const lastItemId = playlist.items[playlist.items.length - 1].id;
      const lastItemElement = itemRefs.current?.get(lastItemId);

      if (lastItemElement) {
        const lastItemHeight = lastItemElement.offsetHeight;
        // Spacer = container height - last item height
        // This allows last item to scroll to top, but prevents scrolling past its bottom
        setSpacerHeight(Math.max(0, containerHeight - lastItemHeight));
      } else {
        setSpacerHeight(containerHeight);
      }
    };

    // Need to wait for items to render before calculating
    const timeoutId = setTimeout(updateSpacerHeight, 100);

    // Use ResizeObserver to watch container size changes (handles panel resizing)
    const container = scrollContainerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateSpacerHeight();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
    };
  }, [playlist?.items, scrollContainerRef, itemRefs]);

  return spacerHeight;
};
