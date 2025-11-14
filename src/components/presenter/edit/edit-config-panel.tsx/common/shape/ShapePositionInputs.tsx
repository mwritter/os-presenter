import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

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

  const handleChange = (update: { x?: number; y?: number }) => {
    setValue((prev) => ({ ...prev, ...update }));
  };

  useEffect(() => {
    onChange({ x: value.x, y: value.y });
  }, [value.x, value.y]);

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
        value={value}
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
        value={value}
        onChange={(e) => onChange({ y: Number(e.target.value) })}
      />
      <Label className="text-xs!" htmlFor="shape-position-y">
        Y
      </Label>
    </div>
  );
};
