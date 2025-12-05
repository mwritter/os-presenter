import {
  useLibraryStore,
  useSelectedLibrary,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { useItemPanelContext } from "../context";
import { SlideGroup } from "../../../types";
import { LibraryContentDraggableGroup } from "./LibraryContentDraggableGroup";
import { useItemReorder } from "@/hooks/use-item-reorder";

export const ItemPanelLibraryContent = () => {
  const selectedLibrary = useSelectedLibrary();
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const removeLibrarySlideGroup = useLibraryStore(
    (s) => s.removeLibrarySlideGroup
  );
  const selectedSlideGroupId = useSelectionStore(
    (s) => s.selectedSlideGroup?.id ?? null
  );
  const selectSlideGroup = useSelectionStore((s) => s.selectSlideGroup);
  const clearSlideGroupSelection = useSelectionStore(
    (s) => s.clearSlideGroupSelection
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
    return slideGroup.title.toLowerCase().includes(filter?.toLowerCase() || "");
  });

  const handleSelectSlideGroup = (slideGroupId: string) => {
    selectSlideGroup(slideGroupId, selectedLibrary!.id);
  };

  const handleDeleteMultiple = (ids: string[]) => {
    if (!selectedLibrary) return;

    ids.forEach((id) => {
      // Clear selection if this slide group is currently selected
      if (selectedSlideGroupId === id) {
        clearSlideGroupSelection();
      }
      removeLibrarySlideGroup(selectedLibrary.id, id);
    });

    clearSidebarSelection("libraryItem");
  };

  if (!selectedLibrary) return null;

  const slideGroups = filter ? filteredSlideGroups : orderedItems;

  return (
    <LibraryContentDraggableGroup
      slideGroups={slideGroups}
      libraryId={selectedLibrary.id}
      selectedSlideGroupId={selectedSlideGroupId}
      isFiltering={!!filter}
      onSelect={handleSelectSlideGroup}
      onReorder={handleReorder}
      onDeleteMultiple={handleDeleteMultiple}
    />
  );
};
