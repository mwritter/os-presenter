import { cn } from "@/lib/utils";
import {
  selectSelectedPlaylist,
  selectSelectedPlaylistItemId,
  usePresenterStore,
} from "@/stores/presenterStore";
import { File } from "lucide-react";
import { useItemPanelContext } from "./context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const ItemPanelPlaylistContent = () => {
  const selectedPlaylist = usePresenterStore(selectSelectedPlaylist);
  const selectedPlaylistItemId = usePresenterStore(
    selectSelectedPlaylistItemId
  );
  const selectPlaylistItem = usePresenterStore(
    (state) => state.selectPlaylistItem
  );
  const removePlaylistItem = usePresenterStore(
    (state) => state.removePlaylistItem
  );
  const { filter } = useItemPanelContext();

  const filteredItems =
    selectedPlaylist?.items.filter((item) => {
      return item.slideGroup.title.toLowerCase().includes(filter.toLowerCase());
    }) || [];

  const handleSelectPlaylistItem = (itemId: string) => {
    selectPlaylistItem(itemId, selectedPlaylist!.id);
  };

  const handleRemovePlaylistItem = (itemId: string) => {
    if (selectedPlaylist) {
      removePlaylistItem(selectedPlaylist.id, itemId);
    }
  };

  if (!selectedPlaylist) return null;

  return (
    <div>
      {filteredItems.map((item) => {
        const isSelected = selectedPlaylistItemId === item.id;
        const title = item.slideGroup.title; // Access embedded slide group directly

        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  "w-full hover:bg-white/10 p-1",
                  isSelected && "bg-white/20"
                )}
                key={item.id}
                onClick={() => handleSelectPlaylistItem(item.id)}
              >
                <div className="flex items-center gap-2">
                  <File className="size-3.5" color="white" />
                  <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                    {title}
                  </span>
                </div>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => handleRemovePlaylistItem(item.id)}
              >
                Remove
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
};
