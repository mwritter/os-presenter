import { SlideData } from "@/components/feature/slide/types";
import {
  useSelectedPlaylistItemPlaylist,
  useSelectionStore,
} from "@/stores/presenterStore";
import { CanvasSize } from "@/components/presenter/types";

type SlideGroup = {
  slides: SlideData[];
  title: string;
};

type UseShowKeyboardNavOptions = {
  slideGroups: SlideGroup[];
  canvasSize?: CanvasSize;
};

type SlidePosition = {
  groupIndex: number;
  slideIndex: number;
};

export const useShowKeyboardNav = ({
  slideGroups,
  canvasSize = { width: 1920, height: 1080 },
}: UseShowKeyboardNavOptions) => {
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const playlist = useSelectedPlaylistItemPlaylist();
  const activeSlide = useSelectionStore((s) => s.activeSlide);
  const setActiveSlide = useSelectionStore((s) => s.setActiveSlide);

  // Find the position of the currently active slide
  const findActiveSlidePosition = (): SlidePosition | null => {
    if (!activeSlide) return null;

    for (let groupIndex = 0; groupIndex < slideGroups.length; groupIndex++) {
      const group = slideGroups[groupIndex];
      const slideIndex = group.slides.findIndex(
        (slide) => slide.id === activeSlide.id
      );
      if (slideIndex !== -1) {
        return { groupIndex, slideIndex };
      }
    }
    return null;
  };

  // Activate a slide at a specific position
  const activateSlideByPosition = (position: SlidePosition) => {
    const group = slideGroups[position.groupIndex];
    if (!group) return;

    const slide = group.slides[position.slideIndex];
    if (!slide) return;

    setActiveSlide(slide.id, slide, canvasSize);
  };

  // Get the first available slide position at the selected playlist item
  const getFirstSlidePosition = (): SlidePosition | null => {
    if (slideGroups.length === 0 || slideGroups[0].slides.length === 0) {
      return null;
    }
    if (selectedPlaylistItem && playlist) {
      const groupIndex = playlist.items.findIndex(
        (item) => item.id === selectedPlaylistItem.id
      );
      if (groupIndex >= 0) {
        return { groupIndex, slideIndex: 0 };
      }
    }
    return { groupIndex: 0, slideIndex: 0 };
  };

  // Navigate to the next slide
  const navigateNext = () => {
    let position = findActiveSlidePosition();

    // Check if active slide belongs to the selected playlist item
    // If not (or no active slide), activate the first slide of the selected item
    if (selectedPlaylistItem && playlist) {
      const selectedItemIndex = playlist.items.findIndex(
        (item) => item.id === selectedPlaylistItem.id
      );

      if (selectedItemIndex >= 0) {
        // Check if active slide belongs to selected item
        const selectedItemSlides =
          playlist.items[selectedItemIndex].slideGroup.slides;
        const activeSlideInSelectedItem =
          activeSlide &&
          selectedItemSlides.some((slide) => slide.id === activeSlide.id);

        // If no active slide or active slide not in selected item, activate first slide
        if (!activeSlide || !activeSlideInSelectedItem) {
          const firstSlidePosition: SlidePosition = {
            groupIndex: selectedItemIndex,
            slideIndex: 0,
          };
          activateSlideByPosition(firstSlidePosition);
          return;
        }
      }
    }

    // If no active slide, activate the first one
    if (!position) {
      const firstPosition = getFirstSlidePosition();
      if (firstPosition) {
        activateSlideByPosition(firstPosition);
      }
      return;
    }

    const currentGroup = slideGroups[position.groupIndex];
    const isLastSlideInGroup =
      position.slideIndex === currentGroup.slides.length - 1;

    if (isLastSlideInGroup) {
      if (position.groupIndex < slideGroups.length - 1) {
        // Select the next playlist item (first slide will be activated on next 'next' press)
        const nextPlaylistItem = playlist?.items[position.groupIndex + 1];
        if (nextPlaylistItem && playlist) {
          selectPlaylistItem(nextPlaylistItem.id, playlist.id);
        }
        return;
      }
      // At the last slide of the last group, do nothing
      return;
    }

    // Move to next slide in current group
    const nextPosition: SlidePosition = {
      groupIndex: position.groupIndex,
      slideIndex: position.slideIndex + 1,
    };
    activateSlideByPosition(nextPosition);
  };

  // Navigate to the previous slide
  const navigatePrevious = () => {
    let position = findActiveSlidePosition();

    // Check if active slide belongs to the selected playlist item
    // If not (or no active slide), activate the last slide of the selected item
    if (selectedPlaylistItem && playlist) {
      const selectedItemIndex = playlist.items.findIndex(
        (item) => item.id === selectedPlaylistItem.id
      );

      if (selectedItemIndex >= 0) {
        // Check if active slide belongs to selected item
        const selectedItemSlides =
          playlist.items[selectedItemIndex].slideGroup.slides;
        const activeSlideInSelectedItem =
          activeSlide &&
          selectedItemSlides.some((slide) => slide.id === activeSlide.id);

        // If no active slide or active slide not in selected item, activate last slide
        if (!activeSlide || !activeSlideInSelectedItem) {
          const lastSlidePosition: SlidePosition = {
            groupIndex: selectedItemIndex,
            slideIndex: selectedItemSlides.length - 1,
          };
          activateSlideByPosition(lastSlidePosition);
          return;
        }
      }
    }

    // If no active slide, activate the first one
    if (!position) {
      const firstPosition = getFirstSlidePosition();
      if (firstPosition) {
        activateSlideByPosition(firstPosition);
      }
      return;
    }

    const isFirstSlideInGroup = position.slideIndex === 0;

    if (isFirstSlideInGroup) {
      if (position.groupIndex > 0) {
        // Select the previous playlist item (last slide will be activated on next 'previous' press)
        const prevPlaylistItem = playlist?.items[position.groupIndex - 1];
        if (prevPlaylistItem && playlist) {
          selectPlaylistItem(prevPlaylistItem.id, playlist.id);
        }
        return;
      }
      // At the first slide of the first group, do nothing
      return;
    }

    // Move to previous slide in current group
    const prevPosition: SlidePosition = {
      groupIndex: position.groupIndex,
      slideIndex: position.slideIndex - 1,
    };
    activateSlideByPosition(prevPosition);
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key, shiftKey } = event;

    // Handle navigation keys
    if (key === "Tab") {
      event.preventDefault(); // Prevent default tab behavior
      if (shiftKey) {
        navigatePrevious();
      } else {
        navigateNext();
      }
    } else if (key === "ArrowRight") {
      event.preventDefault();
      navigateNext();
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      navigatePrevious();
    }
  };

  return { handleKeyDown };
};
