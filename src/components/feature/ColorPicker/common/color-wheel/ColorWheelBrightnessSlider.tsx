import { Slider } from "@/components/ui/slider";
import { hsvaToHex } from "@uiw/react-color";
import { useColorPicker } from "../../context";

export const ColorWheelBrightnessSlider = () => {
  const { baseColor, brightness, opacity, setBrightness, setHsva } =
    useColorPicker();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400">Brightness</label>
      <div className="w-[200px] relative">
        {/* Background gradient */}
        <div
          className="w-full h-1.5 rounded-full absolute top-1/2 -translate-y-1/2"
          style={{
            background: `linear-gradient(to right, 
            ${hsvaToHex({ ...baseColor, v: 0, a: 1 })}, 
            ${hsvaToHex({ ...baseColor, v: 100, a: 1 })})`,
          }}
        />
        <Slider
          value={[brightness]}
          onValueChange={(values) => {
            const newBrightness = values[0];
            setBrightness(newBrightness);
            setHsva({ ...baseColor, v: newBrightness, a: opacity });
          }}
          min={0}
          max={100}
          step={1}
          className="w-[200px] relative z-10 **:data-[slot=slider-track]:bg-transparent **:data-[slot=slider-range]:bg-transparent"
        />
      </div>
    </div>
  );
};
