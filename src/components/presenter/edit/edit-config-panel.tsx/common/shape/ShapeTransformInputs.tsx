import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FlipHorizontal, FlipVertical } from "lucide-react";
import { useState } from "react";

// sets the flip (horizontal or vertical) and rotation of the slide object
export const ShapeTransformInputs = ({
  flip,
  rotation,
}: {
  flip: Array<"horizontal" | "vertical">;
  rotation: number;
}) => {
  const [localFlip, setLocalFlip] =
    useState<Array<"horizontal" | "vertical">>(flip);
  const [localRotation, setLocalRotation] = useState(rotation);

  const handleFlipChange = (update: { flip?: "horizontal" | "vertical" }) => {
    setLocalFlip((prev) => {
      const { flip } = update;
      if (!flip) return prev;
      if (prev.includes(flip)) {
        return prev.filter((f) => f !== flip);
      }
      return [...prev, flip];
    });
  };

  const handleRotationChange = (update: { rotation?: number }) => {
    setLocalRotation(update.rotation ?? 0);
  };

  return (
    <div className="flex flex-col gap-2 justify-center">
      <Label className="text-xs!">Transform</Label>
      <div className="flex items-start justify-between gap-2">
        <ShapeTransformFlipInput
          value={localFlip}
          onChange={handleFlipChange}
        />
        <ShapeTransformRotationInput
          value={localRotation}
          onChange={handleRotationChange}
        />
      </div>
    </div>
  );
};

const ShapeTransformFlipInput = ({
  value,
  onChange,
}: {
  value?: Array<"horizontal" | "vertical">;
  onChange: (update: { flip?: "horizontal" | "vertical" }) => void;
}) => {
  const isHorizontal = value?.includes("horizontal");
  const isVertical = value?.includes("vertical");

  return (
    <div className="flex bg-shade-1 rounded-sm">
      <Button
        className={cn(
          "size-7 border-r border-r-shade-2 rounded-sm rounded-br-none rounded-tr-none hover:bg-blue-400!",
          {
            "bg-blue-400": isHorizontal,
          }
        )}
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange({ flip: "horizontal" })}
      >
        <FlipHorizontal className="size-3" />
      </Button>
      <Button
        className={cn(
          "size-7 rounded-sm rounded-bl-none rounded-tl-none hover:bg-blue-400!",
          {
            "bg-blue-400": isVertical,
          }
        )}
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange({ flip: "vertical" })}
      >
        <FlipVertical className="size-3" />
      </Button>
    </div>
  );
};

const ShapeTransformRotationInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (update: { rotation?: number }) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        className="text-xs! h-min"
        id="shape-transform-rotation"
        type="number"
        min={0}
        max={360}
        value={value}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value < 0) return;
          if (value > 360) return;
          onChange({ rotation: value });
        }}
      />
      <Label className="text-xs!" htmlFor="shape-transform-rotation">
        Rotation
      </Label>
    </div>
  );
};
