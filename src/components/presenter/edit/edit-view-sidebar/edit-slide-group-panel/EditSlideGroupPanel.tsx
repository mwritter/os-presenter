import { SlideGroup } from "../../../types";
import { useEditContext } from "@/pages/presenter/edit/context";
import { EditSideGroupPanelHeader } from "./EditSideGroupPanelHeader";
import { EditSlideGroupPanelItem } from "./EditSlideGroupPanelItem";
import {
  EditSlideGroupPanelProvider,
  useEditSlideGroupPanelContext,
} from "./context";
import {
  DndContext,
  DragMoveEvent,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useRef, useCallback } from "react";
import { useItemReorder } from "@/hooks/use-item-reorder";
import { Slide } from "@/components/feature/slide/Slide";
import {
  SlideDragOverlay,
  MultiSlideDragOverlay,
} from "@/components/dnd/DragOverlays";

export const EditSlideGroupPanel = ({
  slideGroup,
}: {
  slideGroup: SlideGroup | null;
}) => {
  return (
    <EditSlideGroupPanelProvider slideGroup={slideGroup}>
      <EditSlideGroupPanelContent />
    </EditSlideGroupPanelProvider>
  );
};

const EditSlideGroupPanelContent = () => {
  const {
    slides,
    canvasSize,
    slideGroup,
    selectedSlideIds,
    isMultiSelectMode,
    handleSlideClick,
    isSlideSelected,
    handleReorder,
    containerRef,
  } = useEditSlideGroupPanelContext();

  const { selectedSlide } = useEditContext();

  // Local DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );
  const [draggedIds, setDraggedIds] = useState<string[]>([]);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Use useItemReorder for handling reorder with before/after positions
  const { orderedItems, handleReorder: itemReorder } = useItemReorder({
    items: slides,
    onReorder: handleReorder,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      setActiveId(id);

      // If dragging a selected item, drag all selected items
      if (selectedSlideIds.includes(id) && selectedSlideIds.length > 1) {
        setDraggedIds(selectedSlideIds);
      } else {
        setDraggedIds([id]);
      }
    },
    [selectedSlideIds]
  );

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { activatorEvent, delta, over } = event;

    if (activatorEvent instanceof PointerEvent) {
      pointerPositionRef.current = {
        x: activatorEvent.clientX + delta.x,
        y: activatorEvent.clientY + delta.y,
      };
    }

    if (over && over.rect && pointerPositionRef.current) {
      // Calculate drop position based on pointer Y position (vertical list)
      const midpoint = over.rect.top + over.rect.height / 2;
      setDropPosition(
        pointerPositionRef.current.y < midpoint ? "before" : "after"
      );
      setOverId(over.id);
    } else {
      setOverId(null);
      setDropPosition(null);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: { over: { id: UniqueIdentifier } | null }) => {
      if (event.over) {
        // Don't set as over target if it's one of the dragged items
        if (draggedIds.includes(event.over.id as string)) {
          setOverId(null);
          setDropPosition(null);
          return;
        }
        setOverId(event.over.id);
      } else {
        setOverId(null);
        setDropPosition(null);
      }
    },
    [draggedIds]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const currentDraggedIds = [...draggedIds];
      const currentDropPosition = dropPosition;

      // Reset state
      setActiveId(null);
      setOverId(null);
      setDropPosition(null);
      setDraggedIds([]);
      pointerPositionRef.current = null;

      if (!over || active.id === over.id) return;
      if (currentDraggedIds.includes(over.id as string)) return;

      // Use itemReorder with before/after position
      itemReorder(
        currentDraggedIds,
        over.id as string,
        currentDropPosition || "after"
      );
    },
    [draggedIds, dropPosition, itemReorder]
  );

  // Check if an item is being dragged
  const isDragging = (id: string) => {
    if (!activeId) return false;
    return draggedIds.includes(id);
  };

  // Get drop position for a specific item
  const getDropPosition = (id: string): "before" | "after" | null => {
    if (overId === id && !draggedIds.includes(id)) {
      return dropPosition;
    }
    return null;
  };

  // Get the active slide for drag overlay
  const activeSlideData = activeId
    ? orderedItems.find((s) => s.id === activeId)
    : null;

  // Render drag overlay content
  const renderDragOverlay = () => {
    if (!activeSlideData) return null;

    const slidePreview = (
      <Slide
        id={activeSlideData.id}
        data={activeSlideData}
        canvasSize={canvasSize}
      />
    );

    if (draggedIds.length > 1) {
      return (
        <MultiSlideDragOverlay count={draggedIds.length}>
          {slidePreview}
        </MultiSlideDragOverlay>
      );
    }

    return <SlideDragOverlay>{slidePreview}</SlideDragOverlay>;
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-shade-3 h-full">
      <EditSideGroupPanelHeader title={slideGroup?.title} />
      <div className="p-2 bg-shade-4">
        <p className="text-gray-400 text-xs">Group</p>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex-1 overflow-y-auto">
            {orderedItems.map((slide, index) => {
              const isBeingDragged = isDragging(slide.id);
              const isSelected = isSlideSelected(slide.id);
              const isActiveSlide = selectedSlide?.id === slide.id;
              const itemDropPosition = getDropPosition(slide.id);

              return (
                <EditSlideGroupPanelItem
                  key={slide.id}
                  slide={slide}
                  position={index + 1}
                  canvasSize={canvasSize}
                  isSelected={isSelected}
                  isActiveSlide={isActiveSlide}
                  isMultiSelectMode={isMultiSelectMode}
                  isDragging={isBeingDragged}
                  dropPosition={itemDropPosition}
                  onClick={(e) => handleSlideClick(slide.id, slide, e)}
                />
              );
            })}
          </ul>
        </SortableContext>
        <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>
      </DndContext>
    </div>
  );
};
