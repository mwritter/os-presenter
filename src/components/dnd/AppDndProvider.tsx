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
  DragMoveEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createContext, useContext, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  useLibraryStore,
  usePlaylistStore,
  useSidebarSelectionStore,
} from "@/stores/presenter/presenterStore";
import {
  MediaItem,
  selectSelectedPlaylistId,
  selectSelectedPlaylist,
  useMediaLibraryStore,
} from "@/stores/presenter/mediaLibraryStore";
import {
  Library,
  Playlist,
  SlideGroup,
  PlaylistItem,
} from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { LibraryIcon } from "@/components/icons/LibraryIcon";
import { PlaylistIcon } from "@/components/icons/PlaylistIcon";
import { File } from "lucide-react";
import { Slide } from "@/components/feature/slide/Slide";
import { mediaItemToSlideData } from "@/stores/utils/mediaItemToSlideData";
import {
  ItemDragOverlay,
  MultiItemDragOverlay,
  SlideDragOverlay,
  MultiSlideDragOverlay,
} from "./DragOverlays";

// ===== UNIFIED DRAG TYPES =====

export type AppDragType =
  // Media Library
  | "mediaItem"
  | "mediaEndZone"
  // Show View
  | "slide"
  | "slideGridEndZone"
  // Sidebar
  | "library"
  | "playlist"
  | "libraryItem"
  | "playlistItem"
  | "endZone";

export interface AppDragData {
  type: AppDragType;

  // Common
  sourceId?: string; // Container ID (library ID, playlist ID, media playlist ID)
  selectedIds?: string[];

  // Media Library specific
  mediaItem?: MediaItem;
  mediaPlaylistId?: string;

  // Show View specific
  slide?: SlideData;
  canvasSize?: CanvasSize;
  playlistId?: string;
  playlistItemId?: string;

  // Sidebar specific
  item?: Library | Playlist | SlideGroup | PlaylistItem;
  zoneType?: "library" | "playlist" | "libraryItem" | "playlistItem";
}

interface AppDndContextValue {
  activeId: UniqueIdentifier | null;
  activeData: AppDragData | null;
  overId: UniqueIdentifier | null;
  overData: AppDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
  draggedIds: string[];
}

const AppDndContext = createContext<AppDndContextValue | null>(null);

export const useAppDnd = () => {
  const context = useContext(AppDndContext);
  if (!context) {
    throw new Error("useAppDnd must be used within an AppDndProvider");
  }
  return context;
};

interface AppDndProviderProps {
  children: React.ReactNode;
}

