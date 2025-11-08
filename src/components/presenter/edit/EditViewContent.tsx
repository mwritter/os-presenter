import { useEditContext } from "@/presenter/edit/context";
import { Slide } from "@/components/feature/slide/Slide";
import { SlideData } from "@/components/feature/slide/types";
import { EditViewObjectActionbar } from "./EditViewObjectActionbar";

export const EditViewContent = () => {
  const { selectedSlide } = useEditContext();
  if (!selectedSlide) return null;

  const props: SlideData = {
    ...selectedSlide,
    background: {
      type: "color",
      value: "var(--color-shade-2)",
    },
  };

  return (
    <div className="flex h-full w-full bg-shade-lighter justify-center items-center relative overflow-y-auto py-20">
      <EditViewObjectActionbar />
      <div className="px-10 h-full w-full max-w-[1000px] flex flex-col justify-center items-center relative">
        <div className="w-full aspect-video">
          <Slide id={selectedSlide?.id} data={props} as="div" />
        </div>
      </div>
    </div>
  );
};
