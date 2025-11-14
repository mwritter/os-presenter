import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

// sets the fill color for the slide object
export const ShapeFill = () => {
  const [hasFill, setHasFill] = useState(false);
  const handleAddFill = () => {
    setHasFill(true);
  };

  const handleRemoveFill = () => {
    setHasFill(false);
  };

  return (
    <div className="flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs!">Fill</Label>
        {!hasFill ? (
          <Button
            className={cn({ "opacity-0!": hasFill })}
            variant="ghost"
            size="icon-xs"
            onClick={handleAddFill}
            disabled={hasFill}
          >
            <Plus className="size-3" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon-xs" onClick={handleRemoveFill}>
            <Minus className="size-3" />
          </Button>
        )}
      </div>
      {hasFill && <ShapeFillItem />}
    </div>
  );
};

const ShapeFillItem = () => {
  return (
    <div className="flex items-center justify-between gap-2 pl-2">
      {/* TODO: new color picker component that shows the color as a swatch and gives an editable hex color input */}
      <Label className="text-xs!" htmlFor="shape-fill-color">
        Color
      </Label>
      <ColorPicker />
    </div>
  );
};
