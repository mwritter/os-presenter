import { hsvaToRgba } from "./colorConversions";
import { DEFAULT_COLOR_SWATCH_SHADES } from "../constants";

export const getDefaultColorSwatchArray = () => {
  const colorKeys = Object.keys(DEFAULT_COLOR_SWATCH_SHADES);
  const colors = [];
  // using colorsByShade, create an array like this [blue[0], green[0], yellow[0], etc...]]
  for (let i = 0; i < 4; i++) {
    for (const colorKey of colorKeys) {
      const hsvaColor =
        DEFAULT_COLOR_SWATCH_SHADES[
          colorKey as keyof typeof DEFAULT_COLOR_SWATCH_SHADES
        ][i];
      // Convert HSVA to rgba for the Swatch component
      colors.push(hsvaToRgba(hsvaColor));
    }
  }
  return colors;
};
