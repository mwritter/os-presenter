import { useEffect, useRef, useState } from "react";
import { PlaylistItem } from "./PlaylistItem";
import { LibraryItem } from "./LibraryItem";
import {
  useLibraryStore,
  usePlaylistStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresenterContext } from "@/context/presenter";
import { useLibraryPanelContextMenu } from "./hooks/use-library-panel-context-menu";
import { Library, Playlist } from "@/components/presenter/types";
import { cn } from "@/lib/utils";
import { createDragGhost, createMultiItemDragGhost } from "@/lib/drag-utils";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";

export const LibraryPanel = () => {
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);
  const reorderLibraries = useLibraryStore((s) => s.reorderLibraries);
  const reorderPlaylists = usePlaylistStore((s) => s.reorderPlaylists);
  const removeLibrary = useLibraryStore((s) => s.removeLibrary);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );

  // Sort by order
  const sortedLibraries = [...libraries].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sortedPlaylists = [...playlists].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleDeleteLibraries = (ids: string[]) => {
    ids.forEach((id) => removeLibrary(id));
    clearSidebarSelection("library");
  };

  const handleDeletePlaylists = (ids: string[]) => {
    ids.forEach((id) => removePlaylist(id));
    clearSidebarSelection("playlist");
  };

  const handleReorderLibraries = (
    draggedIds: string[],
    targetId: string,
    position: "before" | "after"
  ) => {
    // Don't drop on self
    if (draggedIds.includes(targetId)) return;

    const targetIndex = sortedLibraries.findIndex((lib) => lib.id === targetId);
    if (targetIndex === -1) return;

    // Remove dragged items, keeping their relative order
    const draggedItems = sortedLibraries.filter((lib) =>
      draggedIds.includes(lib.id)
    );
    const remainingItems = sortedLibraries.filter(
      (lib) => !draggedIds.includes(lib.id)
    );

    // Find insert position in the remaining items
    const targetInRemaining = remainingItems.findIndex(
      (lib) => lib.id === targetId
    );
    const insertIndex =
      position === "after" ? targetInRemaining + 1 : targetInRemaining;

    // Insert dragged items at the position
    const newItems = [
      ...remainingItems.slice(0, insertIndex),
      ...draggedItems,
      ...remainingItems.slice(insertIndex),
    ];

    const reordered = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));
    reorderLibraries(reordered);
  };

  const handleReorderPlaylists = (
    draggedIds: string[],
    targetId: string,
    position: "before" | "after"
  ) => {
    // Don't drop on self
    if (draggedIds.includes(targetId)) return;

    const targetIndex = sortedPlaylists.findIndex((pl) => pl.id === targetId);
    if (targetIndex === -1) return;

    // Remove dragged items, keeping their relative order
    const draggedItems = sortedPlaylists.filter((pl) =>
      draggedIds.includes(pl.id)
    );
    const remainingItems = sortedPlaylists.filter(
      (pl) => !draggedIds.includes(pl.id)
    );

    // Find insert position in the remaining items
    const targetInRemaining = remainingItems.findIndex(
      (pl) => pl.id === targetId
    );
    const insertIndex =
      position === "after" ? targetInRemaining + 1 : targetInRemaining;

    // Insert dragged items at the position
    const newItems = [
      ...remainingItems.slice(0, insertIndex),
      ...draggedItems,
      ...remainingItems.slice(insertIndex),
    ];

    const reordered = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));
    reorderPlaylists(reordered);
  };

  return (
    <div className="flex flex-col gap-1 overflow-y-auto h-full">
      <div>
        <LibraryPanelHeader title="Library" withMenu />
        <DraggableLibraryList
          libraries={sortedLibraries}
          onReorder={handleReorderLibraries}
          onDeleteMultiple={handleDeleteLibraries}
        />
      </div>
      <div>
        <LibraryPanelHeader title="Playlist" />
        <DraggablePlaylistList
          playlists={sortedPlaylists}
          onReorder={handleReorderPlaylists}
          onDeleteMultiple={handleDeletePlaylists}
        />
      </div>
    </div>
  );
};