export const AppDndProvider = ({ children }: AppDndProviderProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeData, setActiveData] = useState<AppDragData | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [overData, setOverData] = useState<AppDragData | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  const draggedIdsRef = useRef<string[]>([]);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  // ===== MEDIA LIBRARY STORE =====
  const selectedMediaPlaylistId = useMediaLibraryStore(selectSelectedPlaylistId);
  const selectedMediaPlaylist = useMediaLibraryStore(selectSelectedPlaylist);
  const reorderMediaItemsInPlaylist = useMediaLibraryStore(
    (s) => s.reorderMediaItemsInPlaylist
  );

  // ===== PLAYLIST STORE =====
  const playlists = usePlaylistStore((s) => s.playlists);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const reorderPlaylistItems = usePlaylistStore((s) => s.reorderPlaylistItems);
  const reorderPlaylists = usePlaylistStore((s) => s.reorderPlaylists);
  const reorderSlidesInPlaylistItem = usePlaylistStore(
    (s) => s.reorderSlidesInPlaylistItem
  );
  const moveSlidesToPlaylistItem = usePlaylistStore(
    (s) => s.moveSlidesToPlaylistItem
  );
  const addSlideGroupToPlaylist = usePlaylistStore(
    (s) => s.addSlideGroupToPlaylist
  );
  const addMediaItemToPlaylist = usePlaylistStore(
    (s) => s.addMediaItemToPlaylist
  );
  const addSlidesToPlaylistItem = usePlaylistStore(
    (s) => s.addSlidesToPlaylistItem
  );

  // ===== LIBRARY STORE =====
  const libraries = useLibraryStore((s) => s.libraries);
  const updateLibrary = useLibraryStore((s) => s.updateLibrary);
  const reorderLibraries = useLibraryStore((s) => s.reorderLibraries);

  // ===== SIDEBAR SELECTION =====
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

  // ===== DRAG HANDLERS =====

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as AppDragData | undefined;

    setActiveId(active.id);
    setActiveData(data ?? null);

    if (data?.selectedIds && data.selectedIds.length > 1) {
      draggedIdsRef.current = data.selectedIds;
    } else {
      draggedIdsRef.current = [active.id as string];
    }
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { activatorEvent, delta, over } = event;
    if (activatorEvent instanceof PointerEvent) {
      pointerPositionRef.current = {
        x: activatorEvent.clientX + delta.x,
        y: activatorEvent.clientY + delta.y,
      };
    }

    // Calculate drop position based on pointer position
    if (over && over.rect && pointerPositionRef.current) {
      const overData = over.data.current as AppDragData | undefined;
      
      // Use X for horizontal layouts (grids), Y for vertical layouts (lists)
      const isHorizontalLayout = 
        overData?.type === "mediaItem" || 
        overData?.type === "slide" ||
        overData?.type === "slideGridEndZone" ||
        overData?.type === "mediaEndZone";
      
      if (isHorizontalLayout) {
        const midpoint = over.rect.left + over.rect.width / 2;
        setDropPosition(pointerPositionRef.current.x < midpoint ? "before" : "after");
      } else {
        const midpoint = over.rect.top + over.rect.height / 2;
        setDropPosition(pointerPositionRef.current.y < midpoint ? "before" : "after");
      }
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;

    if (over) {
      const overDataCurrent = over.data.current as AppDragData | undefined;

      // Don't set as over target if it's one of the dragged items
      if (draggedIdsRef.current.includes(over.id as string)) {
        setOverId(null);
        setOverData(null);
        setDropPosition(null);
        return;
      }

      setOverId(over.id);
      setOverData(overDataCurrent ?? null);
    } else {
      setOverId(null);
      setOverData(null);
      setDropPosition(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeDataCurrent = active.data.current as AppDragData | undefined;
    const overDataCurrent = over?.data.current as AppDragData | undefined;

    const currentDraggedIds = [...draggedIdsRef.current];
    const currentPosition = dropPosition;

    // Reset state
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setOverData(null);
    setDropPosition(null);
    draggedIdsRef.current = [];
    pointerPositionRef.current = null;

    if (!over || !activeDataCurrent) return;
    if (active.id === over.id) return;
    if (currentDraggedIds.includes(over.id as string)) return;

    const activeType = activeDataCurrent.type;

    // ===== MEDIA ITEM DROPS =====
    if (activeType === "mediaItem") {
      handleMediaItemDrop(
        activeDataCurrent,
        overDataCurrent,
        currentDraggedIds,
        currentPosition,
        over.id as string
      );
      return;
    }

    // ===== SLIDE DROPS (within show view) =====
    if (activeType === "slide") {
      handleSlideDrop(
        activeDataCurrent,
        overDataCurrent,
        currentDraggedIds,
        currentPosition,
        over.id as string
      );
      return;
    }

    // ===== SIDEBAR DROPS =====
    if (
      activeType === "library" ||
      activeType === "playlist" ||
      activeType === "libraryItem" ||
      activeType === "playlistItem"
    ) {
      handleSidebarDrop(
        activeDataCurrent,
        overDataCurrent,
        currentDraggedIds,
        currentPosition,
        active.id as string,
        over.id as string
      );
      return;
    }
  }, [dropPosition, playlists, selectedMediaPlaylist, selectedMediaPlaylistId, libraries]);

  // ===== DROP HANDLERS =====

  const handleMediaItemDrop = (
    _activeData: AppDragData,
    overData: AppDragData | undefined,
    draggedIds: string[],
    position: "before" | "after" | null,
    overId: string
  ) => {
    if (!overData) return;
    
    const overType = overData.type;

    // Get media items being dragged
    const mediaItems = selectedMediaPlaylist?.mediaItems.filter((item) =>
      draggedIds.includes(item.id)
    ) ?? [];

    if (mediaItems.length === 0) return;

    // DROP ON SLIDE GRID (add slides to existing playlist item)
    if (
      (overType === "slide" || overType === "slideGridEndZone") &&
      overData.playlistId &&
      overData.playlistItemId
    ) {
      // Convert media items to slides and add to the target playlist item
      const slides: SlideData[] = mediaItems.map((item) => {
        const slideData = mediaItemToSlideData(item);
        // Generate unique slide ID
        const shortId = crypto.randomUUID().split("-")[0];
        return {
          ...slideData,
          id: `${overData.playlistId}-${shortId}`,
        };
      });

      // Get insert index based on drop position
      const playlist = playlists.find((pl) => pl.id === overData.playlistId);
      const playlistItem = playlist?.items.find(
        (i) => i.id === overData.playlistItemId
      );

      if (!playlistItem) return;

      let insertIndex: number | undefined;
      if (overType === "slide") {
        const overSlideIndex = playlistItem.slideGroup.slides.findIndex(
          (s) => s.id === overId
        );
        if (overSlideIndex !== -1) {
          insertIndex = position === "after" ? overSlideIndex + 1 : overSlideIndex;
        }
      }
      // For slideGridEndZone, insertIndex stays undefined (append to end)

      addSlidesToPlaylistItem(
        overData.playlistId,
        overData.playlistItemId,
        slides,
        insertIndex
      );
      return;
    }

    // DROP ON PLAYLIST ITEMS PANEL (create new slide groups)
    if (
      (overType === "playlistItem" || overType === "endZone") &&
      overData.sourceId
    ) {
      const targetPlaylistId = overData.sourceId;

      // Each media item becomes its own playlist item/slide group
      mediaItems.forEach((mediaItem) => {
        addMediaItemToPlaylist(targetPlaylistId, mediaItem);
      });

      return;
    }

    // DROP ON PLAYLIST (in sidebar library panel) - create new slide groups
    if (overType === "playlist") {
      const targetPlaylistId = overId;
      
      mediaItems.forEach((mediaItem) => {
        addMediaItemToPlaylist(targetPlaylistId, mediaItem);
      });
      return;
    }

    // REORDER WITHIN MEDIA LIBRARY
    if (overType === "mediaItem" || overType === "mediaEndZone") {
      handleMediaLibraryReorder(draggedIds, position, overId, overData);
      return;
    }
  };

  const handleMediaLibraryReorder = (
    draggedIds: string[],
    position: "before" | "after" | null,
    overId: string,
    overData: AppDragData
  ) => {
    if (!selectedMediaPlaylistId || !selectedMediaPlaylist) return;

    const mediaItems = selectedMediaPlaylist.mediaItems;

    // Handle end zone drops
    if (overData.type === "mediaEndZone") {
      const itemsToMove = mediaItems.filter((item) =>
        draggedIds.includes(item.id)
      );
      const remainingItems = mediaItems.filter(
        (item) => !draggedIds.includes(item.id)
      );
      const newItems = [...remainingItems, ...itemsToMove];
      reorderMediaItemsInPlaylist(selectedMediaPlaylistId, newItems);
      return;
    }

    const overIndex = mediaItems.findIndex((item) => item.id === overId);
    if (overIndex === -1) return;

    if (draggedIds.length > 1) {
      // Multi-select reorder
      const itemsToMove = mediaItems.filter((item) =>
        draggedIds.includes(item.id)
      );
      const remainingItems = mediaItems.filter(
        (item) => !draggedIds.includes(item.id)
      );
      const overItemInRemaining = remainingItems.findIndex(
        (item) => item.id === overId
      );

      if (overItemInRemaining !== -1) {
        const insertIndex =
          position === "after" ? overItemInRemaining + 1 : overItemInRemaining;

        const newItems = [
          ...remainingItems.slice(0, insertIndex),
          ...itemsToMove,
          ...remainingItems.slice(insertIndex),
        ];

        reorderMediaItemsInPlaylist(selectedMediaPlaylistId, newItems);
      }
    } else {
      // Single item reorder
      const activeIndex = mediaItems.findIndex(
        (item) => item.id === draggedIds[0]
      );
      if (activeIndex === -1) return;

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

      const newItems = arrayMove(mediaItems, activeIndex, targetIndex);
      reorderMediaItemsInPlaylist(selectedMediaPlaylistId, newItems);
    }
  };

  const handleSlideDrop = (
    activeData: AppDragData,
    overData: AppDragData | undefined,
    draggedIds: string[],
    position: "before" | "after" | null,
    overId: string
  ) => {
    if (!overData) return;

    const sourcePlaylistId = activeData.playlistId;
    const sourceItemId = activeData.playlistItemId;
    const overType = overData.type;
    const targetItemId = overData.playlistItemId;

    if (!sourcePlaylistId || !sourceItemId) return;

    // Handle END ZONE drops
    if (overType === "slideGridEndZone" && targetItemId) {
      if (sourceItemId === targetItemId) {
        // Same slide group = reorder to end
        const playlist = playlists.find((pl) => pl.id === sourcePlaylistId);
        if (!playlist) return;

        const item = playlist.items.find((i) => i.id === sourceItemId);
        if (!item) return;

        const slides = item.slideGroup.slides;
        const slidesToMove = slides.filter((s) => draggedIds.includes(s.id));
        const remainingSlides = slides.filter(
          (s) => !draggedIds.includes(s.id)
        );

        const newSlides = [...remainingSlides, ...slidesToMove];
        reorderSlidesInPlaylistItem(sourcePlaylistId, sourceItemId, newSlides);
      } else {
        // Different slide group = move to end of target
        moveSlidesToPlaylistItem(
          sourcePlaylistId,
          sourceItemId,
          targetItemId,
          draggedIds,
          undefined // append to end
        );
      }
      return;
    }

    // Same playlist item = reorder
    if (sourceItemId === targetItemId && overType === "slide") {
      const playlist = playlists.find((pl) => pl.id === sourcePlaylistId);
      if (!playlist) return;

      const item = playlist.items.find((i) => i.id === sourceItemId);
      if (!item) return;

      const slides = item.slideGroup.slides;

      if (draggedIds.length > 1) {
        // Multi-select reorder
        const slidesToMove = slides.filter((s) => draggedIds.includes(s.id));
        const remainingSlides = slides.filter(
          (s) => !draggedIds.includes(s.id)
        );
        const targetIndex = remainingSlides.findIndex((s) => s.id === overId);

        if (targetIndex === -1) return;

        const insertIndex =
          position === "after" ? targetIndex + 1 : targetIndex;

        const newSlides = [
          ...remainingSlides.slice(0, insertIndex),
          ...slidesToMove,
          ...remainingSlides.slice(insertIndex),
        ];

        reorderSlidesInPlaylistItem(sourcePlaylistId, sourceItemId, newSlides);
      } else {
        // Single item reorder
        const activeIndex = slides.findIndex((s) => s.id === draggedIds[0]);
        const overIndex = slides.findIndex((s) => s.id === overId);

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

          const newSlides = arrayMove(slides, activeIndex, targetIndex);
          reorderSlidesInPlaylistItem(
            sourcePlaylistId,
            sourceItemId,
            newSlides
          );
        }
      }
    } else if (targetItemId && overType === "slide") {
      // Different playlist item = move
      const playlist = playlists.find((pl) => pl.id === sourcePlaylistId);
      if (!playlist) return;

      const targetItem = playlist.items.find((i) => i.id === targetItemId);
      if (!targetItem) return;

      const overIndex = targetItem.slideGroup.slides.findIndex(
        (s) => s.id === overId
      );

      const insertAtIndex =
        position === "after" ? overIndex + 1 : overIndex;

      moveSlidesToPlaylistItem(
        sourcePlaylistId,
        sourceItemId,
        targetItemId,
        draggedIds,
        insertAtIndex
      );
    }
  };

  const handleSidebarDrop = (
    activeData: AppDragData,
    overData: AppDragData | undefined,
    draggedIds: string[],
    position: "before" | "after" | null,
    activeId: string,
    overId: string
  ) => {
    if (!overData) return;

    const activeType = activeData.type;
    const overType = overData.type;
    const activeSourceId = activeData.sourceId;
    const overSourceId = overData.sourceId;

    // Handle END ZONE drops
    if (overType === "endZone") {
      const zoneType = overData.zoneType;
      if (activeType === zoneType) {
        if (activeType === "library") {
          handleLibraryMoveToEnd(draggedIds);
        } else if (activeType === "playlist") {
          handlePlaylistMoveToEnd(draggedIds);
        } else if (activeType === "libraryItem" && activeSourceId === overSourceId) {
          handleLibraryItemMoveToEnd(activeSourceId!, draggedIds);
        } else if (activeType === "playlistItem" && activeSourceId === overSourceId) {
          handlePlaylistItemMoveToEnd(activeSourceId!, draggedIds);
        }
      }
      clearSidebarSelection("libraryItem");
      clearSidebarSelection("playlistItem");
      return;
    }

    // Library reordering
    if (activeType === "library" && overType === "library") {
      handleLibraryReorder(activeId, overId, draggedIds, position);
    }
    // Playlist reordering
    else if (activeType === "playlist" && overType === "playlist") {
      handlePlaylistReorder(activeId, overId, draggedIds, position);
    }
    // Library item operations
    else if (activeType === "libraryItem") {
      if (overType === "libraryItem") {
        if (activeSourceId === overSourceId) {
          handleLibraryItemReorder(
            activeSourceId!,
            activeId,
            overId,
            draggedIds,
            position
          );
        } else {
          handleMoveToLibrary(activeSourceId!, overSourceId!, draggedIds);
        }
      } else if (overType === "library") {
        if (activeSourceId !== overId) {
          handleMoveToLibrary(activeSourceId!, overId, draggedIds);
        }
      } else if (overType === "playlist") {
        handleCopyToPlaylist(activeSourceId!, overId, draggedIds);
      } else if (overType === "playlistItem") {
        handleCopyToPlaylist(activeSourceId!, overSourceId!, draggedIds);
      }
    }
    // Playlist item operations
    else if (activeType === "playlistItem") {
      if (overType === "playlistItem") {
        if (activeSourceId === overSourceId) {
          handlePlaylistItemReorder(
            activeSourceId!,
            activeId,
            overId,
            draggedIds,
            position
          );
        } else {
          handleMoveToPlaylist(activeSourceId!, overSourceId!, draggedIds);
        }
      } else if (overType === "playlist") {
        if (activeSourceId !== overId) {
          handleMoveToPlaylist(activeSourceId!, overId, draggedIds);
        }
      }
    }

    clearSidebarSelection("libraryItem");
    clearSidebarSelection("playlistItem");
  };

  // ===== SIDEBAR HELPER FUNCTIONS =====

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
      const itemsToMove = sortedLibraries.filter((lib) =>
        draggedIds.includes(lib.id)
      );
      const remainingItems = sortedLibraries.filter(
        (lib) => !draggedIds.includes(lib.id)
      );
      const targetIndex = remainingItems.findIndex((lib) => lib.id === overId);
      if (targetIndex === -1) return;

      const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
      const newItems = [
        ...remainingItems.slice(0, insertIndex),
        ...itemsToMove,
        ...remainingItems.slice(insertIndex),
      ].map((item, index) => ({ ...item, order: index }));

      reorderLibraries(newItems);
    } else {
      const activeIndex = sortedLibraries.findIndex((lib) => lib.id === activeId);
      const overIndex = sortedLibraries.findIndex((lib) => lib.id === overId);

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

        const newItems = arrayMove(sortedLibraries, activeIndex, targetIndex).map(
          (item, index) => ({ ...item, order: index })
        );
        reorderLibraries(newItems);
      }
    }
  };

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

        const newItems = arrayMove(sortedPlaylists, activeIndex, targetIndex).map(
          (item, index) => ({ ...item, order: index })
        );
        reorderPlaylists(newItems);
      }
    }
  };

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
      const targetIndex = remainingItems.findIndex((item) => item.id === overId);
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

  const handleLibraryItemMoveToEnd = (libraryId: string, draggedIds: string[]) => {
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

  const handlePlaylistItemMoveToEnd = (playlistId: string, draggedIds: string[]) => {
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

  const handleMoveToLibrary = (
    sourceLibraryId: string,
    targetLibraryId: string,
    slideGroupIds: string[]
  ) => {
    const sourceLibrary = libraries.find((lib) => lib.id === sourceLibraryId);
    const targetLibrary = libraries.find((lib) => lib.id === targetLibraryId);
    if (!sourceLibrary || !targetLibrary) return;

    const slideGroupsToMove = sourceLibrary.slideGroups.filter((sg) =>
      slideGroupIds.includes(sg.id)
    );

    const newSlideGroups = slideGroupsToMove.map((sg) => ({
      ...sg,
      id: crypto.randomUUID(),
      meta: { ...sg.meta, libraryId: targetLibraryId },
    }));

    updateLibrary(targetLibraryId, {
      slideGroups: [...targetLibrary.slideGroups, ...newSlideGroups],
    });

    const remainingSlideGroups = sourceLibrary.slideGroups.filter(
      (sg) => !slideGroupIds.includes(sg.id)
    );
    updateLibrary(sourceLibraryId, { slideGroups: remainingSlideGroups });
  };

  const handleCopyToPlaylist = (
    sourceLibraryId: string,
    targetPlaylistId: string,
    slideGroupIds: string[]
  ) => {
    slideGroupIds.forEach((sgId) => {
      addSlideGroupToPlaylist(targetPlaylistId, sourceLibraryId, sgId);
    });
  };

  const handleMoveToPlaylist = (
    sourcePlaylistId: string,
    targetPlaylistId: string,
    itemIds: string[]
  ) => {
    const sourcePlaylist = playlists.find((pl) => pl.id === sourcePlaylistId);
    const targetPlaylist = playlists.find((pl) => pl.id === targetPlaylistId);
    if (!sourcePlaylist || !targetPlaylist) return;

    const itemsToMove = sourcePlaylist.items.filter((item) =>
      itemIds.includes(item.id)
    );

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

    updatePlaylist(targetPlaylistId, {
      items: [...targetPlaylist.items, ...newItems],
    });

    const remainingItems = sourcePlaylist.items.filter(
      (item) => !itemIds.includes(item.id)
    );
    updatePlaylist(sourcePlaylistId, { items: remainingItems });
  };

  // ===== DRAG OVERLAY =====

  const renderDragOverlay = () => {
    if (!activeId || !activeData) return null;

    const count = draggedIdsRef.current.length;
    const isMulti = count > 1;

    // Media item overlay
    if (activeData.type === "mediaItem" && activeData.mediaItem) {
      const slidePreview = (
        <div className="w-[200px]">
          <Slide
            id={activeData.mediaItem.id}
            data={mediaItemToSlideData(activeData.mediaItem)}
          />
        </div>
      );

      return isMulti ? (
        <MultiSlideDragOverlay count={count}>{slidePreview}</MultiSlideDragOverlay>
      ) : (
        <SlideDragOverlay>{slidePreview}</SlideDragOverlay>
      );
    }

    // Slide overlay
    if (activeData.type === "slide" && activeData.slide && activeData.canvasSize) {
      const slidePreview = (
        <Slide
          id={activeData.slide.id}
          data={activeData.slide}
          canvasSize={activeData.canvasSize}
        />
      );

      return isMulti ? (
        <MultiSlideDragOverlay count={count}>{slidePreview}</MultiSlideDragOverlay>
      ) : (
        <SlideDragOverlay>{slidePreview}</SlideDragOverlay>
      );
    }

    // Sidebar item overlays
    if (
      activeData.type === "library" ||
      activeData.type === "playlist" ||
      activeData.type === "libraryItem" ||
      activeData.type === "playlistItem"
    ) {
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
    }

    return null;
  };

  const contextValue: AppDndContextValue = {
    activeId,
    activeData,
    overId,
    overData,
    dropPosition,
    isDragging: activeId !== null,
    draggedIds: draggedIdsRef.current,
  };

  return (
    <AppDndContext value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        autoScroll={false}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>,
          document.body
        )}
      </DndContext>
    </AppDndContext>
  );
};

