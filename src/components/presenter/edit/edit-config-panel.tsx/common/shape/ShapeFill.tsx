import { ColorPicker } from "@/components/feature/color-picker/ColorPicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

// sets the fill color for the slide object
export const ShapeFill = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string | undefined) => void;
}) => {
  const hasFill = !!value;

  const handleAddFill = () => {
    onChange("#3b82f6"); // Default blue color
  };

  const handleRemoveFill = () => {
    onChange(undefined);
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
      {hasFill && <ShapeFillItem value={value!} onChange={onChange} />}
    </div>
  );
};

const ShapeFillItem = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string | undefined) => void;
}) => {
  return (
    <div className="flex items-center justify-between gap-2 pl-2">
      <Label className="text-xs!" htmlFor="shape-fill-color">
        Color
      </Label>
      <ColorPicker value={value} onChange={onChange} />
    </div>
  );
};
