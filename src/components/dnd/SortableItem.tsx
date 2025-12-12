import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DragData, DropPosition } from "./DndProvider";

interface SortableItemProps {
  id: string;
  data?: DragData;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Custom drop indicator component */
  renderDropIndicator?: (position: DropPosition) => React.ReactNode;
}

/**
 * Default drop indicator - a horizontal blue line
 */
const DefaultDropIndicator = ({ position }: { position: DropPosition }) => (
  <div
    className={cn(
      "absolute left-0 right-0 h-0.5 bg-selected z-10",
      position === "before"
        ? "top-0 -translate-y-px"
        : "bottom-0 translate-y-px"
    )}
  />
);

export const SortableItem = ({
  id,
  data,
  disabled = false,
  children,
  className,
  renderDropIndicator,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
    over,
  } = useSortable({
    id,
    data,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate drop position based on mouse position
  // This is handled by tracking pointer position in the parent context
  const isDropTarget = isOver && active?.id !== id;

  // Determine drop position - we use the over data from sortable context
  const dropPosition: DropPosition | null = isDropTarget
    ? (over?.data?.current?.sortable?.index ?? 0) >
      (active?.data?.current?.sortable?.index ?? 0)
      ? "after"
      : "before"
    : null;

  const DropIndicatorComponent = renderDropIndicator
    ? ({ position }: { position: DropPosition }) => (
        <>{renderDropIndicator(position)}</>
      )
    : DefaultDropIndicator;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", className, {
        "opacity-50": isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator - before */}
      {isDropTarget && dropPosition === "before" && (
        <DropIndicatorComponent position="before" />
      )}

      {children}

      {/* Drop indicator - after */}
      {isDropTarget && dropPosition === "after" && (
        <DropIndicatorComponent position="after" />
      )}
    </div>
  );
};
