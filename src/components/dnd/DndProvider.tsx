import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  pointerWithin,
  CollisionDetection,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createContext, useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";

export type DragData = {
  type: string;
  sourceId?: string;
  item?: unknown;
  items?: unknown[];
  selectedIds?: string[];
};

export type DropPosition = "before" | "after";

interface DndContextValue {
  activeId: UniqueIdentifier | null;
  activeData: DragData | null;
  overId: UniqueIdentifier | null;
  dropPosition: DropPosition | null;
  isDragging: boolean;
}

const DndStateContext = createContext<DndContextValue | null>(null);

export const useDndState = () => {
  const context = useContext(DndStateContext);
  if (!context) {
    throw new Error("useDndState must be used within a DndProvider");
  }
  return context;
};

interface DndProviderProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  renderOverlay?: (activeId: UniqueIdentifier, activeData: DragData | null) => React.ReactNode;
}

/**
 * Custom collision detection that determines drop position (before/after)
 * based on pointer position relative to the element's midpoint
 */
const customCollisionDetection: CollisionDetection = (args) => {
  // First, get collisions using closest center
  const closestCollisions = closestCenter(args);
  
  // If we have a collision, return it
  if (closestCollisions.length > 0) {
    return closestCollisions;
  }
  
  // Fallback to pointer within for edge cases
  return pointerWithin(args);
};

export const DndProvider = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  renderOverlay,
}: DndProviderProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  
  // Track pointer position for drop position calculation
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveData(active.data.current as DragData | null);
    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (over) {
      setOverId(over.id);

      // Calculate drop position based on pointer position
      const overRect = over.rect;
      const pointerPosition = pointerPositionRef.current;

      if (overRect && pointerPosition) {
        // For vertical lists, use Y coordinate
        const midpoint = overRect.top + overRect.height / 2;
        const position: DropPosition =
          pointerPosition.y < midpoint ? "before" : "after";
        setDropPosition(position);
      }
    } else {
      setOverId(null);
      setDropPosition(null);
    }

    onDragOver?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setDropPosition(null);
    onDragEnd?.(event);
  };

  const handleDragMove = (event: { activatorEvent: Event }) => {
    const mouseEvent = event.activatorEvent as MouseEvent;
    if (mouseEvent) {
      pointerPositionRef.current = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };
    }
  };

  const contextValue: DndContextValue = {
    activeId,
    activeData,
    overId,
    dropPosition,
    isDragging: activeId !== null,
  };

  return (
    <DndStateContext value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>
            {activeId && renderOverlay?.(activeId, activeData)}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </DndStateContext>
  );
};

