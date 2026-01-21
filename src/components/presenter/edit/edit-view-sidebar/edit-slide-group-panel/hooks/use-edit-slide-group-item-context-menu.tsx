import { Menu } from "@tauri-apps/api/menu";
import { useEditSlideGroupPanelContext } from "../context";
import {
  useSlideSelectionStore,
  useSelectionStore,
} from "@/stores/presenter/presenterStore";
import { SlideClipboard } from "@/stores/presenter/slices/slideSelectionSlice";
import { useEditContext } from "@/pages/presenter/edit/context";

interface UseEditSlideGroupItemContextMenuOptions {
  id: string;
  selectedIds: string[];
  selectedCount: number;
}

export const useEditSlideGroupItemContextMenu = ({
  id,
  selectedIds,
  selectedCount,
}: UseEditSlideGroupItemContextMenuOptions) => {
  const { handleDeleteSelected, slides, handleReorder } =
    useEditSlideGroupPanelContext();

  // Edit context for updating selected slide
  const { selectedSlide, setSelectedSlide } = useEditContext();

  // Clipboard store actions
  const clipboard = useSlideSelectionStore((s) => s.clipboard);
  const copySlides = useSlideSelectionStore((s) => s.copySlides);
  const cutSlides = useSlideSelectionStore((s) => s.cutSlides);
  const clearClipboard = useSlideSelectionStore((s) => s.clearClipboard);

  // Context for source tracking
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);
  const selectedPlaylistItem = useSelectionStore((s) => s.selectedPlaylistItem);

  const isMultipleSelected = selectedCount > 1;
  const isTargetSelected = selectedIds.includes(id);

  // Determine which slides to operate on
  const getTargetSlideIds = () => {
    if (isTargetSelected && isMultipleSelected) {
      return selectedIds;
    }
    return [id];
  };

  // Get slides data for the target IDs
  const getTargetSlides = () => {
    const targetIds = getTargetSlideIds();
    return slides.filter((s) => targetIds.includes(s.id));
  };

  // Get source context for clipboard operations
  const getSourceContext = (): SlideClipboard["sourceContext"] => {
    if (selectedPlaylistItem) {
      return {
        type: "playlist",
        playlistId: selectedPlaylistItem.playlistId,
        playlistItemId: selectedPlaylistItem.id,
      };
    }
    if (selectedSlideGroup) {
      return {
        type: "library",
        libraryId: selectedSlideGroup.libraryId,
        slideGroupId: selectedSlideGroup.id,
      };
    }
    return { type: "library" };
  };

  const handleCopy = () => {
    const slidesToCopy = getTargetSlides();
    if (slidesToCopy.length === 0) return;
    copySlides(slidesToCopy, getSourceContext());
  };

  const handleCut = () => {
    const slidesToCut = getTargetSlides();
    if (slidesToCut.length === 0) return;

    // Store in clipboard with cut operation
    cutSlides(slidesToCut, getSourceContext());

    // Remove from source immediately
    const slideIdsToCut = slidesToCut.map((s) => s.id);
    const remainingSlides = slides.filter(
      (slide) => !slideIdsToCut.includes(slide.id)
    );
    handleReorder(remainingSlides);

    // If the currently selected slide was cut, select another slide
    if (selectedSlide && slideIdsToCut.includes(selectedSlide.id)) {
      if (remainingSlides.length > 0) {
        setSelectedSlide(remainingSlides[0]);
      }
    }
  };

  const handlePaste = () => {
    if (!clipboard) return;

    // Generate new IDs for pasted slides
    const pastedSlides = clipboard.slides.map((slide) => {
      const shortId = crypto.randomUUID().split("-")[0];
      // Determine prefix based on current context
      let prefix = "";
      if (selectedPlaylistItem) {
        prefix = selectedPlaylistItem.playlistId;
      } else if (selectedSlideGroup) {
        prefix = selectedSlideGroup.libraryId;
      }

      return {
        ...slide,
        id: `${prefix}-${shortId}`,
        // Deep clone objects with new IDs
        objects: slide.objects?.map((obj) => ({
          ...obj,
          id: `${shortId}-${crypto.randomUUID().split("-")[0]}`,
        })),
      };
    });

    // If it was a cut operation, clear clipboard after paste
    if (clipboard.operation === "cut") {
      clearClipboard();
    }

    // Find the index to insert after the right-clicked slide
    const targetIndex = slides.findIndex((s) => s.id === id);
    const insertIndex = targetIndex !== -1 ? targetIndex + 1 : slides.length;

    // Insert pasted slides at the calculated position
    const newSlides = [
      ...slides.slice(0, insertIndex),
      ...pastedSlides,
      ...slides.slice(insertIndex),
    ];
    handleReorder(newSlides);
  };

  const handleDuplicate = () => {
    const targetIds = getTargetSlideIds();
    const slidesToDuplicate = slides.filter((s) => targetIds.includes(s.id));

    // Create duplicates with new IDs
    const duplicatedSlides = slidesToDuplicate.map((slide) => {
      const shortId = crypto.randomUUID().split("-")[0];
      let prefix = "";
      if (selectedPlaylistItem) {
        prefix = selectedPlaylistItem.playlistId;
      } else if (selectedSlideGroup) {
        prefix = selectedSlideGroup.libraryId;
      }

      return {
        ...slide,
        id: `${prefix}-${shortId}`,
        // Deep clone objects with new IDs
        objects: slide.objects?.map((obj) => ({
          ...obj,
          id: `${shortId}-${crypto.randomUUID().split("-")[0]}`,
        })),
      };
    });

    // Find the index of the last selected slide and insert after it
    const lastSelectedIndex = Math.max(
      ...targetIds.map((tid) => slides.findIndex((s) => s.id === tid))
    );

    const newSlides = [
      ...slides.slice(0, lastSelectedIndex + 1),
      ...duplicatedSlides,
      ...slides.slice(lastSelectedIndex + 1),
    ];

    handleReorder(newSlides);
  };

  const handleDelete = () => {
    if (isTargetSelected && isMultipleSelected) {
      // Delete all selected - handleDeleteSelected already handles selecting a new slide
      handleDeleteSelected();
    } else {
      // Delete just this one slide
      const remainingSlides = slides.filter((s) => s.id !== id);
      handleReorder(remainingSlides);

      // If the currently selected slide was deleted, select another slide
      if (selectedSlide && selectedSlide.id === id) {
        if (remainingSlides.length > 0) {
          setSelectedSlide(remainingSlides[0]);
        }
      }
    }
  };

  const openContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const count = isTargetSelected ? selectedCount : 1;
    const isMultiple = count > 1;

    const cutText = isMultiple ? `Cut ${count} Slides` : "Cut";
    const copyText = isMultiple ? `Copy ${count} Slides` : "Copy";
    const duplicateText = isMultiple
      ? `Duplicate ${count} Slides`
      : "Duplicate";
    const deleteText = isMultiple ? `Delete ${count} Slides` : "Delete";
    const pasteText = clipboard
      ? clipboard.slides.length > 1
        ? `Paste ${clipboard.slides.length} Slides`
        : "Paste"
      : "Paste";

    const contextMenuItems = [
      {
        id: `edit-${id}-cut`,
        text: cutText,
        action: handleCut,
      },
      {
        id: `edit-${id}-copy`,
        text: copyText,
        action: handleCopy,
      },
      {
        id: `edit-${id}-paste`,
        text: pasteText,
        disabled: !clipboard,
        action: handlePaste,
      },
      {
        id: `edit-${id}-duplicate`,
        text: duplicateText,
        action: handleDuplicate,
      },
      {
        item: "Separator" as const,
      },
      {
        id: `edit-${id}-delete`,
        text: deleteText,
        action: handleDelete,
      },
    ];

    const menu = await Menu.new({ items: contextMenuItems });
    await menu.popup();
  };

  return { openContextMenu };
};
