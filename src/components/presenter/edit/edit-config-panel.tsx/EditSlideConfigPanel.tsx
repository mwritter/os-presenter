import { BackgroundColorPicker } from "./common/BackgroundColorPicker";
import { SlideEnabled } from "./common/slide/SlideEnabled";
import { SlideHotKey } from "./common/slide/SlideHotKey";
import { SlideLabelSelect } from "./common/slide/SlideLabelSelect";
import { useEditContext } from "@/presenter/edit/context";

export const EditSlideConfigPanel = () => {
  const { selectedSlide, updateSlideBackground } = useEditContext();

  return (
    <div className="flex flex-col gap-3">
      <SlideEnabled />
      <hr />
      <SlideHotKey />
      <hr />
      <SlideLabelSelect />
      <hr />
      <BackgroundColorPicker
        value={selectedSlide?.backgroundColor}
        onChange={updateSlideBackground}
      />
      <hr />
    </div>
  );
};
