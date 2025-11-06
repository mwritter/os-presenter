import { Sidebar } from "./sidebar/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toolbar } from "./toolbar/Toolbar";
import { MediaLibraryProvider } from "./media-library/context";
import { MediaLibraryPanel } from "./media-library/MediaLibraryPanel";
import { PresenterProvider } from "@/context/presenter";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PresenterProvider>
    <MediaLibraryProvider>
      <div className="flex flex-col h-screen w-screen">
        <Toolbar />
        <ResizablePanelGroup id="main-layout" direction="vertical">
          <ResizablePanel id="main-content" defaultSize={100}>
            <ResizablePanelGroup id="horizontal-layout" direction="horizontal">
              <ResizablePanel id="sidebar-panel" defaultSize={20} minSize={10} maxSize={50}>
                <Sidebar />
              </ResizablePanel>
              <ResizableHandle className="bg-black" />
              <ResizablePanel id="content-panel">
                {/* This needs to be an Outlet for react router */}
                {children}
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="bg-black" />
          <MediaLibraryPanel />
        </ResizablePanelGroup>
      </div>
    </MediaLibraryProvider>
    </PresenterProvider>
  );
};
