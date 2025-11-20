import { MediaLibraryPanel } from "./media-library/MediaLibraryPanel";
import { RightSidebar } from "./right-sidebar/RightSidebar";
import { Sidebar } from "./sidebar/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResizablePanelGroup id="main-layout" direction="vertical">
      <ResizablePanel id="main-content" defaultSize={100}>
        <ResizablePanelGroup id="horizontal-layout" direction="horizontal">
          <Sidebar />
          <ResizableHandle className="bg-black" />
          <ResizablePanel id="content-panel">{children}</ResizablePanel>
          <ResizableHandle className="bg-black" />
          <RightSidebar />
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle className="bg-black" />
      <MediaLibraryPanel />
    </ResizablePanelGroup>
  );
};
