import { useRef } from "react";
import {
  selectSelectedPlaylist,
  selectSelectedPlaylistId,
  useMediaLibraryStore,
} from "@/stores/presenter/mediaLibraryStore";
import { MediaLibraryItem } from "./MediaLibraryItem";
import { MediaLibraryEmpty } from "./MediaLibraryEmpty";
import { MediaLibraryEndZone } from "./MediaLibraryEndZone";
import {
  MediaLibraryDndProvider,
  useMediaLibraryDnd,
} from "./MediaLibraryDndProvider";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useMediaMultiSelect } from "./hooks/use-media-multi-select";
import { useMediaLassoSelect } from "./hooks/use-media-lasso-select";

export const MediaLibraryContent = () => {
  return (
    <MediaLibraryDndProvider>
      <MediaLibraryContentInner />
    </MediaLibraryDndProvider>
  );
};

const MediaLibraryContentInner = () => {
  const selectedPlaylist = useMediaLibraryStore(selectSelectedPlaylist);
  const selectedPlaylistId = useMediaLibraryStore(selectSelectedPlaylistId);
  const mediaItems = selectedPlaylist?.mediaItems ?? [];
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRefsMap = useRef<Map<string, HTMLElement>>(new Map());

  const { activeId, activeData, overId, dropPosition } = useMediaLibraryDnd();

  // Multi-select functionality
  const {
    selectedMediaIds,
    isMultiSelectMode,
    handleMediaClick,
    isMediaSelected,
    selectMultiple,
    clearSelection,
  } = useMediaMultiSelect({ mediaItems, containerRef });

  // Lasso/marquee selection - connected to multi-select
  const { isSelecting, lassoStyle } = useMediaLassoSelect({
    containerRef,
    mediaRefs: mediaRefsMap.current,
    enabled: true,
    onSelectionChange: (ids) => {
      if (ids.length > 0) {
        selectMultiple(ids);
      }
    },
    onClearSelection: clearSelection,
  });

  const isDragging = (id: string) => {
    if (!activeId) return false;
    if (activeData?.selectedIds) {
      return activeData.selectedIds.includes(id);
    }
    return activeId === id;
  };

  const getDropPosition = (id: string) => {
    if (overId === id && !isDragging(id)) {
      return dropPosition;
    }
    return null;
  };

  // Callback to register media item refs for lasso selection
  const registerMediaRef = (mediaId: string, element: HTMLElement | null) => {
    if (element) {
      mediaRefsMap.current.set(mediaId, element);
    } else {
      mediaRefsMap.current.delete(mediaId);
    }
  };

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-wrap gap-4 p-5">
        <MediaLibraryEmpty />
      </div>
    );
  }

  return (
    <SortableContext
      items={mediaItems.map((item) => item.id)}
      strategy={rectSortingStrategy}
    >
      <div
        ref={containerRef}
        className="grid grid-cols-4 gap-4 p-5 select-none relative h-min"
      >
        {mediaItems.map((mediaItem, index) => {
          const isSelected = isMediaSelected(mediaItem.id);
          const mediaIsDragging = isDragging(mediaItem.id);

          return (
            <MediaLibraryItem
              key={mediaItem.id}
              index={index}
              mediaItem={mediaItem}
              playlistId={selectedPlaylistId ?? ""}
              isDragging={mediaIsDragging}
              dropPosition={getDropPosition(mediaItem.id)}
              isSelected={isSelected}
              isMultiSelectMode={isMultiSelectMode}
              selectedIds={selectedMediaIds}
              onClick={(e) => handleMediaClick(mediaItem.id, e)}
              registerRef={registerMediaRef}
            />
          );
        })}

        {/* End drop zone for reordering to end of list */}
        {selectedPlaylistId && (
          <MediaLibraryEndZone playlistId={selectedPlaylistId} />
        )}

        {/* Lasso selection overlay */}
        {isSelecting && lassoStyle && (
          <div
            className="absolute border-2 border-selected bg-selected/20 pointer-events-none z-50"
            style={{
              left: lassoStyle.left,
              top: lassoStyle.top,
              width: lassoStyle.width,
              height: lassoStyle.height,
            }}
          />
        )}
      </div>
    </SortableContext>
  );
};
