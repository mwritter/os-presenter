import { cn } from "@/lib/utils";
import {
  useSelectedPlaylist,
  usePlaylistStore,
  useSelectionStore,
} from "@/stores/presenterStore";
import { File } from "lucide-react";
import { useItemPanelContext } from "./context";
import { usePlaylistItemContextMenu } from "./hooks/use-playlist-item-context-menu";
import { Reorder } from "motion/react";
import { PlaylistItem } from "@/components/presenter/types";
import { useRef, useState } from "react";

export const ItemPanelPlaylistContent = () => {
  const isDraggingRef = useRef(false);
  const selectedPlaylist = useSelectedPlaylist();
  const selectedPlaylistItemId = useSelectionStore(
    (s) => s.selectedPlaylistItem?.id ?? null
  );
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const removePlaylistItem = usePlaylistStore((s) => s.removePlaylistItem);
  const reorderPlaylistItems = usePlaylistStore((s) => s.reorderPlaylistItems);
  const { filter } = useItemPanelContext();

  const [orderedItems, setOrderedItems] = useState<PlaylistItem[]>(
    selectedPlaylist?.items ?? []
  );

  const filteredItems =
    selectedPlaylist?.items.filter((item) => {
      return item.slideGroup.title.toLowerCase().includes(filter.toLowerCase());
    }) || [];

  const handleReorder = (newOrderedItems: PlaylistItem[]) => {
    if (filter) return;
    setOrderedItems(newOrderedItems);
  };

  const handleSelectPlaylistItem = (itemId: string) => {
    if (isDraggingRef.current) return;
    selectPlaylistItem(itemId, selectedPlaylist!.id);
  };

  const handleRemovePlaylistItem = (itemId: string) => {
    if (selectedPlaylist) {
      removePlaylistItem(selectedPlaylist.id, itemId);
    }
  };

  if (!selectedPlaylist) return null;

  const items = filter ? filteredItems : orderedItems;

  return (
    <Reorder.Group
      className="group has-data-[dragging=true]:[&>:not([data-dragging=true])]:hover:bg-shade-2"
      values={items}
      onReorder={handleReorder}
    >
      {items.map((item) => {
        const isSelected = selectedPlaylistItemId === item.id;
        const title = item.slideGroup.title; // Access embedded slide group directly

        return (
          <Reorder.Item
            className={cn("relative", {
              "hover:bg-neutral-700": !isSelected,
              "bg-neutral-700": isSelected,
            })}
            key={item.id}
            value={item}
            onPointerDown={(e) => {
              console.log("onPointerDown", {
                target: e.target,
                currentTarget: e.currentTarget,
              });
              e.currentTarget.setAttribute("data-dragging", "true");
            }}
            onPointerUp={(e) => {
              e.currentTarget.removeAttribute("data-dragging");
            }}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={() => {
              isDraggingRef.current = false;
              reorderPlaylistItems(selectedPlaylist!.id, orderedItems);
            }}
          >
            <PlaylistContentItem
              item={item}
              isSelected={isSelected}
              title={title}
              onSelect={handleSelectPlaylistItem}
              onRemove={handleRemovePlaylistItem}
            />
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};

const PlaylistContentItem = ({
  item,
  isSelected,
  title,
  onSelect,
  onRemove,
}: {
  item: { id: string };
  isSelected: boolean;
  title: string;
  onSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}) => {
  const { openContextMenu } = usePlaylistItemContextMenu({
    onRemove: () => onRemove(item.id),
    id: item.id,
  });

  return (
    <button
      className={cn("w-full p-1")}
      onClick={() => onSelect(item.id)}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5" color="white" />
        <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
          {title}
        </span>
      </div>
    </button>
  );
};
