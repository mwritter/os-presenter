import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createContext, useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useLibraryStore,
  usePlaylistStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import {
  Library,
  Playlist,
  SlideGroup,
  PlaylistItem,
} from "@/components/presenter/types";
import { LibraryIcon } from "@/components/icons/LibraryIcon";
import { PlaylistIcon } from "@/components/icons/PlaylistIcon";
import { File } from "lucide-react";
import {
  ItemDragOverlay,
  MultiItemDragOverlay,
} from "@/components/dnd/DragOverlays";

// Drag data types
export type SidebarDragType =
  | "library"
  | "playlist"
  | "libraryItem"
  | "playlistItem"
  | "endZone"; // Special type for end-of-list drop zones

export interface SidebarDragData {
  type: SidebarDragType;
  sourceId: string; // Container ID (library ID or playlist ID)
  item: Library | Playlist | SlideGroup | PlaylistItem;
  selectedIds?: string[]; // For multi-select
  // For end zones
  zoneType?: "library" | "playlist" | "libraryItem" | "playlistItem";
}

interface SidebarDndContextValue {
  activeId: UniqueIdentifier | null;
  activeData: SidebarDragData | null;
  overId: UniqueIdentifier | null;
  overData: SidebarDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
}

const SidebarDndContext = createContext<SidebarDndContextValue | null>(null);

export const useSidebarDnd = () => {
  const context = useContext(SidebarDndContext);
  if (!context) {
    throw new Error("useSidebarDnd must be used within a SidebarDndProvider");
  }
  return context;
};

