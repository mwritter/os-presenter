import { useEffect, useRef, useCallback } from "react";
import { SlideData } from "@/components/feature/slide/types";
import { useSelectionStore } from "@/stores/presenterStore";
import { CanvasSize } from "@/components/presenter/types";

type SlideGroup = {
  slides: SlideData[];
  title: string;
};

type UseShowKeyboardNavOptions = {
  slideGroups: SlideGroup[];
  canvasSize?: CanvasSize;
  enableMultiGroupNavigation?: boolean;
};

type SlidePosition = {
  groupIndex: number;
  slideIndex: number;
};

const DOUBLE_PRESS_TIMEOUT = 500; // milliseconds

export const useShowKeyboardNav = ({
  slideGroups,
  canvasSize = { width: 1920, height: 1080 },
  enableMultiGroupNavigation = false,
}: UseShowKeyboardNavOptions) => {
  const activeSlide = useSelectionStore((s) => s.activeSlide);
  const setActiveSlide = useSelectionStore((s) => s.setActiveSlide);
  const lastKeyPress = useRef<{ key: string; timestamp: number } | null>(null);

  // Find the position of the currently active slide
  const findActiveSlidePosition = useCallback((): SlidePosition | null => {
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
  }, [activeSlide, slideGroups]);

  // Activate a slide at a specific position
  const activateSlideByPosition = useCallback(
    (position: SlidePosition) => {
      const group = slideGroups[position.groupIndex];
      if (!group) return;

      const slide = group.slides[position.slideIndex];
      if (!slide) return;

      setActiveSlide(slide.id, slide, canvasSize);
    },
    [slideGroups, setActiveSlide, canvasSize]
  );

  // Get the first available slide position
  const getFirstSlidePosition = useCallback((): SlidePosition | null => {
    if (slideGroups.length === 0 || slideGroups[0].slides.length === 0) {
      return null;
    }
    return { groupIndex: 0, slideIndex: 0 };
  }, [slideGroups]);

  // Navigate to the next slide
  const navigateNext = useCallback(() => {
    let position = findActiveSlidePosition();

    // If no active slide, activate the first one
    if (!position) {
      const firstPosition = getFirstSlidePosition();
      if (firstPosition) {
        activateSlideByPosition(firstPosition);
      }
      return;
    }

    const currentGroup = slideGroups[position.groupIndex];
    const isLastSlideInGroup = position.slideIndex === currentGroup.slides.length - 1;

    if (isLastSlideInGroup) {
      // Check for double-press to move to next group
      if (enableMultiGroupNavigation && position.groupIndex < slideGroups.length - 1) {
        const now = Date.now();
        const lastPress = lastKeyPress.current;

        if (
          lastPress &&
          (lastPress.key === "ArrowRight" || lastPress.key === "Tab") &&
          now - lastPress.timestamp < DOUBLE_PRESS_TIMEOUT
        ) {
          // Double press detected - move to next group
          const nextGroupPosition: SlidePosition = {
            groupIndex: position.groupIndex + 1,
            slideIndex: 0,
          };
          activateSlideByPosition(nextGroupPosition);
          lastKeyPress.current = null; // Reset after successful transition
          return;
        }
      }
      // At boundary, do nothing (single press)
      return;
    }

    // Move to next slide in current group
    const nextPosition: SlidePosition = {
      groupIndex: position.groupIndex,
      slideIndex: position.slideIndex + 1,
    };
    activateSlideByPosition(nextPosition);
  }, [
    findActiveSlidePosition,
    getFirstSlidePosition,
    activateSlideByPosition,
    slideGroups,
    enableMultiGroupNavigation,
  ]);

  // Navigate to the previous slide
  const navigatePrevious = useCallback(() => {
    let position = findActiveSlidePosition();

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
      // Check for double-press to move to previous group
      if (enableMultiGroupNavigation && position.groupIndex > 0) {
        const now = Date.now();
        const lastPress = lastKeyPress.current;

        if (
          lastPress &&
          (lastPress.key === "ArrowLeft" || lastPress.key === "ShiftTab") &&
          now - lastPress.timestamp < DOUBLE_PRESS_TIMEOUT
        ) {
          // Double press detected - move to last slide of previous group
          const prevGroup = slideGroups[position.groupIndex - 1];
          const prevGroupPosition: SlidePosition = {
            groupIndex: position.groupIndex - 1,
            slideIndex: prevGroup.slides.length - 1,
          };
          activateSlideByPosition(prevGroupPosition);
          lastKeyPress.current = null; // Reset after successful transition
          return;
        }
      }
      // At boundary, do nothing (single press)
      return;
    }

    // Move to previous slide in current group
    const prevPosition: SlidePosition = {
      groupIndex: position.groupIndex,
      slideIndex: position.slideIndex - 1,
    };
    activateSlideByPosition(prevPosition);
  }, [
    findActiveSlidePosition,
    getFirstSlidePosition,
    activateSlideByPosition,
    slideGroups,
    enableMultiGroupNavigation,
  ]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key, shiftKey } = event;

      // Track key press for double-press detection
      const now = Date.now();
      const keyIdentifier = shiftKey && key === "Tab" ? "ShiftTab" : key;

      // Handle navigation keys
      if (key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        if (shiftKey) {
          navigatePrevious();
          lastKeyPress.current = { key: "ShiftTab", timestamp: now };
        } else {
          navigateNext();
          lastKeyPress.current = { key: "Tab", timestamp: now };
        }
      } else if (key === "ArrowRight") {
        event.preventDefault();
        navigateNext();
        lastKeyPress.current = { key: "ArrowRight", timestamp: now };
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        navigatePrevious();
        lastKeyPress.current = { key: "ArrowLeft", timestamp: now };
      }
    },
    [navigateNext, navigatePrevious]
  );

  return { handleKeyDown };
};

