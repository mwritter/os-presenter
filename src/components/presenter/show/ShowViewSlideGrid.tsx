import { useRef } from "react";
import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { ShowViewSlideGridHeader } from "./ShowViewSlideGridHeader";
import { useMediaLibraryStore } from "@/stores/mediaLibraryStore";
import {
  useSelectionStore,
  useSlideSelectionStore,
} from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import {
  createSlideDragGhost,
  createMultiSlideDragGhost,
} from "@/lib/drag-utils";
import { MAX_GRID_COLUMNS, useShowViewContext } from "./context";
import { useShowViewDrag } from "./hooks/use-show-view-drag";
import { useSlideMultiSelect } from "@/hooks/use-slide-multi-select";
import { useLassoSelect } from "@/hooks/use-lasso-select";
import { useSlideClipboard } from "@/hooks/use-slide-clipboard";
import { useSlideContextMenu } from "./hooks/use-slide-context-menu";

type ShowViewSlideGridProps = {
  slides: SlideData[];
  title: string;
  canvasSize: CanvasSize;
  onReorder?: (slides: SlideData[]) => void;
  // Cross-group drag and drop
  slideGroupId?: string;
  libraryId?: string;
  playlistItemId?: string;
  playlistId?: string;
  // Skip scroll when selecting from within this component
  skipScrollRef?: React.RefObject<boolean>;
  onReceiveSlides?: (
    slideIds: string[],
    sourceGroupId: string,
    insertAfterSlideId?: string
  ) => void;
};

