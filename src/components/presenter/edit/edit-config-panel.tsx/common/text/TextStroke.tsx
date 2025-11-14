import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export const TextStroke = () => {
  const [hasStroke, setHasStroke] = useState(false);
  const handleAddStroke = () => {
    setHasStroke(true);
  };

  const handleRemoveStroke = () => {
    setHasStroke(false);
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
      {hasStroke && <TextStrokeItem />}
    </div>
  );
};

const TextStrokeItem = () => {
  const [width, setWidth] = useState(0);
  return (
    <div className="flex flex-col gap-3 pl-2">
      {/* TODO: new color picker component that shows the color as a swatch and gives an editable hex color input */}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs!" htmlFor="text-stroke-color">
          Color
        </Label>
        <ColorPicker />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs! flex-1" htmlFor="text-stroke-width">
          Width
        </Label>
        <Input
          className="text-xs! h-min w-[10ch]"
          min={0}
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