export const SidebarDndProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeData, setActiveData] = useState<SidebarDragData | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [overData, setOverData] = useState<SidebarDragData | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  // Store refs for multi-select handling
  const draggedIdsRef = useRef<string[]>([]);

  // Store actions
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const reorderLibraries = useLibraryStore((s) => s.reorderLibraries);
  const reorderPlaylists = usePlaylistStore((s) => s.reorderPlaylists);
  const reorderPlaylistItems = usePlaylistStore((s) => s.reorderPlaylistItems);
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as SidebarDragData | undefined;

    setActiveId(active.id);
    setActiveData(data ?? null);

    // Track which IDs are being dragged (for multi-select)
    if (data?.selectedIds && data.selectedIds.length > 1) {
      draggedIdsRef.current = data.selectedIds;
    } else {
      draggedIdsRef.current = [active.id as string];
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    const activeDataCurrent = active.data.current as SidebarDragData | undefined;

    if (over) {
      const overDataCurrent = over.data.current as SidebarDragData | undefined;

      // Don't set as over target if it's one of the dragged items
      if (draggedIdsRef.current.includes(over.id as string)) {
        setOverId(null);
        setOverData(null);
        setDropPosition(null);
        return;
      }

      setOverId(over.id);
      setOverData(overDataCurrent ?? null);

      // Calculate drop position based on relative indices (more reliable than pointer tracking)
      // If dragging DOWN (activeIndex < overIndex) -> show "after" indicator
      // If dragging UP (activeIndex > overIndex) -> show "before" indicator
      const activeType = activeDataCurrent?.type;
      const overType = overDataCurrent?.type;

      // Only calculate position for same-type reordering
      if (activeType === overType && activeType) {
        let items: { id: string }[] = [];

        if (activeType === "playlist") {
          items = [...playlists].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } else if (activeType === "libraryItem") {
          items = [...libraries].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } else if (activeType === "playlistItem") {
          // For playlist items, get items from the source playlist
          const sourcePlaylist = playlists.find(
            (p) => p.id === activeDataCurrent?.sourceId
          );
          if (sourcePlaylist) {
            items = [...sourcePlaylist.items].sort(
              (a, b) => (a.order ?? 0) - (b.order ?? 0)
            );
          }
        }

        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          setDropPosition(activeIndex < overIndex ? "after" : "before");
        } else {
          setDropPosition(null);
        }
      } else {
        // Cross-type drops (e.g., library item to playlist)
        setDropPosition(null);
      }
    } else {
      setOverId(null);
      setOverData(null);
      setDropPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeDataCurrent = active.data.current as
      | SidebarDragData
      | undefined;
    const overDataCurrent = over?.data.current as SidebarDragData | undefined;
    const currentDraggedIds = draggedIdsRef.current;
    const currentDropPosition = dropPosition;

    // Reset state
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setOverData(null);
    setDropPosition(null);
    draggedIdsRef.current = [];

    if (!over || !activeDataCurrent || !overDataCurrent) {
      return;
    }

    // Don't drop on self
    if (active.id === over.id) {
      return;
    }

    // Don't drop on one of the dragged items
    if (currentDraggedIds.includes(over.id as string)) {
      return;
    }

    // Handle based on drag type combinations
    const { type: activeType, sourceId: activeSourceId } = activeDataCurrent;
    const {
      type: overType,
      sourceId: overSourceId,
      zoneType,
    } = overDataCurrent;

    // Handle END ZONE drops first
    if (overType === "endZone") {
      if (activeType === zoneType) {
        // Move to end of the same type of list
        if (activeType === "library") {
          handleLibraryMoveToEnd(currentDraggedIds);
        } else if (activeType === "playlist") {
          handlePlaylistMoveToEnd(currentDraggedIds);
        } else if (
          activeType === "libraryItem" &&
          activeSourceId === overSourceId
        ) {
          handleLibraryItemMoveToEnd(activeSourceId, currentDraggedIds);
        } else if (
          activeType === "playlistItem" &&
          activeSourceId === overSourceId
        ) {
          handlePlaylistItemMoveToEnd(activeSourceId, currentDraggedIds);
        }
      }
      // Clear sidebar selection after drop
      clearSidebarSelection("libraryItem");
      clearSidebarSelection("playlistItem");
      return;
    }

    // LIBRARY reordering
    if (activeType === "library" && overType === "library") {
      handleLibraryReorder(
        active.id as string,
        over.id as string,
        currentDraggedIds,
        currentDropPosition
      );
    }
    // PLAYLIST reordering
    else if (activeType === "playlist" && overType === "playlist") {
      handlePlaylistReorder(
        active.id as string,
        over.id as string,
        currentDraggedIds,
        currentDropPosition
      );
    }
    // LIBRARY ITEM operations
    else if (activeType === "libraryItem") {
      if (overType === "libraryItem") {
        if (activeSourceId === overSourceId) {
          // Same library = reorder
          handleLibraryItemReorder(
            activeSourceId,
            active.id as string,
            over.id as string,
            currentDraggedIds,
            currentDropPosition
          );
        } else {
          // Different library = move
          handleMoveToLibrary(activeSourceId, overSourceId, currentDraggedIds);
        }
      } else if (overType === "library") {
        // Drop on library container = move
        if (activeSourceId !== over.id) {
          handleMoveToLibrary(
            activeSourceId,
            over.id as string,
            currentDraggedIds
          );
        }
      } else if (overType === "playlist") {
        // Drop on playlist = copy (only when directly over a playlist)
        handleCopyToPlaylist(
          activeSourceId,
          over.id as string,
          currentDraggedIds
        );
      } else if (overType === "playlistItem") {
        // Drop on playlist item = copy to that playlist
        handleCopyToPlaylist(activeSourceId, overSourceId, currentDraggedIds);
      }
    }
    // PLAYLIST ITEM operations
    else if (activeType === "playlistItem") {
      if (overType === "playlistItem") {
        if (activeSourceId === overSourceId) {
          // Same playlist = reorder
          handlePlaylistItemReorder(
            activeSourceId,
            active.id as string,
            over.id as string,
            currentDraggedIds,
            currentDropPosition
          );
        } else {
          // Different playlist = move
          handleMoveToPlaylist(activeSourceId, overSourceId, currentDraggedIds);
        }
      } else if (overType === "playlist") {
        // Drop on playlist container = move (only when directly over a playlist)
        if (activeSourceId !== over.id) {
          handleMoveToPlaylist(
            activeSourceId,
            over.id as string,
            currentDraggedIds
          );
        }
      }
      // Note: playlist items dropped on libraries or library items do nothing
    }

    // Clear sidebar selection after drop
    clearSidebarSelection("libraryItem");
    clearSidebarSelection("playlistItem");
  };

  // Reorder libraries
  const handleLibraryReorder = (
    activeId: string,
    overId: string,
    draggedIds: string[],
    position: "before" | "after" | null
  ) => {
    const sortedLibraries = [...libraries].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    if (draggedIds.length > 1) {
      // Multi-select reorder
      const itemsToMove = sortedLibraries.filter((lib) =>
        draggedIds.includes(lib.id)
      );
      const remainingItems = sortedLibraries.filter(
        (lib) => !draggedIds.includes(lib.id)
      );
      const targetIndex = remainingItems.findIndex((lib) => lib.id === overId);

      if (targetIndex === -1) return;

      // Use pointer position to determine insert location
      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const newItems = [
        ...remainingItems.slice(0, insertIndex),
        ...itemsToMove,
        ...remainingItems.slice(insertIndex),
      ].map((item, index) => ({ ...item, order: index }));

      reorderLibraries(newItems);
    } else {
      // Single item reorder
      const activeIndex = sortedLibraries.findIndex(
        (lib) => lib.id === activeId
      );
      const overIndex = sortedLibraries.findIndex((lib) => lib.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Calculate target index based on drop position
        let targetIndex = overIndex;
        if (position === "after" && activeIndex < overIndex) {
          targetIndex = overIndex;
        } else if (position === "before" && activeIndex > overIndex) {
          targetIndex = overIndex;
        } else if (position === "after" && activeIndex > overIndex) {
          targetIndex = overIndex + 1;
        } else if (position === "before" && activeIndex < overIndex) {
          targetIndex = overIndex - 1;
        }

        const newItems = arrayMove(
          sortedLibraries,
          activeIndex,
          targetIndex
        ).map((item, index) => ({ ...item, order: index }));
        reorderLibraries(newItems);
      }
    }
  };

  // Reorder playlists
  const handlePlaylistReorder = (
    activeId: string,
    overId: string,
    draggedIds: string[],
    position: "before" | "after" | null
  ) => {
    const sortedPlaylists = [...playlists].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    if (draggedIds.length > 1) {
      const itemsToMove = sortedPlaylists.filter((pl) =>
        draggedIds.includes(pl.id)
      );
      const remainingItems = sortedPlaylists.filter(
        (pl) => !draggedIds.includes(pl.id)
      );
      const targetIndex = remainingItems.findIndex((pl) => pl.id === overId);

      if (targetIndex === -1) return;

      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const newItems = [
        ...remainingItems.slice(0, insertIndex),
        ...itemsToMove,
        ...remainingItems.slice(insertIndex),
      ].map((item, index) => ({ ...item, order: index }));

      reorderPlaylists(newItems);
    } else {
      const activeIndex = sortedPlaylists.findIndex((pl) => pl.id === activeId);
      const overIndex = sortedPlaylists.findIndex((pl) => pl.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        let targetIndex = overIndex;
        if (position === "after" && activeIndex < overIndex) {
          targetIndex = overIndex;
        } else if (position === "before" && activeIndex > overIndex) {
          targetIndex = overIndex;
        } else if (position === "after" && activeIndex > overIndex) {
          targetIndex = overIndex + 1;
        } else if (position === "before" && activeIndex < overIndex) {
          targetIndex = overIndex - 1;
        }

        const newItems = arrayMove(
          sortedPlaylists,
          activeIndex,
          targetIndex
        ).map((item, index) => ({ ...item, order: index }));
        reorderPlaylists(newItems);
      }
    }
  };

  // Reorder library items (slide groups)
  const handleLibraryItemReorder = (
    libraryId: string,
    activeId: string,
    overId: string,
    draggedIds: string[],
    position: "before" | "after" | null
  ) => {
    const library = libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroups = library.slideGroups;

    if (draggedIds.length > 1) {
      const itemsToMove = slideGroups.filter((sg) =>
        draggedIds.includes(sg.id)
      );
      const remainingItems = slideGroups.filter(
        (sg) => !draggedIds.includes(sg.id)
      );
      const targetIndex = remainingItems.findIndex((sg) => sg.id === overId);

      if (targetIndex === -1) return;

      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const newSlideGroups = [
        ...remainingItems.slice(0, insertIndex),
        ...itemsToMove,
        ...remainingItems.slice(insertIndex),
      ];

      updateLibrary(libraryId, { slideGroups: newSlideGroups });
    } else {
      const activeIndex = slideGroups.findIndex((sg) => sg.id === activeId);
      const overIndex = slideGroups.findIndex((sg) => sg.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        let targetIndex = overIndex;
        if (position === "after" && activeIndex < overIndex) {
          targetIndex = overIndex;
        } else if (position === "before" && activeIndex > overIndex) {
          targetIndex = overIndex;
        } else if (position === "after" && activeIndex > overIndex) {
          targetIndex = overIndex + 1;
        } else if (position === "before" && activeIndex < overIndex) {
          targetIndex = overIndex - 1;
        }

        const newSlideGroups = arrayMove(slideGroups, activeIndex, targetIndex);
        updateLibrary(libraryId, { slideGroups: newSlideGroups });
      }
    }
  };

  // Reorder playlist items
  const handlePlaylistItemReorder = (
    playlistId: string,
    activeId: string,
    overId: string,
    draggedIds: string[],
    position: "before" | "after" | null
  ) => {
    const playlist = playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;

    const items = playlist.items;

    if (draggedIds.length > 1) {
      const itemsToMove = items.filter((item) => draggedIds.includes(item.id));
      const remainingItems = items.filter(
        (item) => !draggedIds.includes(item.id)
      );
      const targetIndex = remainingItems.findIndex(
        (item) => item.id === overId
      );

      if (targetIndex === -1) return;

      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

      const newItems = [
        ...remainingItems.slice(0, insertIndex),
        ...itemsToMove,
        ...remainingItems.slice(insertIndex),
      ].map((item, index) => ({ ...item, order: index }));

      reorderPlaylistItems(playlistId, newItems);
    } else {
      const activeIndex = items.findIndex((item) => item.id === activeId);
      const overIndex = items.findIndex((item) => item.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        let targetIndex = overIndex;
        if (position === "after" && activeIndex < overIndex) {
          targetIndex = overIndex;
        } else if (position === "before" && activeIndex > overIndex) {
          targetIndex = overIndex;
        } else if (position === "after" && activeIndex > overIndex) {
          targetIndex = overIndex + 1;
        } else if (position === "before" && activeIndex < overIndex) {
          targetIndex = overIndex - 1;
        }

        const newItems = arrayMove(items, activeIndex, targetIndex).map(
          (item, index) => ({ ...item, order: index })
        );
        reorderPlaylistItems(playlistId, newItems);
      }
    }
  };

  // Move libraries to end of list
  const handleLibraryMoveToEnd = (draggedIds: string[]) => {
    const sortedLibraries = [...libraries].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const itemsToMove = sortedLibraries.filter((lib) =>
      draggedIds.includes(lib.id)
    );
    const remainingItems = sortedLibraries.filter(
      (lib) => !draggedIds.includes(lib.id)
    );

    const newItems = [...remainingItems, ...itemsToMove].map((item, index) => ({
      ...item,
      order: index,
    }));

    reorderLibraries(newItems);
  };

  // Move playlists to end of list
  const handlePlaylistMoveToEnd = (draggedIds: string[]) => {
    const sortedPlaylists = [...playlists].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const itemsToMove = sortedPlaylists.filter((pl) =>
      draggedIds.includes(pl.id)
    );
    const remainingItems = sortedPlaylists.filter(
      (pl) => !draggedIds.includes(pl.id)
    );

    const newItems = [...remainingItems, ...itemsToMove].map((item, index) => ({
      ...item,
      order: index,
    }));

    reorderPlaylists(newItems);
  };

  // Move library items to end of list
  const handleLibraryItemMoveToEnd = (
    libraryId: string,
    draggedIds: string[]
  ) => {
    const library = libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroups = library.slideGroups;
    const itemsToMove = slideGroups.filter((sg) => draggedIds.includes(sg.id));
    const remainingItems = slideGroups.filter(
      (sg) => !draggedIds.includes(sg.id)
    );

    const newSlideGroups = [...remainingItems, ...itemsToMove];
    updateLibrary(libraryId, { slideGroups: newSlideGroups });
  };

  // Move playlist items to end of list
  const handlePlaylistItemMoveToEnd = (
    playlistId: string,
    draggedIds: string[]
  ) => {
    const playlist = playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;

    const items = playlist.items;
    const itemsToMove = items.filter((item) => draggedIds.includes(item.id));
    const remainingItems = items.filter(
      (item) => !draggedIds.includes(item.id)
    );

    const newItems = [...remainingItems, ...itemsToMove].map((item, index) => ({
      ...item,
      order: index,
    }));

    reorderPlaylistItems(playlistId, newItems);
  };

  // Move library items to another library
  const handleMoveToLibrary = (
    sourceLibraryId: string,
    targetLibraryId: string,
    slideGroupIds: string[]
  ) => {
    const sourceLibrary = libraries.find((lib) => lib.id === sourceLibraryId);
    const targetLibrary = libraries.find((lib) => lib.id === targetLibraryId);
    if (!sourceLibrary || !targetLibrary) return;

    // Get slide groups to move
    const slideGroupsToMove = sourceLibrary.slideGroups.filter((sg) =>
      slideGroupIds.includes(sg.id)
    );

    // Create new slide groups with new IDs for the target
    const newSlideGroups = slideGroupsToMove.map((sg) => ({
      ...sg,
      id: crypto.randomUUID(),
      meta: { ...sg.meta, libraryId: targetLibraryId },
    }));

    // Add to target library
    updateLibrary(targetLibraryId, {
      slideGroups: [...targetLibrary.slideGroups, ...newSlideGroups],
    });

    // Remove from source library
    const remainingSlideGroups = sourceLibrary.slideGroups.filter(
      (sg) => !slideGroupIds.includes(sg.id)
    );
    updateLibrary(sourceLibraryId, { slideGroups: remainingSlideGroups });
  };

  // Copy library items to playlist
  const handleCopyToPlaylist = (
    sourceLibraryId: string,
    targetPlaylistId: string,
    slideGroupIds: string[]
  ) => {
    // Use the store action for each slide group
    slideGroupIds.forEach((sgId) => {
      addSlideGroupToPlaylist(targetPlaylistId, sourceLibraryId, sgId);
    });
  };

  // Move playlist items to another playlist
  const handleMoveToPlaylist = (
    sourcePlaylistId: string,
    targetPlaylistId: string,
    itemIds: string[]
  ) => {
    const sourcePlaylist = playlists.find((pl) => pl.id === sourcePlaylistId);
    const targetPlaylist = playlists.find((pl) => pl.id === targetPlaylistId);
    if (!sourcePlaylist || !targetPlaylist) return;

    // Get items to move
    const itemsToMove = sourcePlaylist.items.filter((item) =>
      itemIds.includes(item.id)
    );

    // Create new items for target playlist
    const newItems = itemsToMove.map((item, index) => ({
      id: crypto.randomUUID(),
      slideGroup: {
        ...item.slideGroup,
        id: crypto.randomUUID(),
        meta: {
          ...item.slideGroup.meta,
          playlistId: targetPlaylistId,
        },
      },
      order: targetPlaylist.items.length + index,
    }));

    // Add to target playlist
    updatePlaylist(targetPlaylistId, {
      items: [...targetPlaylist.items, ...newItems],
    });

    // Remove from source playlist
    const remainingItems = sourcePlaylist.items.filter(
      (item) => !itemIds.includes(item.id)
    );
    updatePlaylist(sourcePlaylistId, { items: remainingItems });
  };

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeId || !activeData) return null;

    const count = draggedIdsRef.current.length;
    const isMulti = count > 1;

    const content = (() => {
      switch (activeData.type) {
        case "library":
          return (
            <div className="flex items-center gap-2 text-white text-xs">
              <LibraryIcon />
              <span>{(activeData.item as Library).name}</span>
            </div>
          );
        case "playlist":
          return (
            <div className="flex items-center gap-2 text-white text-xs">
              <PlaylistIcon />
              <span>{(activeData.item as Playlist).name}</span>
            </div>
          );
        case "libraryItem":
          return (
            <div className="flex items-center gap-2 text-white text-xs">
              <File className="size-3.5" />
              <span>{(activeData.item as SlideGroup).title}</span>
            </div>
          );
        case "playlistItem":
          return (
            <div className="flex items-center gap-2 text-white text-xs">
              <File className="size-3.5" />
              <span>{(activeData.item as PlaylistItem).slideGroup.title}</span>
            </div>
          );
        default:
          return null;
      }
    })();

    return isMulti ? (
      <MultiItemDragOverlay count={count}>{content}</MultiItemDragOverlay>
    ) : (
      <ItemDragOverlay>{content}</ItemDragOverlay>
    );
  };

  const contextValue: SidebarDndContextValue = {
    activeId,
    activeData,
    overId,
    overData,
    dropPosition,
    isDragging: activeId !== null,
  };

  return (
    <SidebarDndContext value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>,
          document.body
        )}
      </DndContext>
    </SidebarDndContext>
  );
};
