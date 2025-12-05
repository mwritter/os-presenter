import { MediaLibraryPanel } from "./media-library/MediaLibraryPanel";
import { RightSidebar } from "./right-sidebar/RightSidebar";
import { Sidebar } from "./sidebar/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useGlobalDragCursor } from "@/hooks/use-global-drag-cursor";

export const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  useGlobalDragCursor();

  return (
    <ResizablePanelGroup id="outer-horizontal-layout" direction="horizontal">
      <ResizablePanel id="left-section" defaultSize={100}>
        <ResizablePanelGroup id="main-layout" direction="vertical">
          <ResizablePanel id="main-content" defaultSize={100}>
            <ResizablePanelGroup id="horizontal-layout" direction="horizontal">
              <Sidebar />
              <ResizableHandle className="bg-black" />
              <ResizablePanel id="content-panel">{children}</ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="bg-black" />
          <MediaLibraryPanel />
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle className="bg-black" />
      <RightSidebar />
    </ResizablePanelGroup>
  );
};