const DraggableLibraryList = ({
  libraries,
  onReorder,
  onDeleteMultiple,
}: {
  libraries: Library[];
  onReorder: (
    draggedIds: string[],
    targetId: string,
    position: "before" | "after"
  ) => void;
  onDeleteMultiple: (ids: string[]) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  const { selectedIds, isMultiSelectMode, handleItemClick, isSelected } =
    useSidebarMultiSelect({
      type: "library",
      items: libraries,
      containerRef,
    });

  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedId(null);
      setDropTarget(null);
    };
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    library: Library
  ) => {
    setDraggedId(library.id);

    // If this library is part of a multi-selection, drag all selected
    if (isSelected(library.id) && selectedIds.length > 1) {
      createMultiItemDragGhost(e, e.currentTarget, selectedIds.length);
      e.dataTransfer.setData("type", "library");
      e.dataTransfer.setData("libraryIds", JSON.stringify(selectedIds));
    } else {
      createDragGhost(e, e.currentTarget);
      e.dataTransfer.setData("type", "library");
      e.dataTransfer.setData("libraryId", library.id);
    }
  };

  const handleDelete = (id: string) => {
    // If this item is part of a multi-selection, delete all selected
    if (isSelected(id) && selectedIds.length > 1) {
      onDeleteMultiple(selectedIds);
    } else {
      onDeleteMultiple([id]);
    }
  };

  return (
    <div ref={containerRef}>
      {libraries.map((library) => {
        const isItemSelected = isSelected(library.id);
        const isDragging =
          draggedId === library.id ||
          (draggedId && isItemSelected && selectedIds.includes(draggedId));

        return (
          <div
            key={library.id}
            className={cn("relative", { "opacity-50": isDragging })}
            draggable
            onDragStart={(e) => handleDragStart(e, library)}
            onDragOver={(e) => {
              e.preventDefault();
              if (!draggedId || draggedId === library.id) {
                setDropTarget(null);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              const position =
                e.clientY < rect.top + rect.height / 2 ? "before" : "after";
              setDropTarget({ id: library.id, position });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Check for multiple IDs first, fallback to single
              const libraryIdsJson = e.dataTransfer.getData("libraryIds");
              const singleLibraryId = e.dataTransfer.getData("libraryId");
              const droppedIds = libraryIdsJson
                ? JSON.parse(libraryIdsJson)
                : singleLibraryId
                  ? [singleLibraryId]
                  : [];

              if (droppedIds.length > 0 && dropTarget) {
                onReorder(droppedIds, library.id, dropTarget.position);
              }
              setDropTarget(null);
              setDraggedId(null);
            }}
          >
            {dropTarget?.id === library.id &&
              dropTarget.position === "before" && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
              )}
            <LibraryItem
              id={library.id}
              name={library.name}
              isMultiSelected={isItemSelected && isMultiSelectMode}
              onClick={(e) => handleItemClick(library.id, e)}
              onDelete={handleDelete}
              selectedCount={isItemSelected ? selectedIds.length : 0}
            />
            {dropTarget?.id === library.id &&
              dropTarget.position === "after" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
              )}
          </div>
        );
      })}
    </div>
  );
};

