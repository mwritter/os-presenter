import { PlaylistItem } from "@/components/presenter/types";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { usePlaylistItemContextMenu } from "../hooks/use-playlist-item-context-menu";
import { useItemPanelPlaylistContext } from "./context";

export const PlaylistContentItem = ({
  item,
  onClick,
  onDelete,
}: {
  item: PlaylistItem;
  onClick: (itemId: string, e: React.MouseEvent) => void;
  onDelete: () => void;
}) => {
  const { selectedIds } = useItemPanelPlaylistContext();

  const { openContextMenu } = usePlaylistItemContextMenu({
    onRemove: onDelete,
    id: item.id,
    selectedCount: selectedIds.length,
  });

  return (
    <button
      className={cn("w-full p-1")}
      onClick={(e) => onClick(item.id, e)}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5" color="white" />
        <span className="text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
          {item.slideGroup.title}
        </span>
      </div>
    </button>
  );
};
