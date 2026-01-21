import { useState } from "react";

export const useTagGroupMultiSelect = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (
    id: string,
    event: React.MouseEvent,
    itemIds: string[]
  ) => {
    if (event.metaKey || event.ctrlKey) {
      // Toggle selection with Cmd/Ctrl
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else if (event.shiftKey && selectedIds.length > 0) {
      // Range selection with Shift
      const lastSelectedId = selectedIds[selectedIds.length - 1];
      const lastIndex = itemIds.indexOf(lastSelectedId);
      const currentIndex = itemIds.indexOf(id);
      const [start, end] = [
        Math.min(lastIndex, currentIndex),
        Math.max(lastIndex, currentIndex),
      ];
      const rangeIds = itemIds.slice(start, end + 1);
      setSelectedIds((prev) => [...new Set([...prev, ...rangeIds])]);
    } else {
      // Single selection (replace)
      setSelectedIds([id]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    handleSelect,
    clearSelection,
  };
};
