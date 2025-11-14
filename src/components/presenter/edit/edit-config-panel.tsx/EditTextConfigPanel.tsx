import { Label } from "@/components/ui/label";
import { TextFontFamilyCombobox } from "./common/text/TextFontFamilyCombobox";
import { TextFontStyle } from "./common/text/TextFontStyleSelect";
import { TextFontSizeInput } from "./common/text/TextFontSizeInput";
import { TextCapitalizationSelect } from "./common/text/TextCapitalizationSelect";
import { TextColorPicker } from "./common/text/TextColorPicker";
import { TextAlignment } from "./common/text/TextAlignment";
import { TextStroke } from "./common/text/TextStroke";

export const EditTextConfigPanel = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label className="text-xs!">Typography</Label>
        <div className="flex flex-col gap-2">
          <TextFontFamilyCombobox />
          <div className="flex items-center gap-2">
            <TextFontStyle />
            <TextFontSizeInput />
          </div>
          <TextCapitalizationSelect />
          <hr />
          <TextColorPicker />
          <hr />
          <TextAlignment />
          <hr />
          <TextStroke />
        </div>
      </div>
      <hr />
    </div>
  );
};
