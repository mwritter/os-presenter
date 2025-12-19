import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import {
  useSelectionStore,
  useLibraryStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { useRef } from "react";
import { LibraryIcon } from "../../../icons/LibraryIcon";
import { useSidebarDnd, SidebarDragData } from "../SidebarDndProvider";
import { EndDropZone } from "../EndDropZone";
import { Library } from "@/components/presenter/types";
import { cn } from "@/lib/utils";
import { useRenameState } from "./hooks/use-rename-state";
import { useContextMenu } from "./hooks/use-context-menu";

export const LibraryPanelGroupLibraries = () => {
  const libraries = useLibraryStore((s) => s.libraries);
  const selectedLibraryId = useSelectionStore((s) => s.selectedLibraryId);
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const selectLibrary = useSelectionStore((s) => s.selectLibrary);
  const removeLibrary = useLibraryStore((s) => s.removeLibrary);
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const { activeId, activeData, overId, dropPosition } = useSidebarDnd();

  const sortedLibraries = [...libraries].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleDeleteLibraries = (ids: string[]) => {
    ids.forEach((id) => removeLibrary(id));
    clearSidebarSelection("library");
  };

  const { isSelected, isMultiSelectMode, handleItemClick, selectedIds } =
    useSidebarMultiSelect({
      type: "library",
      items: sortedLibraries,
      containerRef,
      onSelect: selectLibrary,
    });

  return (
    <SortableContext
      items={sortedLibraries.map((lib) => lib.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={containerRef} className="relative flex flex-col pb-5">
        <ul className="flex flex-col relative">
          {sortedLibraries.map((library) => {
            const isDragging =
              activeId === library.id ||
              (activeData?.selectedIds?.includes(library.id) ?? false);

            // Get drop position when another library is dragged over this one
            const itemDropPosition =
              overId === library.id &&
              activeData?.type === "library" &&
              !isDragging
                ? dropPosition
                : null;

            // Show external drop highlight when library items are dragged over
            const showExternalDropHighlight =
              overId === library.id &&
              activeData?.type === "libraryItem" &&
              activeData?.sourceId !== library.id;

            return (
              <SortableLibraryItem
                key={library.id}
                library={library}
                isSelected={selectedLibraryId === library.id}
                isMultiSelected={isMultiSelectMode && isSelected(library.id)}
                selectedCount={selectedIds.length}
                selectedIds={selectedIds}
                isDragging={isDragging}
                dropPosition={itemDropPosition}
                showExternalDropHighlight={showExternalDropHighlight}
                onClick={(e) => handleItemClick(library.id, e)}
                onUpdate={updateLibrary}
                onDelete={() => handleDeleteLibraries(selectedIds)}
              />
            );
          })}
        </ul>
        {/* End drop zone for reordering to end of list */}
        <EndDropZone
          zoneId="library-end-zone"
          zoneType="library"
          sourceId="libraries"
          acceptTypes={["library"]}
          className="flex-1 min-h-4"
        />
      </div>
    </SortableContext>
  );
};

interface SortableLibraryItemProps {
  library: Library;
  isSelected: boolean;
  isMultiSelected: boolean;
  selectedCount: number;
  selectedIds: string[];
  isDragging: boolean;
  dropPosition: "before" | "after" | null;
  showExternalDropHighlight: boolean;
  onClick: (e: React.MouseEvent) => void;
  onUpdate: (id: string, updates: { name: string }) => void;
  onDelete: (id: string) => void;
}

const SortableLibraryItem = ({
  library,
  isSelected,
  isMultiSelected,
  selectedCount,
  selectedIds,
  isDragging,
  dropPosition,
  showExternalDropHighlight,
  onClick,
  onUpdate,
  onDelete,
}: SortableLibraryItemProps) => {
  const itemInputRef = useRef<HTMLInputElement>(null);

  const dragData: SidebarDragData = {
    type: "library",
    sourceId: library.id,
    item: library,
    selectedIds: selectedIds.includes(library.id) ? selectedIds : undefined,
  };

  const { attributes, listeners, setNodeRef } = useSortable({
    id: library.id,
    data: dragData,
  });

  const { renameState, onBlur, onKeyDown, onChange, setRenameState } =
    useRenameState({
      id: library.id,
      name: library.name,
      itemInputRef,
      onUpdate,
    });

  const { openContextMenu } = useContextMenu({
    onDelete,
    onRename: () => setRenameState({ mode: "edit", text: library.name }),
    id: library.id,
    selectedCount,
  });

  return (
    <li
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 pl-5 pr-1 py-1 text-white text-xs transition-colors ghost-no-bg ghost-no-ring relative",
        {
          "bg-white/20 ring-1 ring-white/40": isSelected && !isMultiSelected,
          "bg-blue-600": isMultiSelected || showExternalDropHighlight,
          "opacity-50": isDragging,
        }
      )}
      onClick={onClick}
      onContextMenu={openContextMenu}
      {...attributes}
      {...listeners}
    >
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}
      <LibraryIcon />
      {renameState.mode === "edit" ? (
        <input
          ref={itemInputRef}
          className="border w-full bg-black"
          type="text"
          value={renameState.text}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={(e) => {
            // Stop propagation to prevent dnd-kit from capturing space/enter keys
            e.stopPropagation();
            onKeyDown(e);
          }}
        />
      ) : (
        <span className="whitespace-nowrap text-ellipsis overflow-hidden">
          {library.name}
        </span>
      )}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
