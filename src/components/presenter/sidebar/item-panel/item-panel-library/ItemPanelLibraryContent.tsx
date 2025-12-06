import { LibraryContentDraggableGroup } from "./LibraryContentDraggableGroup";
import { ItemPanelLibraryProvider } from "./context";

export const ItemPanelLibraryContent = () => {
  return (
    <ItemPanelLibraryProvider>
      <LibraryContentDraggableGroup />
    </ItemPanelLibraryProvider>
  );
};
