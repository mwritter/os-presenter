import { cn } from "@/lib/utils";

interface ItemDragOverlayProps {
  children: React.ReactNode;
  count?: number;
}

/**
 * Drag overlay for a single list item
 */
export const ItemDragOverlay = ({ children }: ItemDragOverlayProps) => {
  return (
    <div
      className={cn(
        "rounded bg-neutral-800/95 shadow-lg pointer-events-none",
        "px-2 py-1 min-w-[150px]"
      )}
    >
      {children}
    </div>
  );
};

/**
 * Drag overlay for multiple selected items with count badge
 */
export const MultiItemDragOverlay = ({ children, count = 2 }: ItemDragOverlayProps) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "rounded bg-neutral-800/95 shadow-lg pointer-events-none",
          "px-2 py-1 min-w-[150px]"
        )}
      >
        {children}
      </div>
      {/* Count badge */}
      <div
        className={cn(
          "absolute -top-2 -right-2 z-10",
          "min-w-[18px] h-[18px] rounded-full",
          "bg-blue-500 text-white",
          "text-[11px] font-semibold",
          "flex items-center justify-center",
          "px-[5px] shadow-md"
        )}
      >
        {count}
      </div>
    </div>
  );
};

interface SlideDragOverlayProps {
  children: React.ReactNode;
  count?: number;
  width?: number;
  height?: number;
}

/**
 * Drag overlay for a single slide
 */
export const SlideDragOverlay = ({ children, width, height }: SlideDragOverlayProps) => {
  return (
    <div
      className={cn(
        "rounded overflow-hidden shadow-lg pointer-events-none",
        "opacity-90"
      )}
      style={{ width, height }}
    >
      {children}
    </div>
  );
};

/**
 * Drag overlay for multiple selected slides with count badge and stacked effect
 */
export const MultiSlideDragOverlay = ({
  children,
  count = 2,
  width,
  height,
}: SlideDragOverlayProps) => {
  return (
    <div className="relative">
      {/* Stacked slides behind */}
      {count > 2 && (
        <div
          className="absolute top-2 left-2 rounded bg-gray-800/40"
          style={{ width, height }}
        />
      )}
      <div
        className="absolute top-1 left-1 rounded bg-gray-700/60"
        style={{ width, height }}
      />
      
      {/* Main slide */}
      <div
        className={cn(
          "relative rounded overflow-hidden shadow-lg pointer-events-none",
          "opacity-90"
        )}
        style={{ width, height }}
      >
        {children}
      </div>
      
      {/* Count badge */}
      <div
        className={cn(
          "absolute -top-2 -right-2 z-10",
          "min-w-[20px] h-[20px] rounded-full",
          "bg-blue-500 text-white",
          "text-xs font-semibold",
          "flex items-center justify-center",
          "px-[6px] shadow-md"
        )}
      >
        {count}
      </div>
    </div>
  );
};

