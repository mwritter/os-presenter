import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LibraryPanel } from "./library-panel/LibraryPanel";
import { ItemPanel } from "./item-panel/ItemPanel";
import { useLocation } from "react-router";

export const Sidebar = () => {
  const isEditRoute = useLocation().pathname.startsWith("/presenter/edit");
  return (
    <ResizablePanel
      id={"sidebar-panel"}
      defaultSize={20}
      minSize={10}
      maxSize={50}
      hidden={isEditRoute}
    >
      <ResizablePanelGroup id="sidebar-group" direction="vertical">
        <ResizablePanel
          id="library-panel"
          minSize={10}
          className="bg-shade-1 overflow-y-auto"
        >
          <LibraryPanel />
        </ResizablePanel>
        <ResizableHandle className="bg-black" />
        <ResizablePanel id="item-panel" className="bg-shade-2 min-h-[100px]">
          <ItemPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};