import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createContext, useContext } from "react";
import {
  useLibraryStore,
  usePlaylistStore,
} from "@/stores/presenter/presenterStore";
import {
  Library,
  Playlist,
  SlideGroup,
  PlaylistItem,
} from "@/components/presenter/types";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";

// Drag data types
export type SidebarDragType =
  | "library"
  | "playlist"
  | "libraryItem"
  | "playlistItem"
  | "endZone";

export interface SidebarDragData {
  type: SidebarDragType;
  sourceId: string;
  item: Library | Playlist | SlideGroup | PlaylistItem;
  selectedIds?: string[];
  zoneType?: "library" | "playlist" | "libraryItem" | "playlistItem";
}

interface SidebarDndContextValue {
  activeId: string | null;
  activeData: SidebarDragData | null;
  overId: string | null;
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

/**
 * Adapter that converts AppDragData to SidebarDragData for backwards compatibility
 */
const convertToSidebarData = (
  appData: AppDragData | null
): SidebarDragData | null => {
  if (!appData) return null;
  
  const sidebarTypes: SidebarDragType[] = [
    "library",
    "playlist",
    "libraryItem",
    "playlistItem",
    "endZone",
  ];
  
  if (!sidebarTypes.includes(appData.type as SidebarDragType)) {
    return null;
  }

  return {
    type: appData.type as SidebarDragType,
    sourceId: appData.sourceId ?? "",
    item: appData.item as Library | Playlist | SlideGroup | PlaylistItem,
    selectedIds: appData.selectedIds,
    zoneType: appData.zoneType,
  };
};

export const SidebarDndProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const libraries = useLibraryStore((s) => s.libraries);
  const playlists = usePlaylistStore((s) => s.playlists);
  const { activeId, activeData, overId, overData, dropPosition, isDragging } =
    useAppDnd();

  // Collect all sortable IDs for the sidebar
  const libraryIds = libraries.map((lib) => lib.id);
  const playlistIds = playlists.map((pl) => pl.id);
  const libraryItemIds = libraries.flatMap((lib) =>
    lib.slideGroups.map((sg) => sg.id)
  );
  const playlistItemIds = playlists.flatMap((pl) =>
    pl.items.map((item) => item.id)
  );

  const allSidebarIds = [
    ...libraryIds,
    ...playlistIds,
    ...libraryItemIds,
    ...playlistItemIds,
  ];

  // Convert app-level data to sidebar specific data
  const contextValue: SidebarDndContextValue = {
    activeId: activeId as string | null,
    activeData: convertToSidebarData(activeData),
    overId: overId as string | null,
    overData: convertToSidebarData(overData),
    dropPosition,
    isDragging,
  };

  return (
    <SidebarDndContext value={contextValue}>
      <SortableContext
        items={allSidebarIds}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </SidebarDndContext>
  );
};
