import { SlideGroup } from "@/components/presenter/types";
import { useItemReorder } from "@/hooks/use-item-reorder";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import {
  useLibraryStore,
  useSelectedLibrary,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useItemPanelContext } from "../context";

interface ItemPanelLibraryContextType {
  libraryId: string | null;
  slideGroups: SlideGroup[];
  selectedIds: string[];
  selectedSlideGroup: SlideGroup | undefined;
  isMultiSelectMode: boolean;
  handleDelete: () => void;
  handleReorder: (
    draggedItemIds: string | string[],
    targetItemId: string | null,
    position: "before" | "after" | "end"
  ) => void;
  handleClick: (slideGroupId: string, e: React.MouseEvent) => void;
  isSelected: (id: string) => boolean;
}

const ItemPanelLibraryContext = createContext<
  ItemPanelLibraryContextType | undefined
>(undefined);

export const ItemPanelLibraryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLibrary = useSelectedLibrary();
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const removeLibrarySlideGroup = useLibraryStore(
    (s) => s.removeLibrarySlideGroup
  );
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const selectedSlideGroupId = useSelectionStore(
    (s) => s.selectedSlideGroup?.id ?? null
  );
  const clearSlideGroupSelection = useSelectionStore(
    (s) => s.clearSlideGroupSelection
  );
  const [slideGroups, setSlideGroups] = useState<SlideGroup[]>(
    selectedLibrary?.slideGroups ?? []
  );
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );
  const { filter } = useItemPanelContext();

  const { orderedItems, handleReorder } = useItemReorder<SlideGroup>({
    items: selectedLibrary?.slideGroups ?? [],
    onReorder: (slideGroups) => {
      updateLibrary(selectedLibrary!.id, { slideGroups });
    },
    active: !filter,
  });

  const filteredSlideGroups = orderedItems.filter((slideGroup) => {
    return filter
      ? slideGroup.title.toLowerCase().includes(filter?.toLowerCase() || "")
      : true;
  });

  // Multi-select support
  const {
    selectedIds,
    handleItemClick,
    isSelected: isSidebarSelected,
    isMultiSelectMode,
  } = useSidebarMultiSelect({
    type: "libraryItem",
    items: filteredSlideGroups,
    containerRef,
  });

  // Combined selection check: sidebar multi-select OR active slide group
  const isSelected = (id: string) => {
    if (isMultiSelectMode) {
      return isSidebarSelected(id);
    }
    return id === selectedSlideGroupId;
  };

  // Delete a library item
  const handleDelete = () => {
    if (!selectedLibrary) return;

    selectedIds.forEach((id) => {
      if (selectedSlideGroupId === id) {
        clearSlideGroupSelection();
      }
      removeLibrarySlideGroup(selectedLibrary.id, id);
    });

    clearSidebarSelection("libraryItem");
  };

  // Click a library item
  const handleClick = (slideGroupId: string, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      handleItemClick(slideGroupId, e);
    } else {
      handleItemClick(slideGroupId, e);
      selectSlideGroup(slideGroupId, selectedLibrary!.id);
    }
  };

  const selectedSlideGroup = slideGroups.find(
    (sg) => sg.id === selectedSlideGroupId
  );

  useEffect(() => {
    setSlideGroups(selectedLibrary?.slideGroups ?? []);
  }, [selectedLibrary]);

  return (
    <ItemPanelLibraryContext
      value={{
        libraryId: selectedLibrary?.id ?? null,
        slideGroups: filteredSlideGroups,
        handleReorder,
        isSelected,
        selectedIds,
        selectedSlideGroup,
        isMultiSelectMode,
        handleDelete,
        handleClick,
      }}
    >
      <div ref={containerRef} className="flex flex-col flex-1">
        {children}
      </div>
    </ItemPanelLibraryContext>
  );
};

export const useItemPanelLibraryContext = () => {
  const context = useContext(ItemPanelLibraryContext);
  if (context === undefined) {
    throw new Error(
      "useItemPanelLibraryContext must be used within a ItemPanelLibraryProvider"
    );
  }
  return context;
};
