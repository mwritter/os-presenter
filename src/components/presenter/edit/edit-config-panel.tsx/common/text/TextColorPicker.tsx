import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Label } from "@/components/ui/label";

export const TextColorPicker = () => {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs!">Text Color</Label>
      <ColorPicker />
    </div>
  );
};
