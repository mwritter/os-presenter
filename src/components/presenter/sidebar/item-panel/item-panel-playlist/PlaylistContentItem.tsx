import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { usePlaylistItemContextMenu } from "../hooks/use-playlist-item-context-menu";

export const PlaylistContentItem = ({
  item,
  title,
  onSelect,
  onClick,
  onRemove,
  selectedCount = 0,
}: {
  item: { id: string };
  title: string;
  onSelect: (itemId: string) => void;
  onClick?: (itemId: string, e: React.MouseEvent) => void;
  onRemove: (itemId: string) => void;
  selectedCount?: number;
}) => {
  const { openContextMenu } = usePlaylistItemContextMenu({
    onRemove: () => onRemove(item.id),
    id: item.id,
    selectedCount,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      console.log("handleClick1", item.id);
      onClick(item.id, e);
    } else if (onClick) {
      console.log("handleClick2", item.id);
      onClick(item.id, e);
    } else {
      console.log("handleSelect", item.id);
      onSelect(item.id);
    }
  };

  return (
    <button
      className={cn("w-full p-1")}
      onClick={handleClick}
      onContextMenu={(e) => openContextMenu(e)}
    >
      <div className="flex items-center gap-2">
        <File className="size-3.5" color="white" />
        <span className="text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
          {title}
        </span>
      </div>
    </button>
  );
};
