import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { useEditSlideGroupItemContextMenu } from "./hooks/use-edit-slide-group-item-context-menu";
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { useEditSlideGroupPanelContext } from "./context";

type EditSlideGroupPanelItemProps = {
  slide: SlideData;
  position: number;
  canvasSize: CanvasSize;
  isSelected: boolean;
  isActiveSlide: boolean;
  isMultiSelectMode: boolean;
  isDragging: boolean;
  dropPosition: "before" | "after" | null;
  onClick: (e: React.MouseEvent) => void;
};

export const EditSlideGroupPanelItem = ({
  slide,
  position,
  canvasSize,
  isSelected,
  isActiveSlide,
  isMultiSelectMode,
  isDragging,
  dropPosition,
  onClick,
}: EditSlideGroupPanelItemProps) => {
  const { selectedSlideIds } = useEditSlideGroupPanelContext();

  const { attributes, listeners, setNodeRef } = useSortable({
    id: slide.id,
  });

  const { openContextMenu } = useEditSlideGroupItemContextMenu({
    id: slide.id,
    selectedIds: selectedSlideIds,
    selectedCount: selectedSlideIds.length,
  });

  return (
    <li
      ref={setNodeRef}
      className={cn("relative p-2 w-full flex flex-col gap-2 cursor-grab", {
        "opacity-50": isDragging,
        "bg-blue-500": isActiveSlide && !isMultiSelectMode,
        "bg-blue-600": isSelected && isMultiSelectMode,
        "hover:bg-shade-1": !isActiveSlide && !isSelected,
      })}
      onClick={onClick}
      onContextMenu={(e) => openContextMenu(e)}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator - before */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}

      <Slide id={slide.id} data={slide} canvasSize={canvasSize} />
      <p className="text-white text-xs font-bold text-left">{position}</p>

      {/* Drop indicator - after */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
