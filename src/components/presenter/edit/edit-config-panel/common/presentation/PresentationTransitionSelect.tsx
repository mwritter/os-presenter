import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: build out slide transition structure this is not implemented yet
export const PresentationTransitionSelect = () => {
  return (
    <div className="grid gap-2">
      <Label className="text-xs!">Transition</Label>
      <Select>
        <SelectTrigger className="w-full text-xs! h-min! py-1">
          <SelectValue placeholder="Select a transition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fade">Fade</SelectItem>
          <SelectItem value="slide">Slide</SelectItem>
          <SelectItem value="zoom">Zoom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
