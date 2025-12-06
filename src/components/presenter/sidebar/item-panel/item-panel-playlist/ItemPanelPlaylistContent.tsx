import { ItemPanelPlaylistProvider } from "./context";
import { PlaylistContentDraggableGroup } from "./PlaylistContentDraggableGroup";

export const ItemPanelPlaylistContent = () => {
  return (
    <ItemPanelPlaylistProvider>
      <PlaylistContentDraggableGroup />
    </ItemPanelPlaylistProvider>
  );
};
