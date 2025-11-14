import { BackgroundColorPicker } from "./common/BackgroundColorPicker";
import { SlideEnabled } from "./common/slide/SlideEnabled";
import { SlideHotKey } from "./common/slide/SlideHotKey";
import { SlideLabelSelect } from "./common/slide/SlideLabelSelect";

export const EditSlideConfigPanel = () => {
  return (
    <div className="flex flex-col gap-3">
      <SlideEnabled />
      <hr />
      <SlideHotKey />
      <hr />
      <SlideLabelSelect />
      <hr />
      <BackgroundColorPicker />
      <hr />
    </div>
  );
};
