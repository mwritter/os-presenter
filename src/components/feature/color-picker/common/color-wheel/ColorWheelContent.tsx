import { ColorResult } from "@uiw/react-color";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Wheel } from "@uiw/react-color";
import { PopoverArrow } from "@radix-ui/react-popover";
import { ColorWheelTriggerButton } from "./ColorWheelTriggerButton";
import { ColorWheelBrightnessSlider } from "./ColorWheelBrightnessSlider";
import { ColorWheelOpacitySlider } from "./ColorWheelOpacitySlider";
import { useColorPicker } from "../../context";

export const ColorWheelContent = () => {
  const { baseColor, brightness, setBaseColor } = useColorPicker();

  const handleWheelChange = (colorResult: ColorResult) => {
    // Only update hue and saturation from the wheel
    // Brightness and opacity are controlled by their own sliders
    setBaseColor({ h: colorResult.hsva.h, s: colorResult.hsva.s });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ColorWheelTriggerButton />
      </PopoverTrigger>
      <PopoverContent
        className="p-5 w-min bg-shade-1/50 backdrop-blur-md box-shadow-md border mr-2"
        sideOffset={5}
      >
        <div className="flex flex-col gap-3">
          <Wheel
            color={{ ...baseColor, v: brightness, a: 1 }}
            onChange={handleWheelChange}
          />
          <ColorWheelBrightnessSlider />
          <ColorWheelOpacitySlider />
        </div>
        <PopoverArrow fill="#464646" />
      </PopoverContent>
    </Popover>
  );
};
