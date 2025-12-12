import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragMoveEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createContext, useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { usePlaylistStore } from "@/stores/presenterStore";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { Slide } from "@/components/feature/slide/Slide";
import { MultiSlideDragOverlay, SlideDragOverlay } from "@/components/dnd";

export type ShowViewDragType = "slide" | "slideGridEndZone";

export interface ShowViewDragData {
  type: ShowViewDragType;
  playlistId: string;
  playlistItemId: string;
  slide?: SlideData; // Optional for end zones
  canvasSize?: CanvasSize; // Optional for end zones
  selectedIds?: string[];
}

interface ShowViewDndContextValue {
  activeId: UniqueIdentifier | null;
  activeData: ShowViewDragData | null;
  overId: UniqueIdentifier | null;
  overData: ShowViewDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
}

const ShowViewDndContext = createContext<ShowViewDndContextValue | null>(null);

export const useShowViewDnd = () => {
  const context = useContext(ShowViewDndContext);
  if (!context) {
    throw new Error("useShowViewDnd must be used within a ShowViewDndProvider");
  }
  return context;
};

interface ShowViewDndProviderProps {
  playlistId: string;
  children: React.ReactNode;
}

export const ShowViewDndProvider = ({
  playlistId,
  children,
}: ShowViewDndProviderProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeData, setActiveData] = useState<ShowViewDragData | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [overData, setOverData] = useState<ShowViewDragData | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const draggedIdsRef = useRef<string[]>([]);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Store actions
  const reorderSlidesInPlaylistItem = usePlaylistStore(
    (s) => s.reorderSlidesInPlaylistItem
  );
  const moveSlidesToPlaylistItem = usePlaylistStore(
    (s) => s.moveSlidesToPlaylistItem
  );
  const playlists = usePlaylistStore((s) => s.playlists);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as ShowViewDragData | undefined;

    setActiveId(active.id);
    setActiveData(data ?? null);

    if (data?.selectedIds && data.selectedIds.length > 1) {
      draggedIdsRef.current = data.selectedIds;
    } else {
      draggedIdsRef.current = [active.id as string];
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { activatorEvent, delta, over } = event;
    if (activatorEvent instanceof PointerEvent) {
      // activatorEvent is the initial pointer position, add delta to get current position
      pointerPositionRef.current = {
        x: activatorEvent.clientX + delta.x,
        y: activatorEvent.clientY + delta.y,
      };
    }

    // Calculate drop position continuously as pointer moves
    // Use X position relative to element center for before/after detection
    if (over && over.rect && pointerPositionRef.current) {
      const midpoint = over.rect.left + over.rect.width / 2;
      const position: "before" | "after" =
        pointerPositionRef.current.x < midpoint ? "before" : "after";
      setDropPosition(position);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (over) {
      const overDataCurrent = over.data.current as ShowViewDragData | undefined;

      if (draggedIdsRef.current.includes(over.id as string)) {
        setOverId(null);
        setOverData(null);
        setDropPosition(null);
        return;
      }

      setOverId(over.id);
      setOverData(overDataCurrent ?? null);
    } else {
      setOverId(null);
      setOverData(null);
      setDropPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeDataCurrent = active.data.current as
      | ShowViewDragData
      | undefined;
    const overDataCurrent = over?.data.current as ShowViewDragData | undefined;
    const currentDraggedIds = draggedIdsRef.current;
    const currentDropPosition = dropPosition;

    // Reset state
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setOverData(null);
    setDropPosition(null);
    draggedIdsRef.current = [];
    pointerPositionRef.current = null;

    if (!over || !activeDataCurrent || !overDataCurrent) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    if (currentDraggedIds.includes(over.id as string)) {
      return;
    }

    const {
      playlistItemId: sourceItemId,
      playlistId: sourcePlaylistId,
      type: activeType,
    } = activeDataCurrent;
    const { playlistItemId: targetItemId, type: overType } = overDataCurrent;

    // Handle END ZONE drops - move slides to end of slide group
    if (overType === "slideGridEndZone" && activeType === "slide") {
      if (sourceItemId === targetItemId) {
        // Same slide group = reorder to end
        const playlist = playlists.find((pl) => pl.id === sourcePlaylistId);
        if (!playlist) return;

        const item = playlist.items.find((i) => i.id === sourceItemId);
        if (!item) return;

        const slides = item.slideGroup.slides;
        const slidesToMove = slides.filter((s) =>
          currentDraggedIds.includes(s.id)
        );
        const remainingSlides = slides.filter(
          (s) => !currentDraggedIds.includes(s.id)
        );

        const newSlides = [...remainingSlides, ...slidesToMove];
        reorderSlidesInPlaylistItem(sourcePlaylistId, sourceItemId, newSlides);
      } else {
        // Different slide group = move to end of target slide group
        moveSlidesToPlaylistItem(
          playlistId,
          sourceItemId,
          targetItemId,
          currentDraggedIds,
          undefined // undefined = append to end
        );
      }
      return;
    }

    // Same playlist item = reorder
    if (sourceItemId === targetItemId) {
      const playlist = playlists.find((pl) => pl.id === sourcePlaylistId);
      if (!playlist) return;

      const item = playlist.items.find((i) => i.id === sourceItemId);
      if (!item) return;

      const slides = item.slideGroup.slides;

      if (currentDraggedIds.length > 1) {
        // Multi-select reorder
        const slidesToMove = slides.filter((s) =>
          currentDraggedIds.includes(s.id)
        );
        const remainingSlides = slides.filter(
          (s) => !currentDraggedIds.includes(s.id)
        );
        const targetIndex = remainingSlides.findIndex((s) => s.id === over.id);

        if (targetIndex === -1) return;

        const insertIndex =
          currentDropPosition === "after" ? targetIndex + 1 : targetIndex;

        const newSlides = [
          ...remainingSlides.slice(0, insertIndex),
          ...slidesToMove,
          ...remainingSlides.slice(insertIndex),
        ];

        reorderSlidesInPlaylistItem(sourcePlaylistId, sourceItemId, newSlides);
      } else {
        // Single item reorder
        const activeIndex = slides.findIndex((s) => s.id === active.id);
        const overIndex = slides.findIndex((s) => s.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          let targetIndex = overIndex;
          if (currentDropPosition === "after" && activeIndex < overIndex) {
            targetIndex = overIndex;
          } else if (
            currentDropPosition === "before" &&
            activeIndex > overIndex
          ) {
            targetIndex = overIndex;
          } else if (
            currentDropPosition === "after" &&
            activeIndex > overIndex
          ) {
            targetIndex = overIndex + 1;
          } else if (
            currentDropPosition === "before" &&
            activeIndex < overIndex
          ) {
            targetIndex = overIndex - 1;
          }

          const newSlides = arrayMove(slides, activeIndex, targetIndex);
          reorderSlidesInPlaylistItem(
            sourcePlaylistId,
            sourceItemId,
            newSlides
          );
        }
      }
    } else {
      // Different playlist item = move
      // Find insert position
      const playlist = playlists.find((pl) => pl.id === playlistId);
      if (!playlist) return;

      const targetItem = playlist.items.find((i) => i.id === targetItemId);
      if (!targetItem) return;

      const overIndex = targetItem.slideGroup.slides.findIndex(
        (s) => s.id === over.id
      );

      // Calculate the insert index based on drop position
      // "before" = insert at overIndex, "after" = insert at overIndex + 1
      const insertAtIndex =
        currentDropPosition === "after" ? overIndex + 1 : overIndex;

      moveSlidesToPlaylistItem(
        playlistId,
        sourceItemId,
        targetItemId,
        currentDraggedIds,
        insertAtIndex
      );
    }
  };

  const renderDragOverlay = () => {
    if (
      !activeId ||
      !activeData ||
      !activeData.slide ||
      !activeData.canvasSize
    ) {
      return null;
    }

    const count = draggedIdsRef.current.length;
    const isMulti = count > 1;

    const slidePreview = (
      <Slide
        id={activeData.slide.id}
        data={activeData.slide}
        canvasSize={activeData.canvasSize}
      />
    );

    return isMulti ? (
      <MultiSlideDragOverlay count={count}>
        {slidePreview}
      </MultiSlideDragOverlay>
    ) : (
      <SlideDragOverlay>{slidePreview}</SlideDragOverlay>
    );
  };

  const contextValue: ShowViewDndContextValue = {
    activeId,
    activeData,
    overId,
    overData,
    dropPosition,
    isDragging: activeId !== null,
  };

  return (
    <ShowViewDndContext value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>,
          document.body
        )}
      </DndContext>
    </ShowViewDndContext>
  );
};
