export type ShadowEffectType = {
  type: "shadow";
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
};

export type EffectType = {
  shadow?: ShadowEffectType;
};
