import { Library } from "lucide-react";
import { useLibraryStore, useSelectionStore } from "@/stores/presenterStore";
import { LibraryPanelItem } from "./LibraryPanelItem";

type LibraryItemProps = {
  id: string;
  name: string;
};

export const LibraryItem = ({ id, name }: LibraryItemProps) => {
  const selectedLibraryId = useSelectionStore((s) => s.selectedLibraryId);
  const selectLibrary = useSelectionStore((s) => s.selectLibrary);
  const isSelected = selectedLibraryId === id;
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const removeLibrary = useLibraryStore((s) => s.removeLibrary);
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
      onDelete={removeLibrary}
      onSelect={selectLibrary}
      isSelected={isSelected}
    />
  );
};
