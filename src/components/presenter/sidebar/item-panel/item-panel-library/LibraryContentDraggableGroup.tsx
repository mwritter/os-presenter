import { LibraryItemDraggable } from "./LibraryItemDraggable";
import { useItemPanelLibraryContext } from "./context";

export const LibraryContentDraggableGroup = () => {
  const { slideGroups } = useItemPanelLibraryContext();

  return (
    <ul>
      {slideGroups.map((slideGroup) => {
        return (
          <li key={slideGroup.id}>
            <LibraryItemDraggable slideGroup={slideGroup} />
          </li>
        );
      })}
    </ul>
  );
};
