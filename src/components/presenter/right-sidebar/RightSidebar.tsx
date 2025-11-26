import { ResizablePanel } from "@/components/ui/resizable";
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
    </ResizablePanel>
  );
};
