import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  useSelectionStore,
  usePlaylistStore,
  useSidebarSelectionStore,
} from "@/stores/presenterStore";
import { useRef } from "react";
import { PlaylistIcon } from "../../../icons/PlaylistIcon";
import { useSidebarMultiSelect } from "@/hooks/use-sidebar-multi-select";
import { useAppDnd, AppDragData } from "@/components/dnd/AppDndProvider";
import { EndDropZone } from "../EndDropZone";
import { Playlist } from "@/components/presenter/types";
import { cn } from "@/lib/utils";
import { useRenameState } from "./hooks/use-rename-state";
import { useContextMenu } from "./hooks/use-context-menu";
import { SidebarItem } from "../common/SidebarItem";

export const LibraryPanelGroupPlaylists = () => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const selectedPlaylistId = useSelectionStore((s) => s.selectedPlaylistId);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const selectPlaylist = useSelectionStore((s) => s.selectPlaylist);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);
  const clearSidebarSelection = useSidebarSelectionStore(
    (s) => s.sidebarClearSelection
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { activeId, activeData, overId, dropPosition } = useAppDnd();

  const sortedPlaylists = [...playlists].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleDeletePlaylists = (ids: string[]) => {
    ids.forEach((id) => removePlaylist(id));
    clearSidebarSelection("playlist");
  };

  const { isSelected, isMultiSelectMode, handleItemClick, selectedIds } =
    useSidebarMultiSelect({
      type: "playlist",
      items: sortedPlaylists,
      containerRef,
      onSelect: selectPlaylist,
    });

  return (
    <SortableContext
      items={sortedPlaylists.map((pl) => pl.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={containerRef} className="flex flex-col flex-1 relative">
        <ul className="flex flex-col relative mt-2">
          {sortedPlaylists.map((playlist) => {
            const isDragging =
              activeId === playlist.id ||
              (activeData?.selectedIds?.includes(playlist.id) ?? false);

            // Get drop position when another playlist is dragged over this one
            const itemDropPosition =
              overId === playlist.id &&
              activeData?.type === "playlist" &&
              !isDragging
                ? dropPosition
                : null;

            // Show external drop highlight when library items, playlist items, or media items are dragged over
            const showExternalDropHighlight =
              overId === playlist.id &&
              (activeData?.type === "libraryItem" ||
                activeData?.type === "mediaItem" ||
                (activeData?.type === "playlistItem" &&
                  activeData?.sourceId !== playlist.id));

            return (
              <SortablePlaylistItem
                key={playlist.id}
                playlist={playlist}
                isSelected={selectedPlaylistId === playlist.id}
                isMultiSelected={isMultiSelectMode && isSelected(playlist.id)}
                selectedCount={selectedIds.length}
                selectedIds={selectedIds}
                isDragging={isDragging}
                dropPosition={itemDropPosition}
                showExternalDropHighlight={showExternalDropHighlight}
                onClick={(e) => handleItemClick(playlist.id, e)}
                onUpdate={updatePlaylist}
                onDelete={() => handleDeletePlaylists(selectedIds)}
              />
            );
          })}
        </ul>
        {/* End drop zone for reordering to end of list */}
        <EndDropZone
          zoneId="playlist-end-zone"
          zoneType="playlist"
          sourceId="playlists"
          acceptTypes={["playlist"]}
          className="flex-1 min-h-4"
        />
      </div>
    </SortableContext>
  );
};

interface SortablePlaylistItemProps {
  playlist: Playlist;
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

const SortablePlaylistItem = ({
  playlist,
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
}: SortablePlaylistItemProps) => {
  const itemInputRef = useRef<HTMLInputElement>(null);

  const dragData: AppDragData = {
    type: "playlist",
    sourceId: playlist.id,
    item: playlist,
    selectedIds: selectedIds.includes(playlist.id) ? selectedIds : undefined,
  };

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
  } = useSortable({
    id: playlist.id,
    data: dragData,
  });

  // Make this item a droppable for media items
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: playlist.id,
    data: dragData,
  });

  // Combined ref handler
  const handleRef = (el: HTMLLIElement | null) => {
    setSortableRef(el);
    setDroppableRef(el);
  };

  const { renameState, onBlur, onKeyDown, onChange, setRenameState } =
    useRenameState({
      id: playlist.id,
      name: playlist.name,
      itemInputRef,
      onUpdate,
    });

  const { openContextMenu } = useContextMenu({
    onDelete,
    onRename: () => setRenameState({ mode: "edit", text: playlist.name }),
    id: playlist.id,
    selectedCount,
  });

  return (
    <li
      ref={handleRef}
      className={cn(
        "flex items-center gap-1.5 pl-5 pr-1 text-white text-xs transition-colors ghost-no-bg ghost-no-ring relative",
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
      <SidebarItem icon={<PlaylistIcon />}>
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
          playlist.name
        )}
      </SidebarItem>

      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
