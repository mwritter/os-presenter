import { Library } from "lucide-react";
import {
  useLibraryStore,
  useSelectionStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { DragDropData, LibraryPanelItem } from "./LibraryPanelItem";

type LibraryItemProps = {
  id: string;
  name: string;
  isMultiSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  selectedCount?: number;
};

export const LibraryItem = ({
  id,
  name,
  isMultiSelected,
  onClick,
  onDelete,
  selectedCount,
}: LibraryItemProps) => {
  const selectedLibraryId = useSelectionStore((s) => s.selectedLibraryId);
  const selectLibrary = useSelectionStore((s) => s.selectLibrary);
  const isSelected = selectedLibraryId === id;
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const removeLibrary = useLibraryStore((s) => s.removeLibrary);
  const libraries = useLibraryStore((s) => s.libraries);
  const addLibrarySlideGroup = useLibraryStore((s) => s.addLibrarySlideGroup);
  const removeLibrarySlideGroup = useLibraryStore(
    (s) => s.removeLibrarySlideGroup
  );
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  const handleDelete = (itemId: string) => {
    if (onDelete) {
      onDelete(itemId);
    } else {
      removeLibrary(itemId);
    }
  };

  const handleItemDrop = (data: DragDropData) => {
    // Only handle slide group drops (not playlist items)
    if (data.type !== "slideGroup") return;

    // Don't do anything if dropping on the same library
    if (data.sourceLibraryId === id) return;

    // Find the source library
    const sourceLibrary = libraries.find(
      (lib) => lib.id === data.sourceLibraryId
    );
    if (!sourceLibrary) return;

    // Move each slide group
    data.slideGroupIds.forEach((slideGroupId) => {
      const slideGroup = sourceLibrary.slideGroups.find(
        (sg) => sg.id === slideGroupId
      );
      if (!slideGroup) return;

      // Add to target library (creates a copy with new ID)
      addLibrarySlideGroup(id, { ...slideGroup, id: crypto.randomUUID() });

      // Remove from source library
      removeLibrarySlideGroup(data.sourceLibraryId, slideGroupId);
    });

    // Clear the sidebar selection after successful move
    clearSidebarSelection("libraryItem");
  };

  return (
    <LibraryPanelItem
      id={id}
      name={name}
      icon={
        <div className="bg-orange-400 rounded-xs p-[2px]">
          <Library className="size-3.5" color="white" />
        </div>
      }
      onUpdate={updateLibrary}
      onDelete={handleDelete}
      onSelect={selectLibrary}
      isSelected={isSelected}
      isMultiSelected={isMultiSelected}
      onItemDrop={handleItemDrop}
      onClick={onClick}
      selectedCount={selectedCount}
    />
  );
};
