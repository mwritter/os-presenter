import { useEffect, useRef } from "react";
import { ShowViewFooter } from "./ShowViewFooter";
import { ShowViewSlideGrid } from "./ShowViewSlideGrid";
import { useShowKeyboardNav } from "@/hooks/use-show-keyboard-nav";
import {
  useLibraryStore,
  useSelectedSlideGroupData,
  useSelectionStore,
} from "@/stores/presenterStore";

export const ShowViewLibraryContent = () => {
  const selectedSlideGroupData = useSelectedSlideGroupData();
  const selectedSlideGroup = useSelectionStore((s) => s.selectedSlideGroup);
  const addSlideToSlideGroup = useLibraryStore((s) => s.addSlideToSlideGroup);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup keyboard navigation for single slide group
  const slideGroups = selectedSlideGroupData
    ? [
        {
          slides: selectedSlideGroupData.slides,
          title: selectedSlideGroupData.title,
        },
      ]
    : [];

  const { handleKeyDown } = useShowKeyboardNav({
    slideGroups,
    enableMultiGroupNavigation: false,
  });

  // Focus the container when component mounts to ensure keyboard events work
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleAddBlankSlide = () => {
    if (!selectedSlideGroup) return;
    addSlideToSlideGroup(selectedSlideGroup.libraryId, selectedSlideGroup.id);
  };

  const canvasSize = selectedSlideGroupData?.canvasSize || {
    width: 1920,
    height: 1080,
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full relative outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ShowViewSlideGrid
          slides={selectedSlideGroupData?.slides ?? []}
          title={selectedSlideGroupData?.title ?? ""}
          canvasSize={canvasSize}
        />
      </div>
      <ShowViewFooter onAddBlankSlide={handleAddBlankSlide} />
    </div>
  );
};
