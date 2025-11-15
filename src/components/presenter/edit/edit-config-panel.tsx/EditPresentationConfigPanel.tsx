import { BackgroundColorPicker } from "./common/BackgroundColorPicker";
import { PresentationSizeSelect } from "./common/presentation/PresentationSizeSelect";
import { PresentationTransitionSelect } from "./common/presentation/PresentationTransitionSelect";
import { PresentationCopyright } from "./common/presentation/PresentationCopyright";
import { useEditContext } from "@/presenter/edit/context";

export const EditPresentationConfigPanel = () => {
  const {
    selectedSlide,
    updateAllSlidesBackground,
    canvasSize,
    updateCanvasSize,
  } = useEditContext();

  return (
    <div className="flex flex-col gap-3">
      <BackgroundColorPicker
        value={selectedSlide?.backgroundColor}
        onChange={updateAllSlidesBackground}
      />
      <hr />
      <PresentationSizeSelect value={canvasSize} onChange={updateCanvasSize} />
      <hr />
      <PresentationTransitionSelect />
      <hr />
      <PresentationCopyright />
    </div>
  );
};
