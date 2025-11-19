import { Slider } from "@/components/ui/slider";
import { useColorPicker } from "../../context";
import { hsvaToRgba } from "../../utils/colorConversions";

export const ColorWheelOpacitySlider = () => {
  const { baseColor, brightness, opacity, setOpacity, setHsva } =
    useColorPicker();
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400">Opacity</label>
      <div className="w-[200px] relative">
        {/* Background container with overflow hidden for rounded edges */}
        <div className="w-full h-1.5 rounded-full absolute top-1/2 -translate-y-1/2 overflow-hidden">
          {/* Checkerboard pattern for transparency */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                        linear-gradient(45deg, #808080 25%, transparent 25%),
                        linear-gradient(-45deg, #808080 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #808080 75%),
                        linear-gradient(-45deg, transparent 75%, #808080 75%)
                      `,
              backgroundSize: "4px 4px",
              backgroundPosition: "0 0, 0 2px, 2px -2px, -2px 0px",
            }}
          />
          {/* Gradient with actual transparency */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, 
                        transparent, 
                        ${hsvaToRgba({ ...baseColor, v: brightness, a: 1 })})`,
            }}
          />
        </div>
        <Slider
          value={[opacity * 100]}
          onValueChange={(values) => {
            const newOpacity = values[0] / 100;
            setOpacity(newOpacity);
            setHsva({ ...baseColor, v: brightness, a: newOpacity });
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
