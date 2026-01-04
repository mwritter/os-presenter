import { Label } from "@/components/ui/label";
import { ShadowEffect } from "./ShadowEffect";
import { ShadowEffectType } from "./types";
import {
  Effect as EffectType,
  ShadowEffect as ShadowEffectData,
} from "@/components/feature/slide/types";

export const Effect = ({
  value,
  onChange,
}: {
  value?: EffectType;
  onChange: (effect: EffectType | undefined) => void;
}) => {
  const handleShadowChange = (shadow: ShadowEffectType | undefined) => {
    if (!shadow) {
      // If shadow is removed and no other effects, remove the entire effect object
      const newEffect = value ? { ...value, shadow: undefined } : undefined;
      const hasAnyEffect =
        newEffect && Object.values(newEffect).some((v) => v !== undefined);
      onChange(hasAnyEffect ? newEffect : undefined);
    } else {
      // Convert ShadowEffectType to ShadowEffect (remove the 'type' property)
      const shadowData: ShadowEffectData = {
        color: shadow.color,
        offsetX: shadow.offsetX,
        offsetY: shadow.offsetY,
        blurRadius: shadow.blurRadius,
      };
      onChange({ ...value, shadow: shadowData });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs!">Effects</Label>
      </div>
      <div className="flex flex-col gap-2 py-1">
        <ShadowEffect
          value={
            value?.shadow
              ? { type: "shadow" as const, ...value.shadow }
              : undefined
          }
          onChange={handleShadowChange}
        />
      </div>
    </div>
  );
};
