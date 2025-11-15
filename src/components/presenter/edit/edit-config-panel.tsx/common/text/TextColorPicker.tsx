import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Label } from "@/components/ui/label";

export const TextColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs!">Text Color</Label>
      <ColorPicker value={value} onChange={onChange} />
    </div>
  );
};
