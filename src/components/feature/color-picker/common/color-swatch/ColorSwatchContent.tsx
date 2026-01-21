import { Swatch } from "@uiw/react-color";
import { getDefaultColorSwatchArray } from "../../utils/getDefaultColorSwatchArray";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorSwatchButton } from "./ColorSwatchButton";
import { PopoverArrow } from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { ColorSwatchTriggerButton } from "./ColorSwatchTriggerButton";
import { useColorPicker } from "../../context";
import { rgbaToHsva } from "../../utils/colorConversions";

export const ColorSwatchContent = () => {
  const { rgbaColor, setFullColor } = useColorPicker();
  const [openSwatch, setOpenSwatch] = useState(false);

  useEffect(() => {
    setOpenSwatch(false);
  }, [rgbaColor]);

  return (
    <Popover open={openSwatch} onOpenChange={setOpenSwatch}>
      <PopoverTrigger asChild>
        <ColorSwatchTriggerButton color={rgbaColor} />
      </PopoverTrigger>
      <PopoverContent
        className="w-min p-0 bg-shade-1/50 backdrop-blur-md box-shadow-md border mr-2"
        sideOffset={5}
      >
        <Swatch
          colors={getDefaultColorSwatchArray()}
          color={rgbaColor}
          rectRender={(props) => (
            <ColorSwatchButton
              {...props}
              onClick={() => setFullColor(rgbaToHsva(props.color))}
            />
          )}
          onChange={(hsvColor) => {
            setFullColor(hsvColor);
          }}
        />
        <PopoverArrow fill="#464646" />
      </PopoverContent>
    </Popover>
  );
};
