import { useRef } from "react";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { ShowViewEmptyState } from "./ShowViewEmpty";
import { ShowViewSlideGridHeader } from "./ShowViewSlideGridHeader";
import {
  useSelectionStore,
  useSlideSelectionStore,
} from "@/stores/presenterStore";
import { cn } from "@/lib/utils";
import { MAX_GRID_COLUMNS, useShowViewContext } from "./context";
import { useSlideMultiSelect } from "@/hooks/use-slide-multi-select";
import { useLassoSelect } from "@/hooks/use-lasso-select";
import { useSlideClipboard } from "@/hooks/use-slide-clipboard";
import { useSlideContextMenu } from "./hooks/use-slide-context-menu";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";
import { SlideGridEndZone } from "./SlideGridEndZone";
import { SlideTag } from "@/components/feature/slide/SlideTag";

type ShowViewSlideGridProps = {
  slides: SlideData[];
  title: string;
  canvasSize: CanvasSize;
  onReorder?: (slides: SlideData[]) => void;
  slideGroupId?: string;
  libraryId?: string;
  playlistItemId?: string;
  playlistId?: string;
  skipScrollRef?: React.RefObject<boolean>;
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
}: ShowViewSlideGridProps) => {
  const activeSlideId = useSelectionStore((s) => s.activeSlide?.id ?? null);
  const isMultiSelectMode = useSlideSelectionStore((s) => s.isMultiSelectMode);
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const { gridColumns } = useShowViewContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefsMap = useRef<Map<string, HTMLElement>>(new Map());

  // Get drag state from shared context (use app-level for cross-component drops)
  const { activeId, activeData, overId, dropPosition } = useAppDnd();

  // Select this slide group when clicking the container
  const handleContainerClick = () => {
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
  const { selectedSlideIds, handleSlideClick, isSlideSelected } =
    useSlideMultiSelect({ slides, canvasSize });

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

  const isDragging = (id: string) => {
    if (!activeId) return false;
    if (activeData?.selectedIds) {
      return activeData.selectedIds.includes(id);
    }
    return activeId === id;
  };

  const getDropPosition = (id: string) => {
    if (overId === id && !isDragging(id)) {
      // Show drop indicator for slides from same playlist or media items
      const isValidSlideDrop =
        activeData?.type === "slide" && activeData?.playlistId === playlistId;
      const isValidMediaDrop = activeData?.type === "mediaItem";

      if (isValidSlideDrop || isValidMediaDrop) {
        return dropPosition;
      }
    }
    return null;
  };

  if (!title && (!slides || slides.length === 0)) {
    return <ShowViewEmptyState />;
  }

  // Calculate grid columns for end zone
  const totalColumns = Math.max(MAX_GRID_COLUMNS - gridColumns, 1);

  return (
    <SortableContext
      items={slides.map((s) => s.id)}
      strategy={rectSortingStrategy}
      disabled={!onReorder}
    >
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
            gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
          }}
        >
          {slides.map((slide, index) => {
            const isSelected = isSlideSelected(slide.id);
            const isActive = activeSlideId === slide.id;
            const slideIsDragging = isDragging(slide.id);
            const showSelectionUI = isSelected && isMultiSelectMode;

            return (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                canvasSize={canvasSize}
                playlistId={playlistId ?? ""}
                playlistItemId={playlistItemId ?? ""}
                selectedSlideIds={selectedSlideIds}
                isActive={isActive}
                isDragging={slideIsDragging}
                showSelectionUI={showSelectionUI}
                dropPosition={getDropPosition(slide.id)}
                disabled={!onReorder}
                onContextMenu={(e) => openContextMenu(e, slide.id)}
                onClick={(e) => handleSlideClick(slide.id, slide, e)}
                registerRef={registerSlideRef}
              />
            );
          })}

          {/* End drop zone - fills remaining cells in last row */}
          {onReorder && playlistId && playlistItemId && (
            <SlideGridEndZone
              playlistId={playlistId}
              playlistItemId={playlistItemId}
              totalColumns={totalColumns}
              slideCount={slides.length}
            />
          )}
        </div>

        {/* Lasso selection overlay */}
        {isSelecting && lassoStyle && (
          <div
            className="absolute border-2 border-selected bg-selected/20 pointer-events-none z-50"
            style={{
              left: lassoStyle.left,
              top: lassoStyle.top,
              width: lassoStyle.width,
              height: lassoStyle.height,
            }}
          />
        )}
      </div>
    </SortableContext>
  );
};

interface SortableSlideItemProps {
  slide: SlideData;
  index: number;
  canvasSize: CanvasSize;
  playlistId: string;
  playlistItemId: string;
  selectedSlideIds: string[];
  isActive: boolean;
  isDragging: boolean;
  showSelectionUI: boolean;
  dropPosition: "before" | "after" | null;
  disabled: boolean;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  registerRef: (slideId: string, element: HTMLElement | null) => void;
}

const SortableSlideItem = ({
  slide,
  index,
  canvasSize,
  playlistId,
  playlistItemId,
  selectedSlideIds,
  isActive,
  isDragging,
  showSelectionUI,
  dropPosition,
  disabled,
  onContextMenu,
  onClick,
  registerRef,
}: SortableSlideItemProps) => {
  const dragData: AppDragData = {
    type: "slide",
    playlistId,
    playlistItemId,
    slide,
    canvasSize,
    selectedIds: selectedSlideIds.includes(slide.id)
      ? selectedSlideIds
      : undefined,
  };

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
  } = useSortable({
    id: slide.id,
    data: dragData,
    disabled,
  });

  // Make this item a droppable for media items
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: slide.id,
    data: dragData,
  });

  // Combined ref handler for sortable, droppable, and lasso selection
  const handleRef = (el: HTMLDivElement | null) => {
    setSortableRef(el);
    setDroppableRef(el);
    registerRef(slide.id, el);
  };

  return (
    <div
      ref={handleRef}
      data-slide-item
      className="relative"
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator line - before (in gap to the left) */}
      {dropPosition === "before" && (
        <div className="absolute -left-[10px] top-0 bottom-0 w-1 bg-selected z-10 rounded-full" />
      )}

      <div
        className={cn("overflow-hidden transition-all duration-75", {
          "ring-2 ring-amber-400": isActive,
          "ring-2 ring-blue-500": showSelectionUI && !isActive,
          "hover:ring-2 hover:ring-white/30": !showSelectionUI && !isActive,
          "opacity-50": isDragging,
        })}
      >
        <Slide
          id={slide.id}
          data={slide}
          canvasSize={canvasSize}
          onClick={onClick}
        />
        <SlideTag
          index={index}
          slide={slide}
          showSelectionUI={showSelectionUI}
        />
      </div>

      {/* Drop indicator line - after (in gap to the right) */}
      {dropPosition === "after" && (
        <div className="absolute -right-[10px] top-0 bottom-0 w-1 bg-selected z-10 rounded-full" />
      )}
    </div>
  );
};
