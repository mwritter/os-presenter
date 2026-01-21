import { SlideData } from "@/components/feature/slide/types";
import {
  useSlideSelectionStore,
  useSelectionStore,
} from "@/stores/presenter/presenterStore";
import { CanvasSize } from "@/components/presenter/types";

interface UseSlideMultiSelectOptions {
  slides: SlideData[];
  canvasSize: CanvasSize;
}

export function useSlideMultiSelect({
  slides,
  canvasSize,
}: UseSlideMultiSelectOptions) {
  // Slide selection store actions
  const selectedSlideIds = useSlideSelectionStore((s) => s.selectedSlideIds);
  const anchorSlideId = useSlideSelectionStore((s) => s.anchorSlideId);
  const selectSlide = useSlideSelectionStore((s) => s.selectSlide);
  const toggleSlideSelection = useSlideSelectionStore(
    (s) => s.toggleSlideSelection
  );
  const selectRange = useSlideSelectionStore((s) => s.selectRange);
  const clearSelection = useSlideSelectionStore((s) => s.clearSelection);

  // Active slide for audience broadcast
  const setActiveSlide = useSelectionStore((s) => s.setActiveSlide);

  /**
   * Handle click on a slide with modifier key detection
   */
  const handleSlideClick = (
    slideId: string,
    slideData: SlideData,
    e: React.MouseEvent
  ) => {
    const isShiftKey = e.shiftKey;
    const isMetaKey = e.metaKey || e.ctrlKey; // Cmd on Mac, Ctrl on Windows

    if (isShiftKey) {
      // Shift+click: Select range from anchor to clicked slide
      // Never sets active slide, only extends selection
      if (anchorSlideId) {
        // Range from anchor (first selected) to clicked slide
        selectRange(anchorSlideId, slideId, slides);
      } else {
        // No anchor yet, start fresh selection with this slide as anchor
        selectSlide(slideId, true);
      }
    } else if (isMetaKey) {
      // Cmd/Ctrl+click: Toggle individual slide selection (multi-select mode)
      // Never sets active slide, only toggles selection
      toggleSlideSelection(slideId);
    } else {
      // Regular click (no modifiers): Only set as active slide for broadcast
      // Clear selection (exits multi-select mode) and set active slide
      clearSelection();
      setActiveSlide(slideId, slideData, canvasSize);
    }
  };

  /**
   * Check if a slide is currently selected
   */
  const isSlideSelected = (slideId: string) => {
    return selectedSlideIds.includes(slideId);
  };

  /**
   * Get all selected slides data
   */
  const getSelectedSlides = () => {
    return slides.filter((slide) => selectedSlideIds.includes(slide.id));
  };

  /**
   * Get selected slides in their original order
   */
  const getSelectedSlidesInOrder = () => {
    return slides.filter((slide) => selectedSlideIds.includes(slide.id));
  };

  return {
    selectedSlideIds,
    handleSlideClick,
    isSlideSelected,
    getSelectedSlides,
    getSelectedSlidesInOrder,
    clearSelection,
    selectSlide,
  };
}
