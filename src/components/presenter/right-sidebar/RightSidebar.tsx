import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useLocation } from "react-router";
import { PreviewPanel } from "./preview-panel/PreviewPanel";

export const RightSidebar = () => {
  const isEditRoute = useLocation().pathname.startsWith("/presenter/edit");
  return (
    <ResizablePanel
      id={"right-sidebar-panel"}
      defaultSize={20}
      minSize={20}
      maxSize={30}
      hidden={isEditRoute}
    >
      <PreviewPanel />
      <ResizablePanelGroup id="right-sidebar-group" direction="vertical">
        <ResizablePanel id="action-panel" className="bg-shade-2 min-h-[100px]">
          {/* Action Panel for multiple presentation / external controls */}
          <div>Action Panel</div>
        </ResizablePanel>
        <ResizableHandle className="bg-black" />
        <ResizablePanel id="item-panel" className="bg-shade-2 min-h-[100px]">
          {/* Action Panel for multiple presentation / external controls */}
          <div>Item Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};
