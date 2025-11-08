import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SlideGroup } from "../types";
import { Slide } from "@/components/feature/slide/Slide";
import { useEditContext } from "@/presenter/edit/context";
import { cn } from "@/lib/utils";

export const EditViewSidebar = ({
  slideGroup,
}: {
  slideGroup: SlideGroup | null;
}) => {
  return (
    <ResizablePanel
      id={"edit-sidebar-panel"}
      defaultSize={20}
      minSize={20}
      maxSize={30}
    >
      <ResizablePanelGroup id="edit-sidebar-group" direction="vertical">
        <ResizablePanel
          id="edit-slide-group-panel"
          minSize={10}
          className="bg-shade-3 overflow-y-auto"
        >
          <EditSlideGroupPanel slideGroup={slideGroup} />
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

const EditSlideGroupPanel = ({
  slideGroup,
}: {
  slideGroup: SlideGroup | null;
}) => {
  const { selectedSlide, setSelectedSlide } = useEditContext();
  return (
    <div className="flex flex-col bg-shade-3 h-full">
      <div className="p-2">
        <p className="text-white text-xs font-bold">{slideGroup?.title}</p>
      </div>
      <div className="p-2 bg-shade-4">
        <p className="text-gray-400 text-xs">Group</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {slideGroup?.slides.map((slide, index) => (
          <button key={slide.id + index} className={cn("p-2 w-full flex flex-col gap-2", {
            "bg-blue-400": selectedSlide?.id === slide.id,
            "hover:bg-shade-1": selectedSlide?.id !== slide.id
          } )} onClick={() => setSelectedSlide(slide)}>
            <Slide id={slide.id} data={slide} as="div" />
            <p className="text-white text-xs font-bold text-left">{index + 1}</p>
          </button>
        ))}
      </div>
    </div>
  );
};


const EditSlideObjectPanel = () => {
  return (
    <div>
      <p className="text-white text-xs font-bold p-2 border border-shade-1">Objects</p>
    </div>
  );
};