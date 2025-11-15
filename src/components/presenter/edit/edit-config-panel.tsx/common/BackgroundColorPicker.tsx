import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

type BackgroundColorPickerProps = {
  value?: string;
  onChange: (color: string | undefined) => void;
};

export const BackgroundColorPicker = ({
  value,
  onChange,
}: BackgroundColorPickerProps) => {
  const [color, setColor] = useState(value || "#000000");
  const hasBackground = !!value;

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setColor(value);
    }
  }, [value]);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onChange(color);
    } else {
      onChange(undefined);
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (hasBackground) {
      onChange(newColor);
    }
  };

  return (
    <div className="flex justify-between items-center relative">
      <div className="flex items-center gap-2">
        <Checkbox
          id="background"
          checked={hasBackground}
          onCheckedChange={handleCheckboxChange}
        />
        <Label className="text-xs!" htmlFor="background">
          Background
        </Label>
      </div>
      <ColorPicker value={color} onChange={handleColorChange} />
    </div>
  );
};
