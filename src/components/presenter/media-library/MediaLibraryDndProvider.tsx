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
import {
  MediaItem,
  selectSelectedPlaylistId,
  selectSelectedPlaylist,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { Slide } from "@/components/feature/slide/Slide";
import { mediaItemToSlideData } from "@/stores/utils/mediaItemToSlideData";
import { SlideDragOverlay, MultiSlideDragOverlay } from "@/components/dnd";

export type MediaLibraryDragType = "mediaItem" | "mediaEndZone";

export interface MediaLibraryDragData {
  type: MediaLibraryDragType;
  playlistId: string;
  mediaItem?: MediaItem;
  selectedIds?: string[];
}

interface MediaLibraryDndContextValue {
  activeId: UniqueIdentifier | null;
  activeData: MediaLibraryDragData | null;
  overId: UniqueIdentifier | null;
  overData: MediaLibraryDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
}

const MediaLibraryDndContext =
  createContext<MediaLibraryDndContextValue | null>(null);

export const useMediaLibraryDnd = () => {
  const context = useContext(MediaLibraryDndContext);
  if (!context) {
    throw new Error(
      "useMediaLibraryDnd must be used within a MediaLibraryDndProvider"
    );
  }
  return context;
};

interface MediaLibraryDndProviderProps {
  children: React.ReactNode;
}

export const MediaLibraryDndProvider = ({
  children,
}: MediaLibraryDndProviderProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeData, setActiveData] = useState<MediaLibraryDragData | null>(
    null
  );
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [overData, setOverData] = useState<MediaLibraryDragData | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const draggedIdsRef = useRef<string[]>([]);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Store actions
  const selectedPlaylistId = useMediaLibraryStore(selectSelectedPlaylistId);
  const selectedPlaylist = useMediaLibraryStore(selectSelectedPlaylist);
  const reorderMediaItemsInPlaylist = useMediaLibraryStore(
    (s) => s.reorderMediaItemsInPlaylist
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as MediaLibraryDragData | undefined;

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
    // Use X position relative to element center for before/after detection (grid layout)
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
      const overDataCurrent = over.data.current as
        | MediaLibraryDragData
        | undefined;

      // Don't set as over target if it's one of the dragged items
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
      | MediaLibraryDragData
      | undefined;
    const overDataCurrent = over?.data.current as
      | MediaLibraryDragData
      | undefined;

    const currentDraggedIds = [...draggedIdsRef.current];
    const currentPosition = dropPosition;

    // Reset state
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setOverData(null);
    setDropPosition(null);
    draggedIdsRef.current = [];
    pointerPositionRef.current = null;

    if (!over || !activeDataCurrent || !selectedPlaylistId || !selectedPlaylist)
      return;
    if (active.id === over.id) return;
    if (currentDraggedIds.includes(over.id as string)) return;

    const mediaItems = selectedPlaylist.mediaItems;

    // Handle dropping on end zone - move items to the end
    if (overDataCurrent?.type === "mediaEndZone") {
      if (currentDraggedIds.length > 1) {
        // Multi-select: move all selected items to the end
        const itemsToMove = mediaItems.filter((item) =>
          currentDraggedIds.includes(item.id)
        );
        const remainingItems = mediaItems.filter(
          (item) => !currentDraggedIds.includes(item.id)
        );
        const newItems = [...remainingItems, ...itemsToMove];
        reorderMediaItemsInPlaylist(selectedPlaylistId, newItems);
      } else {
        // Single item: move to the end
        const activeIndex = mediaItems.findIndex(
          (item) => item.id === active.id
        );
        if (activeIndex !== -1) {
          const newItems = arrayMove(
            mediaItems,
            activeIndex,
            mediaItems.length - 1
          );
          reorderMediaItemsInPlaylist(selectedPlaylistId, newItems);
        }
      }
      return;
    }

    const overIndex = mediaItems.findIndex((item) => item.id === over.id);
    if (overIndex === -1) return;

    // Handle multi-select reorder
    if (currentDraggedIds.length > 1) {
      // Get items that are being moved
      const itemsToMove = mediaItems.filter((item) =>
        currentDraggedIds.includes(item.id)
      );
      // Get items that are not being moved
      const remainingItems = mediaItems.filter(
        (item) => !currentDraggedIds.includes(item.id)
      );

      // Find where to insert in the remaining items
      const overItemInRemaining = remainingItems.findIndex(
        (item) => item.id === over.id
      );

      if (overItemInRemaining !== -1) {
        const insertIndex =
          currentPosition === "after"
            ? overItemInRemaining + 1
            : overItemInRemaining;

        const newItems = [
          ...remainingItems.slice(0, insertIndex),
          ...itemsToMove,
          ...remainingItems.slice(insertIndex),
        ];

        reorderMediaItemsInPlaylist(selectedPlaylistId, newItems);
      }
    } else {
      // Single item reorder
      const activeIndex = mediaItems.findIndex(
        (item) => item.id === active.id
      );

      if (activeIndex === -1) return;

      let targetIndex = overIndex;
      if (currentPosition === "after" && activeIndex < overIndex) {
        targetIndex = overIndex;
      } else if (currentPosition === "before" && activeIndex > overIndex) {
        targetIndex = overIndex;
      } else if (currentPosition === "after" && activeIndex > overIndex) {
        targetIndex = overIndex + 1;
      } else if (currentPosition === "before" && activeIndex < overIndex) {
        targetIndex = overIndex - 1;
      }

      const newItems = arrayMove(mediaItems, activeIndex, targetIndex);
      reorderMediaItemsInPlaylist(selectedPlaylistId, newItems);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setOverData(null);
    setDropPosition(null);
    draggedIdsRef.current = [];
    pointerPositionRef.current = null;
  };

  const contextValue: MediaLibraryDndContextValue = {
    activeId,
    activeData,
    overId,
    overData,
    dropPosition,
    isDragging: activeId !== null,
  };

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeId || !activeData || !activeData.mediaItem) return null;

    const { mediaItem, selectedIds } = activeData;
    const isMulti = selectedIds && selectedIds.length > 1;
    const count = selectedIds?.length ?? 1;

    // Wrap in a fixed-width container to control the preview size
    const slidePreview = (
      <div className="w-[200px]">
        <Slide id={mediaItem.id} data={mediaItemToSlideData(mediaItem)} />
      </div>
    );

    return isMulti ? (
      <MultiSlideDragOverlay count={count}>{slidePreview}</MultiSlideDragOverlay>
    ) : (
      <SlideDragOverlay>{slidePreview}</SlideDragOverlay>
    );
  };

  return (
    <MediaLibraryDndContext value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>,
          document.body
        )}
      </DndContext>
    </MediaLibraryDndContext>
  );
};

