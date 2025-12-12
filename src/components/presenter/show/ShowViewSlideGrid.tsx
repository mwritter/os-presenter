import { useRef } from "react";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
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
import { MAX_GRID_COLUMNS, useShowViewContext } from "./context";
import { useSlideMultiSelect } from "@/hooks/use-slide-multi-select";
import { useLassoSelect } from "@/hooks/use-lasso-select";
import { useSlideClipboard } from "@/hooks/use-slide-clipboard";
import { useSlideContextMenu } from "./hooks/use-slide-context-menu";
import { useShowViewDnd, ShowViewDragData } from "./ShowViewDndProvider";
import { SlideGridEndZone } from "./SlideGridEndZone";

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

  // Get drag state from shared context
  const { activeId, activeData, overId, dropPosition } = useShowViewDnd();

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
      return dropPosition;
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
  const dragData: ShowViewDragData = {
    type: "slide",
    playlistId,
    playlistItemId,
    slide,
    canvasSize,
    selectedIds: selectedSlideIds.includes(slide.id)
      ? selectedSlideIds
      : undefined,
  };

  const { attributes, listeners, setNodeRef } = useSortable({
    id: slide.id,
    data: dragData,
    disabled,
  });

  // Combined ref handler
  const handleRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
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
        showSelectionUI ? "bg-selected/30" : "bg-shade-lighter"
      )}
    >
      <p className="text-white text-xs">{index + 1}</p>
      {mediaName && <p className="text-white text-xs">{mediaName}</p>}
    </div>
  );
};
