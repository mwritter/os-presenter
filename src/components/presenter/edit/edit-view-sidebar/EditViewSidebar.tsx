import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SlideGroup } from "../../types";
import { EditSlideGroupPanel } from "./edit-slide-group-panel/EditSlideGroupPanel";
import { EditSlideObjectPanel } from "./edit-object-panel/EditViewObjectPanel";
import { DndContext } from "@dnd-kit/core";

export const EditViewSidebar = ({
  slideGroup,
}: {
  slideGroup: SlideGroup | null;
}) => {
  return (
    <ResizablePanel
      id={"edit-sidebar-panel"}
      defaultSize={20}
      minSize={10}
      maxSize={30}
    >
      <ResizablePanelGroup id="edit-sidebar-group" direction="vertical">
        <ResizablePanel
          id="edit-slide-group-panel"
          minSize={10}
          className="bg-shade-3 overflow-y-auto"
        >
          <DndContext>
            <EditSlideGroupPanel slideGroup={slideGroup} />
          </DndContext>
        </ResizablePanel>
        <ResizableHandle className="bg-black" />
        <ResizablePanel
          id="edit-slide-object-panel"
          minSize={10}
          className="bg-shade-3 overflow-y-auto"
        >
          <EditSlideObjectPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};
