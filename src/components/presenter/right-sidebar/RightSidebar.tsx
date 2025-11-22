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
      className="flex flex-col h-full"
      id={"right-sidebar-panel"}
      defaultSize={30}
      minSize={20}
      maxSize={30}
      hidden={isEditRoute}
    >
      <PreviewPanel />
      <ResizablePanelGroup id="right-sidebar-group" direction="vertical">
        <ResizablePanel id="action-panel" className="bg-shade-2" minSize={10}>
          {/* Action Panel for multiple presentation / external controls */}
          <div>Action Panel</div>
        </ResizablePanel>
        <ResizableHandle className="bg-black" />
        <ResizablePanel id="item-panel" className="bg-shade-2" minSize={10}>
          {/* Item Panel certain actions */}
          <div>Item Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};
