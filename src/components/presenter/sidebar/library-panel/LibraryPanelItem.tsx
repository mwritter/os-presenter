import { useEffect, useRef, useState } from "react";
import { useContextMenu } from "./hooks/use-context-menu";
import { InputValue } from "./types";
import { cn } from "@/lib/utils";

export type DragDropData =
  | { type: "playlistItem"; itemIds: string[]; sourcePlaylistId: string }
  | { type: "slideGroup"; slideGroupIds: string[]; sourceLibraryId: string };

type LibraryPanelItemProps = {
  id: string;
  name: string;
  icon: React.ReactNode;
  onUpdate: (id: string, { name }: { name: string }) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onItemDrop?: (data: DragDropData) => void;
  onClick?: (e: React.MouseEvent) => void;
  selectedCount?: number;
};

export const LibraryPanelItem = ({
  id,
  name,
  icon,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  isMultiSelected = false,
  onItemDrop,
  onClick,
  selectedCount = 0,
}: LibraryPanelItemProps) => {
  const [renameState, setRenameState] = useState<InputValue>({
    mode: "view",
    text: name,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const itemInputRef = useRef<HTMLInputElement>(null);
  const { openContextMenu } = useContextMenu({
    onDelete,
    onRename: () => setRenameState({ mode: "edit", text: name }),
    id,
    selectedCount,
  });

  const handleClick = (e: React.MouseEvent) => {
    // If multi-select handler is provided and modifier key is pressed, use it
    if (onClick && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      onClick(e);
    } else if (onClick) {
      // Normal click with multi-select handler - clear other selections and do normal select
      onClick(e);
      onSelect(id);
    } else {
      // No multi-select handler, just do normal select
      onSelect(id);
    }
  };

  useEffect(() => {
    if (renameState.mode === "edit") {
      requestAnimationFrame(() => {
        itemInputRef.current?.focus();
      });
    }
  }, [renameState.mode]);

  useEffect(() => {
    if (renameState.mode === "view" && renameState.text !== name) {
      onUpdate(id, { name: renameState.text });
    }
  }, [renameState.text, renameState.mode]);

  // Reset drag state when any drag operation ends
  useEffect(() => {
    const handleDragEnd = () => {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(id);
      }}
      onContextMenu={(e) => openContextMenu(e)}
      className={cn(
        "flex items-center gap-2 py-1 px-5 w-full transition-colors ghost-no-bg ghost-no-ring",
        {
          "bg-white/20 ring-1 ring-white/40": isSelected && !isMultiSelected,
          "bg-blue-600": isMultiSelected || (isDragOver && onItemDrop),
        }
      )}
      onDragOver={(e) => {
        if (!onItemDrop) return;
        // Only handle item drops (slideGroup/playlistItem), let library/playlist reordering propagate
        const types = e.dataTransfer.types;
        if (!types.includes("application/x-item-drop")) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={(e) => {
        if (!onItemDrop) return;
        // Only handle item drops, let reordering propagate
        const types = e.dataTransfer.types;
        if (!types.includes("application/x-item-drop")) return;
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!onItemDrop) return;
        const types = e.dataTransfer.types;
        if (!types.includes("application/x-item-drop")) return;
        e.preventDefault();
        e.stopPropagation();

        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        if (!onItemDrop) return;

        const type = e.dataTransfer.getData("type");
        // Only handle slideGroup and playlistItem drops
        if (type !== "playlistItem" && type !== "slideGroup") return;

        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragOver(false);

        if (type === "playlistItem") {
          const sourcePlaylistId = e.dataTransfer.getData("sourcePlaylistId");
          // Check for multiple items first, fallback to single item
          const itemIdsJson = e.dataTransfer.getData("itemIds");
          const singleItemId = e.dataTransfer.getData("itemId");
          const itemIds = itemIdsJson
            ? JSON.parse(itemIdsJson)
            : singleItemId
              ? [singleItemId]
              : [];

          if (itemIds.length > 0 && sourcePlaylistId) {
            onItemDrop({ type: "playlistItem", itemIds, sourcePlaylistId });
          }
        } else if (type === "slideGroup") {
          const sourceLibraryId = e.dataTransfer.getData("sourceLibraryId");
          // Check for multiple slide groups first, fallback to single
          const slideGroupIdsJson = e.dataTransfer.getData("slideGroupIds");
          const singleSlideGroupId = e.dataTransfer.getData("slideGroupId");
          const slideGroupIds = slideGroupIdsJson
            ? JSON.parse(slideGroupIdsJson)
            : singleSlideGroupId
              ? [singleSlideGroupId]
              : [];

          if (slideGroupIds.length > 0 && sourceLibraryId) {
            onItemDrop({ type: "slideGroup", slideGroupIds, sourceLibraryId });
          }
        }
      }}
    >
      {icon}
      <div className="flex-1 text-left text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden select-none">
        {renameState.mode === "edit" ? (
          <input
            ref={itemInputRef}
            className="border w-full bg-black"
            type="text"
            value={renameState.text}
            onChange={(e) =>
              setRenameState({ ...renameState, text: e.target.value })
            }
            onBlur={() => setRenameState({ ...renameState, mode: "view" })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setRenameState({ ...renameState, mode: "view" });
              }
              if (e.key === "Escape") {
                setRenameState({ text: name, mode: "view" });
              }
            }}
          />
        ) : (
          renameState.text
        )}
      </div>
    </div>
  );
};
