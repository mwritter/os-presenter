import { useSelectedLibrary } from "@/stores/presenterStore";
import { useLibraryHeaderContextMenu } from "../hooks/use-library-header-context-menu";
import { ItemPanelHeaderBase } from "./ItemPanelHeaderBase";
import { usePresenterContext } from "@/context/presenter";

export const ItemPanelLibraryHeader = () => {
  const selectedLibrary = useSelectedLibrary();
  const { openAddPresentationDialog } = usePresenterContext();

  const { openContextMenu } = useLibraryHeaderContextMenu({
    onNewPresentation: openAddPresentationDialog,
  });

  return (
    <ItemPanelHeaderBase
      itemCount={selectedLibrary?.slideGroups.length ?? 0}
      onAdd={(e) => openContextMenu(e)}
    />
  );
};