export const ShowViewSlideGrid = ({
  slides,
  title,
  canvasSize,
  onReorder,
  slideGroupId,
  libraryId,
  playlistItemId,
  playlistId,
  skipScrollRef,
  onReceiveSlides,
}: ShowViewSlideGridProps) => {
  const activeSlideId = useSelectionStore((s) => s.activeSlide?.id ?? null);
  const isMultiSelectMode = useSlideSelectionStore((s) => s.isMultiSelectMode);
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const { gridColumns } = useShowViewContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefsMap = useRef<Map<string, HTMLElement>>(new Map());

  // Select this slide group when clicking the container
  const handleContainerClick = () => {
    // Skip scroll when selecting from within the show view
    if (skipScrollRef) {
      skipScrollRef.current = true;
    }
    if (playlistItemId && playlistId) {
      selectPlaylistItem(playlistItemId, playlistId);
    } else if (slideGroupId && libraryId) {
      selectSlideGroup(slideGroupId, libraryId);
    }
  };

  // Multi-select functionality
  const {
    selectedSlideIds,
    handleSlideClick,
    isSlideSelected,
    getSelectedSlidesInOrder,
  } = useSlideMultiSelect({ slides, canvasSize });

  const {
    draggedSlideId,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleContainerDragOver,
    handleContainerDrop,
  } = useShowViewDrag({
    slides,
    onReorder,
    slideGroupId,
    onReceiveSlides,
  });

  // Lasso/marquee selection
  const { isSelecting, lassoStyle } = useLassoSelect({
    containerRef,
    slideRefs: slideRefsMap.current,
    enabled: true,
  });

  // Clipboard and keyboard shortcuts
  const { handleCut, handleCopy, handlePaste, handleDelete, hasClipboard } =
    useSlideClipboard({
      slides,
      onSlidesChange: onReorder,
      enabled: true,
      slideGroupId,
      playlistItemId,
    });

  // Native context menu
  const { openContextMenu } = useSlideContextMenu({
    onCut: handleCut,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDelete: handleDelete,
    hasClipboard,
  });

  // Callback to register slide refs
  const registerSlideRef = (slideId: string, element: HTMLElement | null) => {
    if (element) {
      slideRefsMap.current.set(slideId, element);
    } else {
      slideRefsMap.current.delete(slideId);
    }
  };

  if (!title && (!slides || slides.length === 0)) {
    return <ShowViewEmptyState />;
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 text-white/70 relative select-none"
      onClick={handleContainerClick}
    >
      <ShowViewSlideGridHeader title={title} />
      <div
        className={cn("grid gap-4 p-5", {
          "min-h-[100px]": slides.length === 0,
        })}
        style={{
          gridTemplateColumns: `repeat(${Math.max(MAX_GRID_COLUMNS - gridColumns, 1)}, 1fr)`,
        }}
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
      >
        {slides.map((slide, index) => {
          const isSelected = isSlideSelected(slide.id);
          const isActive = activeSlideId === slide.id;
          const isDragging = draggedSlideId === slide.id;
          const isDraggedAsPartOfSelection =
            draggedSlideId !== null &&
            selectedSlideIds.includes(slide.id) &&
            selectedSlideIds.includes(draggedSlideId);
          // Show selection UI when in multi-select mode (Shift/Cmd/lasso)
          const showSelectionUI = isSelected && isMultiSelectMode;

          return (
            <div
              key={slide.id}
              ref={(el) => registerSlideRef(slide.id, el)}
              data-slide-item
              className="relative"
              draggable={!!onReorder}
              onContextMenu={(e) => openContextMenu(e, slide.id)}
              onDragStart={(e) => {
                // If dragging a selected slide, drag all selected slides
                const isPartOfSelection = selectedSlideIds.includes(slide.id);
                const slidesToDrag = isPartOfSelection
                  ? getSelectedSlidesInOrder()
                  : [slide];

                handleDragStart(
                  slide.id,
                  slidesToDrag.map((s) => s.id)
                );

                // Create appropriate ghost based on selection count
                if (slidesToDrag.length > 1) {
                  createMultiSlideDragGhost(
                    e,
                    e.currentTarget,
                    slidesToDrag.length
                  );
                } else {
                  createSlideDragGhost(e, e.currentTarget);
                }

                e.dataTransfer.setData("slideId", slide.id);
                e.dataTransfer.setData(
                  "slideIds",
                  JSON.stringify(slidesToDrag.map((s) => s.id))
                );
                // Include source group ID for cross-group drops
                if (slideGroupId) {
                  e.dataTransfer.setData("sourceGroupId", slideGroupId);
                }
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => handleDragOver(e, slide.id)}
              onDrop={(e) => handleDrop(e, slide.id)}
            >
              {/* Drop indicator line - before (in gap to the left) */}
              {dropTarget?.id === slide.id &&
                dropTarget.position === "before" && (
                  <div className="absolute -left-[10px] top-0 bottom-0 w-1 bg-blue-500 z-10 rounded-full" />
                )}

              <div
                className={cn("overflow-hidden transition-all duration-75", {
                  // Active slide (being broadcast) - amber ring
                  "ring-2 ring-amber-400": isActive,
                  // Selected (multiple) but not active - blue ring (only when 2+ slides selected)
                  "ring-2 ring-blue-500": showSelectionUI && !isActive,
                  // Hover state when not showing selection UI or active
                  "hover:ring-2 hover:ring-white/30":
                    !showSelectionUI && !isActive,
                  // Dragging state
                  "opacity-50": isDragging || isDraggedAsPartOfSelection,
                })}
              >
                <Slide
                  id={slide.id}
                  data={slide}
                  canvasSize={canvasSize}
                  onClick={(e) => handleSlideClick(slide.id, slide, e)}
                />
                <SlideTag
                  index={index}
                  slide={slide}
                  showSelectionUI={showSelectionUI}
                />
              </div>

              {/* Drop indicator line - after (in gap to the right) */}
              {dropTarget?.id === slide.id &&
                dropTarget.position === "after" && (
                  <div className="absolute -right-[10px] top-0 bottom-0 w-1 bg-blue-500 z-10 rounded-full" />
                )}
            </div>
          );
        })}
      </div>

      {/* Lasso selection overlay */}
      {isSelecting && lassoStyle && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-50"
          style={{
            left: lassoStyle.left,
            top: lassoStyle.top,
            width: lassoStyle.width,
            height: lassoStyle.height,
          }}
        />
      )}
    </div>
  );
};

const SlideTag = ({
  index,
  slide,
  showSelectionUI,
}: {
  index: number;
  slide: SlideData;
  showSelectionUI: boolean;
}) => {
  const getMediaById = useMediaLibraryStore((s) => s.getMediaById);
  const videoBackgroundObject = slide.objects?.find(
    (obj) => obj.type === "video" && obj.videoType === "background"
  );

  let mediaName = null;

  if (videoBackgroundObject) {
    const mediaItem = getMediaById(videoBackgroundObject.id);
    mediaName = mediaItem?.name;
    const extension = mediaItem?.source.split(".").pop();
    if (extension) {
      mediaName = mediaName + "." + extension;
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-1 w-full transition-colors",
        showSelectionUI ? "bg-blue-500/30" : "bg-shade-lighter"
      )}
    >
      <p className="text-white text-xs">{index + 1}</p>
      {mediaName && <p className="text-white text-xs">{mediaName}</p>}
    </div>
  );
};
