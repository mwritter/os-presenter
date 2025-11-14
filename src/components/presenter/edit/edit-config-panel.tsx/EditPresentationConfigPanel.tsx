import { BackgroundColorPicker } from "./common/BackgroundColorPicker";
import { PresentationSizeSelect } from "./common/presentation/PresentationSizeSelect";
import { PresentationTransitionSelect } from "./common/presentation/PresentationTransitionSelect";
import { PresentationCopyright } from "./common/presentation/PresentationCopyright";

export const EditPresentationConfigPanel = () => {
  return (
    <div className="flex flex-col gap-3">
      <BackgroundColorPicker />
      <hr />
      <PresentationSizeSelect />
      <hr />
      <PresentationTransitionSelect />
      <hr />
      <PresentationCopyright />
    </div>
  );
};
