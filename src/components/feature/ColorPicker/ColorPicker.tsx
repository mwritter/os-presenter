import { ColorPickerProvider } from "./context";
import { ColorWheelContent } from "./common/color-wheel/ColorWheelContent";
import { ColorSwatchContent } from "./common/color-swatch/ColorSwatchContent";

export type ColorPickerProps = {
  value?: string; // hex color value
  onChange?: (color: string) => void;
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <ColorPickerProvider value={value} onChange={onChange}>
      <div className="flex items-center gap-[5px] bg-shade-1 rounded-sm relative w-min">
        <ColorSwatchContent />
        <ColorWheelContent />
      </div>
    </ColorPickerProvider>
  );
};
