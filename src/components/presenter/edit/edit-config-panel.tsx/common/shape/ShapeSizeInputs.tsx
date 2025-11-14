import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface ShapeSizeInputsProps {
  width: number;
  height: number;
  onChange: (update: { width: number; height: number }) => void;
}

// sets the size of the slide object
export const ShapeSizeInputs = ({
  width,
  height,
  onChange,
}: ShapeSizeInputsProps) => {
  const [value, setValue] = useState<{ width: number; height: number }>({
    width,
    height,
  });

  const handleChange = (update: { width?: number; height?: number }) => {
    setValue((prev) => ({ ...prev, ...update }));
  };

  useEffect(() => {
    onChange({ width: value.width, height: value.height });
  }, [value.width, value.height]);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs!">Size</Label>
      <div className="flex items-center gap-2">
        <ShapeSizeWidthInput value={value.width} onChange={handleChange} />
        <ShapeSizeHeightInput value={value.height} onChange={handleChange} />
      </div>
    </div>
  );
};

export const ShapeSizeWidthInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (update: { width?: number }) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        className="text-xs! h-min"
        id="shape-size-width"
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange({ width: Number(e.target.value) })}
      />
      <Label className="text-xs!" htmlFor="shape-size-width">
        Width
      </Label>
    </div>
  );
};

export const ShapeSizeHeightInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (update: { height?: number }) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        className="text-xs! h-min"
        id="shape-size-height"
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange({ height: Number(e.target.value) })}
      />
      <Label className="text-xs!" htmlFor="shape-size-height">
        Height
      </Label>
    </div>
  );
};
