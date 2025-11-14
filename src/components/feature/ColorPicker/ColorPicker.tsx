import { ColorPickerProvider } from "./context";
import { ColorWheelContent } from "./common/color-wheel/ColorWheelContent";
import { ColorSwatchContent } from "./common/color-swatch/ColorSwatchContent";

// TODO: allow different default swatch colors to be passed in
// TODO: allow on color change function to be passed in
// TODO: allow initial color to be passed in

export const ColorPicker = () => {
  return (
    <ColorPickerProvider>
      <div className="flex items-center gap-[5px] bg-shade-1 rounded-sm relative w-min">
        <ColorSwatchContent />
        <ColorWheelContent />
      </div>
    </ColorPickerProvider>
  );
};
