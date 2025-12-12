import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortingStrategy,
} from "@dnd-kit/sortable";
import { UniqueIdentifier } from "@dnd-kit/core";

type SortDirection = "vertical" | "horizontal" | "grid";

interface SortableListProps {
  items: UniqueIdentifier[];
  children: React.ReactNode;
  direction?: SortDirection;
  className?: string;
  /** ID for the sortable context - useful for multiple lists */
  id?: string;
}

const strategyMap: Record<SortDirection, SortingStrategy> = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};

/**
 * Wrapper component that provides sortable context for a list of items
 */
export const SortableList = ({
  items,
  children,
  direction = "vertical",
  className,
  id,
}: SortableListProps) => {
  return (
    <SortableContext
      id={id}
      items={items}
      strategy={strategyMap[direction]}
    >
      <div className={className}>{children}</div>
    </SortableContext>
  );
};

