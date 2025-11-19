import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Box, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { ColorPicker } from "@/components/feature/color-picker/ColorPicker";
import { Input } from "@/components/ui/input";
import { ShadowEffectType } from "./types";

export const ShadowEffect = ({
  value,
  onChange,
}: {
  value?: ShadowEffectType;
  onChange: (effect: ShadowEffectType | undefined) => void;
}) => {
  const hasShadowEffect = !!value;

  const handleAddShadowEffect = () => {
    onChange({
      type: "shadow",
      color: "rgba(0, 0, 0, 1)",
      offsetX: 0,
      offsetY: 10,
      blurRadius: 0,
    });
  };

  const handleRemoveShadowEffect = () => {
    onChange(undefined);
  };

  return (
    <div className="flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Box className="size-3" />
          <Label className="text-xs!">Drop Shadow</Label>
        </div>
        {!hasShadowEffect ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleAddShadowEffect}
          >
            <Plus className="size-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleRemoveShadowEffect}
          >
            <Minus className="size-3" />
          </Button>
        )}
      </div>
      {hasShadowEffect && <ShapeShadowItem value={value} onChange={onChange} />}
    </div>
  );
};

const ShapeShadowItem = ({
  value,
  onChange,
}: {
  value: ShadowEffectType;
  onChange: (effect: ShadowEffectType) => void;
}) => {
  const [state, setState] = useState<ShadowEffectType>(value);

  // Sync internal state when external value changes (e.g., when selecting a different object)
  useEffect(() => {
    setState(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-3 pl-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs!" htmlFor="shape-shadow-color">
          Color
        </Label>
        <ColorPicker
          value={state.color}
          onChange={(color) => {
            const newState = { ...state, color };
            setState(newState);
            onChange(newState);
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-[10px]!" htmlFor="shape-shadow-offset-x">
            X
          </Label>
          <Input
            className="text-xs! h-min flex-1"
            type="number"
            step="1"
            min={-100}
            max={100}
            value={state.offsetX}
            onChange={(e) => {
              const value = Math.max(
                -100,
                Math.min(100, Number(e.target.value))
              );
              const newState = { ...state, offsetX: value };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-1">
          <Label className="text-[10px]" htmlFor="shape-shadow-offset-y">
            Y
          </Label>
          <Input
            className="text-xs! h-min flex-1"
            type="number"
            step="1"
            min={-100}
            max={100}
            value={state.offsetY}
            onChange={(e) => {
              const value = Math.max(
                -100,
                Math.min(100, Number(e.target.value))
              );
              const newState = { ...state, offsetY: value };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center justify-end gap-2">
          <Label className="text-[10px]!" htmlFor="shape-shadow-blur-radius">
            Blur
          </Label>
          <Input
            className="text-xs! h-min w-[10ch]"
            type="number"
            step="1"
            min={0}
            value={state.blurRadius}
            onChange={(e) => {
              const newState = { ...state, blurRadius: Number(e.target.value) };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
      </div>
    </div>
  );
};
