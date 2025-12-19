import { cn } from "@/lib/utils";
import { useMediaLibrarySidebarContext } from "./context";
import {
  MediaLibrarySidebarPlaylistItem,
  useMediaLibraryStore,
} from "@/stores/mediaLibraryStore";
import { File } from "lucide-react";
import { useSidebarPlaylistContextMenu } from "../hooks/use-sidebar-playlist-context-menu";
import { useRef } from "react";
import { useRenameState } from "../../sidebar/library-panel/hooks/use-rename-state";
import { useSortable } from "@dnd-kit/sortable";

interface MediaLibrarySidebarItemProps {
  item: MediaLibrarySidebarPlaylistItem;
  isDragging?: boolean;
  dropPosition?: "before" | "after" | null;
  isMultiSelected?: boolean;
  selectedIds?: string[];
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
}

export const MediaLibrarySidebarItem = ({
  item,
  isDragging = false,
  dropPosition = null,
  isMultiSelected = false,
  selectedIds = [],
  onClick,
  onDelete,
}: MediaLibrarySidebarItemProps) => {
  const { selectedItem } = useMediaLibrarySidebarContext();
  const updatePlaylist = useMediaLibraryStore((state) => state.updatePlaylist);
  const itemInputRef = useRef<HTMLInputElement | null>(null);

  const dragData = {
    type: "mediaPlaylist",
    sourceId: item.id,
    item,
    selectedIds: selectedIds.includes(item.id) ? selectedIds : undefined,
  };

  const { attributes, listeners, setNodeRef } = useSortable({
    id: item.id,
    data: dragData,
  });

  const { renameState, onBlur, onKeyDown, onChange, setRenameState } =
    useRenameState({
      id: item.id,
      name: item.name,
      itemInputRef,
      onUpdate: updatePlaylist,
    });

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
  };

  const { openContextMenu } = useSidebarPlaylistContextMenu({
    id: item.id,
    onDelete: onDelete ?? (() => {}),
    onRename: () => setRenameState({ mode: "edit", text: item.name }),
    selectedCount: selectedIds.length,
  });

  const isSelected = selectedItem?.id === item.id;

  return (
    <li
      ref={setNodeRef}
      onClick={handleClick}
      onContextMenu={openContextMenu}
      className={cn(
        "flex gap-2 items-center text-white text-xs px-1 py-2 cursor-pointer relative",
        {
          "bg-white/20 ring-1 ring-white/40": isSelected && !isMultiSelected,
          "bg-blue-600": isMultiSelected,
          "opacity-50": isDragging,
        }
      )}
      {...attributes}
      {...listeners}
    >
      {/* Drop indicator - before */}
      {dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-selected -translate-y-px z-10" />
      )}

      <File className="size-3.5 shrink-0" color="white" />
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
          {item.name}
        </span>
      )}

      {/* Drop indicator - after */}
      {dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-selected translate-y-px z-10" />
      )}
    </li>
  );
};
