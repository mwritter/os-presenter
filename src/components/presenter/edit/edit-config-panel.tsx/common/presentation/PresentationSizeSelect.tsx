import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_PRESETS } from "@/consts/canvas";
import { CanvasSize } from "@/components/presenter/types";

type PresentationSizeSelectProps = {
  value: CanvasSize;
  onChange: (canvasSize: CanvasSize) => void;
};

// sets the canvas size of the presentation
export const PresentationSizeSelect = ({
  value,
  onChange,
}: PresentationSizeSelectProps) => {
  // Find the preset that matches the current canvas size
  const currentPreset = CANVAS_PRESETS.find(
    (preset) =>
      preset.value.width === value.width && preset.value.height === value.height
  );

  const handleChange = (presetId: string) => {
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onChange(preset.value);
    }
  };

  return (
    <div className="grid gap-2">
      <Label className="text-xs!">Size</Label>
      <Select value={currentPreset?.id} onValueChange={handleChange}>
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
