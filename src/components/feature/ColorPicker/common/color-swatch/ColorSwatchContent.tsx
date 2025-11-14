import { hexToHsva, Swatch } from "@uiw/react-color";
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

export const ColorSwatchContent = () => {
  const { hexColor, setHsva } = useColorPicker();
  const [openSwatch, setOpenSwatch] = useState(false);

  useEffect(() => {
    setOpenSwatch(false);
  }, [hexColor]);

  return (
    <Popover open={openSwatch} onOpenChange={setOpenSwatch}>
      <PopoverTrigger asChild>
        <ColorSwatchTriggerButton hexColor={hexColor} />
      </PopoverTrigger>
      <PopoverContent
        className="w-min p-0 bg-shade-1 border-none box-shadow-md mr-2"
        sideOffset={5}
      >
        <Swatch
          colors={getDefaultColorSwatchArray()}
          color={hexColor}
          rectRender={(props) => (
            <ColorSwatchButton
              {...props}
              onClick={() => setHsva(hexToHsva(props.color))}
            />
          )}
          onChange={(hsvColor) => {
            setHsva(hsvColor);
          }}
        />
        <PopoverArrow className="fill-shade-1" />
      </PopoverContent>
    </Popover>
  );
};
