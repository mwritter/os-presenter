import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: every slide can have a 'label' to indicate the type of slide it is - this is not implemented yet
export const SlideLabelSelect = () => {
  return (
    <div className="flex gap-2 items-end justify-between">
      <div className="flex flex-col flex-1 gap-2">
        <Label htmlFor="slide-label-select" className="text-xs!">
          Label
        </Label>
        <Select>
          <SelectTrigger
            id="slide-label-select"
            className="w-full text-xs! h-min! py-1"
          >
            <SelectValue placeholder="Select a label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blank-slide">Blank</SelectItem>
            <SelectItem value="instramental">Instramental</SelectItem>
            <SelectItem value="repeat">Repeat</SelectItem>
            <SelectItem value="spoken-word">Spoken Word</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <ColorPicker />
      </div>
    </div>
  );
};
