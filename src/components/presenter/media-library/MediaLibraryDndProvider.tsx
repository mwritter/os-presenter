import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { createContext, useContext } from "react";
import {
  MediaItem,
  selectSelectedPlaylist,
  useMediaLibraryStore,
} from "@/stores/presenter/mediaLibraryStore";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";

export type MediaLibraryDragType = "mediaItem" | "mediaEndZone";

export interface MediaLibraryDragData {
  type: MediaLibraryDragType;
  playlistId: string;
  mediaItem?: MediaItem;
  selectedIds?: string[];
}

interface MediaLibraryDndContextValue {
  activeId: string | null;
  activeData: MediaLibraryDragData | null;
  overId: string | null;
  overData: MediaLibraryDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
}

const MediaLibraryDndContext =
  createContext<MediaLibraryDndContextValue | null>(null);

export const useMediaLibraryDnd = () => {
  const context = useContext(MediaLibraryDndContext);
  if (!context) {
    throw new Error(
      "useMediaLibraryDnd must be used within a MediaLibraryDndProvider"
    );
  }
  return context;
};

interface MediaLibraryDndProviderProps {
  children: React.ReactNode;
}

/**
 * Adapter that converts AppDragData to MediaLibraryDragData for backwards compatibility
 */
const convertToMediaLibraryData = (
  appData: AppDragData | null
): MediaLibraryDragData | null => {
  if (!appData) return null;
  if (appData.type !== "mediaItem" && appData.type !== "mediaEndZone") {
    return null;
  }

  return {
    type: appData.type as MediaLibraryDragType,
    playlistId: appData.mediaPlaylistId ?? appData.sourceId ?? "",
    mediaItem: appData.mediaItem,
    selectedIds: appData.selectedIds,
  };
};

export const MediaLibraryDndProvider = ({
  children,
}: MediaLibraryDndProviderProps) => {
  const selectedPlaylist = useMediaLibraryStore(selectSelectedPlaylist);
  const { activeId, activeData, overId, overData, dropPosition, isDragging } =
    useAppDnd();

  // Get media item IDs for sortable context
  const mediaItemIds = selectedPlaylist?.mediaItems.map((item) => item.id) ?? [];

  // Convert app-level data to media library specific data
  const contextValue: MediaLibraryDndContextValue = {
    activeId: activeId as string | null,
    activeData: convertToMediaLibraryData(activeData),
    overId: overId as string | null,
    overData: convertToMediaLibraryData(overData),
    dropPosition,
    isDragging,
  };

  return (
    <MediaLibraryDndContext value={contextValue}>
      <SortableContext
        items={mediaItemIds}
        strategy={rectSortingStrategy}
      >
        {children}
      </SortableContext>
    </MediaLibraryDndContext>
  );
};
