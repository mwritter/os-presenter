import { BackgroundColorPicker } from "./common/BackgroundColorPicker";
import { PresentationSizeSelect } from "./common/presentation/PresentationSizeSelect";
import { PresentationTransitionSelect } from "./common/presentation/PresentationTransitionSelect";
import { PresentationCopyright } from "./common/presentation/PresentationCopyright";
import { useEditContext } from "@/presenter/edit/context";
import { useMemo } from "react";

export const EditPresentationConfigPanel = () => {
  const {
    allSlides,
    updateAllSlidesBackground,
    canvasSize,
    updateCanvasSize,
  } = useEditContext();

  // Calculate the presentation background value
  // Only show a value if ALL slides have the SAME background color
  const presentationBackgroundValue = useMemo(() => {
    if (allSlides.length === 0) return undefined;

    // Get all unique background colors (excluding undefined)
    const backgrounds = allSlides.map((slide) => slide.backgroundColor);
    const uniqueBackgrounds = [...new Set(backgrounds)];

    // If all slides have the same background (including all undefined)
    if (uniqueBackgrounds.length === 1) {
      return uniqueBackgrounds[0];
    }

    // If slides have different backgrounds or mix of defined/undefined
    return undefined;
  }, [allSlides]);

  return (
    <div className="flex flex-col gap-3">
      <BackgroundColorPicker
        value={presentationBackgroundValue}
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
