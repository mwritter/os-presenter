import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_PRESETS } from "@/consts/canvas";

// sets the canvas size of the presentation
export const PresentationSizeSelect = () => {
  return (
    <div className="grid gap-2">
      <Label className="text-xs!">Size</Label>
      <Select>
        <SelectTrigger className="w-full text-xs! h-min! py-1">
          <SelectValue placeholder="Select a size" />
        </SelectTrigger>
        <SelectContent>
          {CANVAS_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
