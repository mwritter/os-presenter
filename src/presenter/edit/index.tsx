import { EditViewSidebar } from "@/components/presenter/edit/EditViewSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  selectSelectedPlaylistItemData,
  selectSelectedSlideGroupData,
  usePresenterStore,
} from "@/stores/presenterStore";
import { EditProvider } from "./context";
import { EditViewContent } from "@/components/presenter/edit/EditViewContent";

const Edit = () => {
  const selectedPlaylistItemData = usePresenterStore(
    selectSelectedPlaylistItemData
  );
  const activeSlideGroupData = usePresenterStore(selectSelectedSlideGroupData);
  const slideGroup =
    selectedPlaylistItemData?.slideGroup || activeSlideGroupData;
  return (
    <EditProvider>
      <ResizablePanelGroup
        className="relative"
        id="edit-layout"
        direction="horizontal"
      >
        <EditViewSidebar slideGroup={slideGroup} />
        <ResizableHandle className="bg-black" />
        <ResizablePanel id="edit-content" className="bg-shade-2 min-h-[100px]">
          <EditViewContent />
        </ResizablePanel>
      </ResizablePanelGroup>
    </EditProvider>
  );
};

export default Edit;
