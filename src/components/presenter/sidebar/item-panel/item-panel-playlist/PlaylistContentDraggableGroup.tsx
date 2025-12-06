import { PlaylistItemDraggable } from "./PlaylistItemDraggable";
import { useItemPanelPlaylistContext } from "./context";

export const PlaylistContentDraggableGroup = () => {
  const { items } = useItemPanelPlaylistContext();

  return (
    <ul>
      {items.map((item) => {
        return (
          <li key={item.id}>
            <PlaylistItemDraggable item={item} />
          </li>
        );
      })}
    </ul>
  );
};

