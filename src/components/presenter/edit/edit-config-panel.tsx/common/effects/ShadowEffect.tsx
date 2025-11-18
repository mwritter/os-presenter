import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Box, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ColorPicker } from "@/components/feature/ColorPicker/ColorPicker";
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
      color: "#000000",
      offsetX: 0,
      offsetY: 10,
      blurRadius: 10,
      spreadRadius: 0,
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs!" htmlFor="shape-shadow-offset-x">
            Offset X
          </Label>
          <Input
            className="text-xs! h-min w-[10ch]"
            type="number"
            step="1"
            value={state.offsetX}
            onChange={(e) => {
              const newState = { ...state, offsetX: Number(e.target.value) };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs!" htmlFor="shape-shadow-offset-y">
            Offset Y
          </Label>
          <Input
            className="text-xs! h-min w-[10ch]"
            type="number"
            step="1"
            value={state.offsetY}
            onChange={(e) => {
              const newState = { ...state, offsetY: Number(e.target.value) };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center justify-between gap-2">
          <Label className="text-xs!" htmlFor="shape-shadow-blur-radius">
            Blur
          </Label>
          <Input
            className="text-xs! h-min"
            type="number"
            step="1"
            value={state.blurRadius}
            onChange={(e) => {
              const newState = { ...state, blurRadius: Number(e.target.value) };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
        <div className="flex flex-1 items-center justify-between gap-2">
          <Label className="text-xs!" htmlFor="shape-shadow-spread-radius">
            Spread
          </Label>
          <Input
            className="text-xs! h-min"
            type="number"
            step="1"
            value={state.spreadRadius}
            onChange={(e) => {
              const newState = {
                ...state,
                spreadRadius: Number(e.target.value),
              };
              setState(newState);
              onChange(newState);
            }}
          />
        </div>
      </div>
    </div>
  );
};
