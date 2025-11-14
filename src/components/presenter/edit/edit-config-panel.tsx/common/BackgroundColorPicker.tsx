import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const BackgroundColorPicker = () => {
  return (
    <div className="flex justify-between items-center relative">
      <div className="flex items-center gap-2">
        <Checkbox id="background" />
        <Label className="text-xs!" htmlFor="background">
          Background
        </Label>
      </div>
      <ColorPicker />
    </div>
  );
};