const DraggablePlaylistList = ({
  playlists,
  onReorder,
  onDeleteMultiple,
}: {
  playlists: Playlist[];
  onReorder: (
    draggedIds: string[],
    targetId: string,
    position: "before" | "after"
  ) => void;
  onDeleteMultiple: (ids: string[]) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: "before" | "after";
  } | null>(null);

  const { selectedIds, isMultiSelectMode, handleItemClick, isSelected } =
    useSidebarMultiSelect({
      type: "playlist",
      items: playlists,
      containerRef,
    });

  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedId(null);
      setDropTarget(null);
    };
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    playlist: Playlist
  ) => {
    setDraggedId(playlist.id);

    if (isSelected(playlist.id) && selectedIds.length > 1) {
      createMultiItemDragGhost(e, e.currentTarget, selectedIds.length);
      e.dataTransfer.setData("type", "playlist");
      e.dataTransfer.setData("playlistIds", JSON.stringify(selectedIds));
    } else {
      createDragGhost(e, e.currentTarget);
      e.dataTransfer.setData("type", "playlist");
      e.dataTransfer.setData("playlistId", playlist.id);
    }
  };

  const handleDelete = (id: string) => {
    if (isSelected(id) && selectedIds.length > 1) {
      onDeleteMultiple(selectedIds);
    } else {
      onDeleteMultiple([id]);
    }
  };

  return (
    <div ref={containerRef}>
      {playlists.map((playlist) => {
        const isItemSelected = isSelected(playlist.id);
        const isDragging =
          draggedId === playlist.id ||
          (draggedId && isItemSelected && selectedIds.includes(draggedId));

        return (
          <div
            key={playlist.id}
            className={cn("relative", { "opacity-50": isDragging })}
            draggable
            onDragStart={(e) => handleDragStart(e, playlist)}
            onDragOver={(e) => {
              e.preventDefault();
              if (!draggedId || draggedId === playlist.id) {
                setDropTarget(null);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              const position =
                e.clientY < rect.top + rect.height / 2 ? "before" : "after";
              setDropTarget({ id: playlist.id, position });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Check for multiple IDs first, fallback to single
              const playlistIdsJson = e.dataTransfer.getData("playlistIds");
              const singlePlaylistId = e.dataTransfer.getData("playlistId");
              const droppedIds = playlistIdsJson
                ? JSON.parse(playlistIdsJson)
                : singlePlaylistId
                  ? [singlePlaylistId]
                  : [];

              if (droppedIds.length > 0 && dropTarget) {
                onReorder(droppedIds, playlist.id, dropTarget.position);
              }
              setDropTarget(null);
              setDraggedId(null);
            }}
          >
            {dropTarget?.id === playlist.id &&
              dropTarget.position === "before" && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-px z-10" />
              )}
            <PlaylistItem
              id={playlist.id}
              name={playlist.name}
              isMultiSelected={isItemSelected && isMultiSelectMode}
              onClick={(e) => handleItemClick(playlist.id, e)}
              onDelete={handleDelete}
              selectedCount={isItemSelected ? selectedIds.length : 0}
            />
            {dropTarget?.id === playlist.id &&
              dropTarget.position === "after" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-px z-10" />
              )}
          </div>
        );
      })}
    </div>
  );
};

const LibraryPanelHeader = ({
  title,
  withMenu = false,
}: {
  title: string;
  withMenu?: boolean;
}) => {
  const { openAddPresentationDialog } = usePresenterContext();
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);
  const addLibrary = useLibraryStore((s) => s.addLibrary);
  const addPlaylist = usePlaylistStore((s) => s.addPlaylist);

  const handleNewLibrary = () => {
    console.log("handle New Library");
    const now = new Date().toISOString();
    const newLibrary = {
      id: crypto.randomUUID(),
      name: `Library ${libraries.length + 1}`,
      slideGroups: [],
      order: libraries.length,
      createdAt: now,
      updatedAt: now,
    };
    addLibrary(newLibrary);
  };

  const handleNewPlaylist = () => {
    const now = new Date().toISOString();
    const newPlaylist = {
      id: crypto.randomUUID(),
      name: `Playlist ${playlists.length + 1}`,
      items: [],
      order: playlists.length,
      createdAt: now,
      updatedAt: now,
    };
    addPlaylist(newPlaylist);
  };

  const handleNewPresentation = () => {
    openAddPresentationDialog();
  };

  const { openContextMenu } = useLibraryPanelContextMenu({
    onNewLibrary: handleNewLibrary,
    onNewPlaylist: handleNewPlaylist,
    onNewPresentation: handleNewPresentation,
  });

  return (
    <div className="p-2 flex items-center justify-between">
      <p className="text-gray-400 font-bold text-xs uppercase">{title}</p>
      {withMenu && (
        <Button
          className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
          variant="ghost"
          size="icon-xs"
          onClick={(e) => openContextMenu(e)}
        >
          <Plus className="size-3" />
        </Button>
      )}
    </div>
  );
};
