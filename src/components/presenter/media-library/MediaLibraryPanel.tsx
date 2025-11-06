import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable";
  import { MediaLibrarySidebar } from "./MediaLibrarySidebar";
  import { useMediaLibraryContext } from "./context";
import { MediaLibrary } from "./MediaLibrary";
  
  export const MediaLibraryPanel = () => {
    const { handlePanelRef } = useMediaLibraryContext();
    return (
      <ResizablePanel id="media-library-panel" ref={handlePanelRef} defaultSize={20} minSize={20} maxSize={80} collapsible>
        <ResizablePanelGroup id="media-library-group" direction="horizontal">
          <ResizablePanel
            id="media-library-sidebar"
            defaultSize={20}
            minSize={10}
            maxSize={50}
            className="bg-shade-1 overflow-y-auto"
          >
            <MediaLibrarySidebar />
          </ResizablePanel>
          <ResizableHandle className="bg-black" />
          <ResizablePanel id="media-library-content" className="bg-shade-3">
            <MediaLibrary />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    );
  };
  