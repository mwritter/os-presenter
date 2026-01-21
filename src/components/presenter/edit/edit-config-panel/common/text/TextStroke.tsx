import { ColorPicker } from "@/components/feature/color-picker/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

export const TextStroke = ({
  strokeColor,
  strokeWidth,
  onChange,
}: {
  strokeColor?: string;
  strokeWidth?: number;
  onChange: (update: { strokeColor?: string; strokeWidth?: number }) => void;
}) => {
  const hasStroke = !!(strokeColor && strokeWidth);

  const handleAddStroke = () => {
    onChange({ strokeColor: "rgba(0, 0, 0, 1)", strokeWidth: 1 });
  };

  const handleRemoveStroke = () => {
    onChange({ strokeColor: undefined, strokeWidth: undefined });
  };

  return (
    <div className="flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs!">Stroke</Label>
        {!hasStroke ? (
          <Button onClick={handleAddStroke} variant="ghost" size="icon-xs">
            <Plus className="size-3" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon-xs" onClick={handleRemoveStroke}>
            <Minus className="size-3" />
          </Button>
        )}
      </div>
      {hasStroke && (
        <TextStrokeItem
          strokeColor={strokeColor!}
          strokeWidth={strokeWidth!}
          onChange={onChange}
        />
      )}
    </div>
  );
};

const TextStrokeItem = ({
  strokeColor,
  strokeWidth,
  onChange,
}: {
  strokeColor: string;
  strokeWidth: number;
  onChange: (update: { strokeColor?: string; strokeWidth?: number }) => void;
}) => {
  return (
    <div className="flex flex-col gap-3 pl-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs!" htmlFor="text-stroke-color">
          Color
        </Label>
        <ColorPicker
          value={strokeColor}
          onChange={(color) => onChange({ strokeColor: color, strokeWidth })}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs! flex-1" htmlFor="text-stroke-width">
          Width
        </Label>
        <Input
          className="text-xs! h-min w-[10ch]"
          min={0}
          type="number"
          step="0.1"
          value={strokeWidth}
          onChange={(e) =>
            onChange({
              strokeColor,
              strokeWidth: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  );
};
