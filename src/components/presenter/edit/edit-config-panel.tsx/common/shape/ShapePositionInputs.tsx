import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface ShapePositionInputsProps {
  x: number;
  y: number;
  onChange: (update: { x: number; y: number }) => void;
}

// sets the position of the slide object
export const ShapePositionInputs = ({
  x,
  y,
  onChange,
}: ShapePositionInputsProps) => {
  const [value, setValue] = useState<{ x: number; y: number }>({ x, y });

  // Sync local state when external props change (e.g., from MoveableWrapper)
  useEffect(() => {
    setValue({ x, y });
  }, [x, y]);

  const handleChange = (update: { x?: number; y?: number }) => {
    const newValue = { ...value, ...update };
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <ShapePositionXInput value={value.x} onChange={handleChange} />
      <ShapePositionYInput value={value.y} onChange={handleChange} />
    </div>
  );
};

export const ShapePositionXInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (update: { x?: number }) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        className="text-xs! h-min"
        id="shape-position-x"
        type="number"
        step="0.01"
        value={Number(value.toFixed(2))}
        onChange={(e) => onChange({ x: Number(e.target.value) })}
      />
      <Label className="text-xs!" htmlFor="shape-position-x">
        X
      </Label>
    </div>
  );
};

export const ShapePositionYInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (update: { y?: number }) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        className="text-xs! h-min"
        id="shape-position-y"
        type="number"
        step="0.01"
        value={Number(value.toFixed(2))}
        onChange={(e) => onChange({ y: Number(e.target.value) })}
      />
      <Label className="text-xs!" htmlFor="shape-position-y">
        Y
      </Label>
    </div>
  );
};
