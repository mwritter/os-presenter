import { EditViewSidebar } from "@/components/presenter/edit/edit-view-sidebar/EditViewSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  useSelectedPlaylistItemData,
  useSelectedSlideGroupData,
} from "@/stores/presenter/presenterStore";
import { EditProvider } from "./context";
import { EditViewContent } from "@/components/presenter/edit/EditViewContent";

const Edit = () => {
  const selectedPlaylistItemData = useSelectedPlaylistItemData();
  const activeSlideGroupData = useSelectedSlideGroupData();
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
