import { Button } from "@/components/ui/button";
import { File, Plus } from "lucide-react";
import { MediaLibrarySidebarItem } from "./MediaLibrarySidebarItem";
import {
  MediaPlaylist,
  selectPlaylists,
  useMediaLibraryStore,
} from "@/stores/presenter/mediaLibraryStore";
import { useSidebarHeaderContextMenu } from "../hooks/use-sidebar-header-context-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useItemReorder } from "@/hooks/use-item-reorder";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import { useRef, useState } from "react";
import { useMediaLibrarySidebarContext } from "./context";
import { useSidebarSelectionStore } from "@/stores/presenter/presenterStore";

export const MediaLibrarySidebar = () => {
  const mediaPlaylists = useMediaLibraryStore(selectPlaylists);
  const reorderPlaylists = useMediaLibraryStore(
    (state) => state.reorderPlaylists
  );
  const removePlaylist = useMediaLibraryStore((state) => state.removePlaylist);
  const { onSelectItem } = useMediaLibrarySidebarContext();
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  const { openContextMenu } = useSidebarHeaderContextMenu();
  const containerRef = useRef<HTMLUListElement>(null);

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  // Sort playlists by order
  const sortedPlaylists = [...mediaPlaylists].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const { orderedItems, handleReorder } = useItemReorder<MediaPlaylist>({
    items: sortedPlaylists,
    onReorder: reorderPlaylists,
  });

  // Multi-select support
  const { selectedIds, isMultiSelectMode, handleItemClick, isSelected } =
    useSidebarMultiSelect({
      type: "mediaPlaylist",
      items: orderedItems,
      containerRef,
      onSelect: (id) => {
        const playlist = orderedItems.find((p) => p.id === id);
        if (playlist) onSelectItem(playlist);
      },
    });

  const handleDeletePlaylists = (ids: string[]) => {
    ids.forEach((id) => removePlaylist(id));
    clearSidebarSelection("mediaPlaylist");
  };

  const activePlaylist = orderedItems.find((p) => p.id === activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    setOverId(over.id as string);

    // Calculate drop position based on cursor position relative to item
    const overIndex = orderedItems.findIndex((item) => item.id === over.id);
    const activeIndex = orderedItems.findIndex((item) => item.id === active.id);

    if (overIndex !== -1 && activeIndex !== -1 && overIndex !== activeIndex) {
      setDropPosition(activeIndex < overIndex ? "after" : "before");
    } else {
      setDropPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);
    setDropPosition(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Determine which items to move
    // If the dragged item is part of a multi-selection, move all selected items
    const idsToMove = selectedIds.includes(activeIdStr)
      ? selectedIds
      : [activeIdStr];

    // Don't drop on one of the items being moved
    if (idsToMove.includes(overIdStr)) return;

    const activeIdx = orderedItems.findIndex((item) => item.id === activeIdStr);
    const overIdx = orderedItems.findIndex((item) => item.id === overIdStr);
    const position = activeIdx < overIdx ? "after" : "before";

    handleReorder(idsToMove, overIdStr, position);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setDropPosition(null);
  };

  return (
    <div>
      <div className="px-2 pt-1 flex items-center justify-between">
        <p className="text-gray-400 font-bold text-xs uppercase">Media</p>
        <Button variant="ghost" size="icon-xs" onClick={openContextMenu}>
          <Plus className="size-3" />
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedItems.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul ref={containerRef} className="flex flex-col mt-2">
            {orderedItems.map((playlist) => {
              const isDraggingThis =
                activeId === playlist.id ||
                (selectedIds.includes(activeId ?? "") &&
                  selectedIds.includes(playlist.id));

              return (
                <MediaLibrarySidebarItem
                  key={playlist.id}
                  item={playlist}
                  isDragging={isDraggingThis}
                  dropPosition={
                    overId === playlist.id && !isDraggingThis
                      ? dropPosition
                      : null
                  }
                  isMultiSelected={isMultiSelectMode && isSelected(playlist.id)}
                  selectedIds={selectedIds}
                  onClick={(e) => handleItemClick(playlist.id, e)}
                  onDelete={() => handleDeletePlaylists(selectedIds)}
                />
              );
            })}
          </ul>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activePlaylist ? (
            <div className="flex gap-1 items-center text-white text-xs p-1 bg-sidebar border border-white/20 shadow-lg rounded">
              <File className="size-3.5 shrink-0" color="white" />
              <span className="whitespace-nowrap">
                {selectedIds.length > 1 &&
                selectedIds.includes(activePlaylist.id)
                  ? `${selectedIds.length} items`
                  : activePlaylist.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
