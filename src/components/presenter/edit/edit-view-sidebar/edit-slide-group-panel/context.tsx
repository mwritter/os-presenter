import { createContext, useContext, useRef } from "react";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize, SlideGroup } from "@/components/presenter/types";
import {
  useSlideSelectionStore,
  useSelectionStore,
  useLibraryStore,
  usePlaylistStore,
} from "@/stores/presenter/presenterStore";
import { useEditContext } from "@/pages/presenter/edit/context";

interface EditSlideGroupPanelContextType {
  // Data
  slides: SlideData[];
  canvasSize: CanvasSize;
  slideGroup: SlideGroup | null;

  // Multi-select state
  selectedSlideIds: string[];
  isMultiSelectMode: boolean;

  // Actions
  handleSlideClick: (
    slideId: string,
    slideData: SlideData,
    e: React.MouseEvent
  ) => void;
  isSlideSelected: (slideId: string) => boolean;
  getSelectedSlides: () => SlideData[];
  clearSelection: () => void;

  // Reorder
  handleReorder: (reorderedSlides: SlideData[]) => void;

  // Delete
  handleDeleteSelected: () => void;

  // Container ref for click-outside detection
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const EditSlideGroupPanelContext = createContext<
  EditSlideGroupPanelContextType | undefined
>(undefined);

interface EditSlideGroupPanelProviderProps {
  children: React.ReactNode;
  slideGroup: SlideGroup | null;
}

export const EditSlideGroupPanelProvider = ({
  children,
  slideGroup,
}: EditSlideGroupPanelProviderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Edit context for setting selected slide
  const { setSelectedSlide } = useEditContext();

  // Selection store
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);

  // Slide selection store
  const selectedSlideIds = useSlideSelectionStore((s) => s.selectedSlideIds);
  const anchorSlideId = useSlideSelectionStore((s) => s.anchorSlideId);
  const isMultiSelectMode = useSlideSelectionStore((s) => s.isMultiSelectMode);
  const selectSlide = useSlideSelectionStore((s) => s.selectSlide);
  const toggleSlideSelection = useSlideSelectionStore(
    (s) => s.toggleSlideSelection
  );
  const selectRange = useSlideSelectionStore((s) => s.selectRange);
  const clearSelection = useSlideSelectionStore((s) => s.clearSelection);

  // Store actions for reordering
  const reorderSlidesInLibrary = useLibraryStore(
    (s) => s.reorderSlidesInLibrary
  );
  const reorderSlidesInPlaylistItem = usePlaylistStore(
    (s) => s.reorderSlidesInPlaylistItem
  );
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const updatePlaylistItemSlideGroup = usePlaylistStore(
    (s) => s.updatePlaylistItemSlideGroup
  );
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);

  const slides = slideGroup?.slides || [];
  const canvasSize = slideGroup?.canvasSize || { width: 1920, height: 1080 };

  /**
   * Handle click on a slide with modifier key detection
   */
  const handleSlideClick = (
    slideId: string,
    slideData: SlideData,
    e: React.MouseEvent
  ) => {
    const isShiftKey = e.shiftKey;
    const isMetaKey = e.metaKey || e.ctrlKey;

    if (isShiftKey) {
      // Shift+click: Select range from anchor to clicked slide
      if (anchorSlideId) {
        selectRange(anchorSlideId, slideId, slides);
      } else {
        selectSlide(slideId, true);
      }
    } else if (isMetaKey) {
      // Cmd/Ctrl+click: Toggle individual slide selection
      toggleSlideSelection(slideId);
    } else {
      // Regular click: Clear selection and select this slide for editing
      clearSelection();
      setSelectedSlide(slideData);
    }
  };

  /**
   * Check if a slide is selected
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
   * Handle reordering slides
   */
  const handleReorder = (reorderedSlides: SlideData[]) => {
    if (selectedPlaylistItem) {
      // Reorder in playlist item
      reorderSlidesInPlaylistItem(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        reorderedSlides
      );
    } else if (selectedSlideGroup) {
      // Reorder in library
      reorderSlidesInLibrary(
        selectedSlideGroup.libraryId,
        selectedSlideGroup.id,
        reorderedSlides
      );
    }
  };

  /**
   * Delete selected slides
   */
  const handleDeleteSelected = () => {
    if (selectedSlideIds.length === 0) return;

    const remainingSlides = slides.filter(
      (slide) => !selectedSlideIds.includes(slide.id)
    );

    if (selectedPlaylistItem) {
      // Delete from playlist item
      const playlist = playlists.find(
        (pl) => pl.id === selectedPlaylistItem.playlistId
      );
      if (!playlist) return;

      updatePlaylistItemSlideGroup(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        { slides: remainingSlides }
      );
    } else if (selectedSlideGroup) {
      // Delete from library
      const library = libraries.find(
        (lib) => lib.id === selectedSlideGroup.libraryId
      );
      if (!library) return;

      const updatedSlideGroups = library.slideGroups.map((sg) =>
        sg.id === selectedSlideGroup.id
          ? { ...sg, slides: remainingSlides }
          : sg
      );

      updateLibrary(selectedSlideGroup.libraryId, {
        slideGroups: updatedSlideGroups,
      });
    }

    // Clear selection after delete
    clearSelection();

    // Select the first remaining slide if any
    if (remainingSlides.length > 0) {
      setSelectedSlide(remainingSlides[0]);
    }
  };

  return (
    <EditSlideGroupPanelContext.Provider
      value={{
        slides,
        canvasSize,
        slideGroup,
        selectedSlideIds,
        isMultiSelectMode,
        handleSlideClick,
        isSlideSelected,
        getSelectedSlides,
        clearSelection,
        handleReorder,
        handleDeleteSelected,
        containerRef,
      }}
    >
      {children}
    </EditSlideGroupPanelContext.Provider>
  );
};

export const useEditSlideGroupPanelContext = () => {
  const context = useContext(EditSlideGroupPanelContext);
  if (!context) {
    throw new Error(
      "useEditSlideGroupPanelContext must be used within an EditSlideGroupPanelProvider"
    );
  }
  return context;
};
