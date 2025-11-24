import { cn } from "@/lib/utils";
import {
  useSelectedPlaylist,
  usePlaylistStore,
  useSelectionStore,
} from "@/stores/presenterStore";
import { File } from "lucide-react";
import { useItemPanelContext } from "./context";
import { useNativeMenu } from "@/components/feature/native-menu/hooks/use-native-menu";

export const ItemPanelPlaylistContent = () => {
  const selectedPlaylist = useSelectedPlaylist();
  const selectedPlaylistItemId = useSelectionStore(
    (s) => s.selectedPlaylistItem?.id ?? null
  );
  const selectPlaylistItem = useSelectionStore((s) => s.selectPlaylistItem);
  const removePlaylistItem = usePlaylistStore((s) => s.removePlaylistItem);
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

        const { openNativeMenu } = useNativeMenu({
          items: [
            {
              id: "remove",
              text: "Remove",
              action: () => handleRemovePlaylistItem(item.id),
            },
          ],
        });

        return (
          <button
            key={item.id}
            className={cn(
              "w-full hover:bg-white/10 p-1",
              isSelected && "bg-white/20"
            )}
            onClick={() => handleSelectPlaylistItem(item.id)}
            onContextMenu={(e) => openNativeMenu(e)}
          >
            <div className="flex items-center gap-2">
              <File className="size-3.5" color="white" />
              <span className="text-white text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                {title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
