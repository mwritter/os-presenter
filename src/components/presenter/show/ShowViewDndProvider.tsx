import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { createContext, useContext } from "react";
import { usePlaylistStore } from "@/stores/presenterStore";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";

export type ShowViewDragType = "slide" | "slideGridEndZone";

export interface ShowViewDragData {
  type: ShowViewDragType;
  playlistId: string;
  playlistItemId: string;
  slide?: SlideData;
  canvasSize?: CanvasSize;
  selectedIds?: string[];
}

interface ShowViewDndContextValue {
  activeId: string | null;
  activeData: ShowViewDragData | null;
  overId: string | null;
  overData: ShowViewDragData | null;
  dropPosition: "before" | "after" | null;
  isDragging: boolean;
}

const ShowViewDndContext = createContext<ShowViewDndContextValue | null>(null);

export const useShowViewDnd = () => {
  const context = useContext(ShowViewDndContext);
  if (!context) {
    throw new Error("useShowViewDnd must be used within a ShowViewDndProvider");
  }
  return context;
};

interface ShowViewDndProviderProps {
  playlistId: string;
  children: React.ReactNode;
}

/**
 * Adapter that converts AppDragData to ShowViewDragData for backwards compatibility
 */
const convertToShowViewData = (
  appData: AppDragData | null
): ShowViewDragData | null => {
  if (!appData) return null;
  if (appData.type !== "slide" && appData.type !== "slideGridEndZone") {
    return null;
  }

  return {
    type: appData.type as ShowViewDragType,
    playlistId: appData.playlistId ?? "",
    playlistItemId: appData.playlistItemId ?? "",
    slide: appData.slide,
    canvasSize: appData.canvasSize,
    selectedIds: appData.selectedIds,
  };
};

export const ShowViewDndProvider = ({
  playlistId,
  children,
}: ShowViewDndProviderProps) => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const { activeId, activeData, overId, overData, dropPosition, isDragging } =
    useAppDnd();

  // Get all slide IDs from this playlist for sortable context
  const playlist = playlists.find((pl) => pl.id === playlistId);
  const allSlideIds =
    playlist?.items.flatMap((item) =>
      item.slideGroup.slides.map((s) => s.id)
    ) ?? [];

  // Convert app-level data to show view specific data
  const contextValue: ShowViewDndContextValue = {
    activeId: activeId as string | null,
    activeData: convertToShowViewData(activeData),
    overId: overId as string | null,
    overData: convertToShowViewData(overData),
    dropPosition,
    isDragging,
  };

  return (
    <ShowViewDndContext value={contextValue}>
      <SortableContext items={allSlideIds} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </ShowViewDndContext>
  );
};
