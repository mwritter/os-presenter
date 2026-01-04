import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// sets whether the slide is enabled or disabled - all slides are enabled by default
export const SlideEnabled = () => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="slide-enabled" />
      <Label className="text-xs!" htmlFor="slide-enabled">
        Enabled
      </Label>
    </div>
  );
};
