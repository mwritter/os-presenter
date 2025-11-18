import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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

  // Sync local state when external props change (e.g., from MoveableWrapper)
  useEffect(() => {
    setValue({ width, height });
  }, [width, height]);

  const handleChange = (update: { width?: number; height?: number }) => {
    const newValue = { ...value, ...update };
    setValue(newValue);
    onChange(newValue);
  };

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
        step="1"
        value={Number(value.toFixed(2))}
        onChange={(e) => {
          if (Number(e.target.value) === 0) return;
          onChange({ width: Number(e.target.value) });
        }}
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
        step="1"
        value={Number(value.toFixed(2))}
        onChange={(e) => {
          if (Number(e.target.value) === 0) return;
          onChange({ height: Number(e.target.value) });
        }}
      />
      <Label className="text-xs!" htmlFor="shape-size-height">
        Height
      </Label>
    </div>
  );
};
