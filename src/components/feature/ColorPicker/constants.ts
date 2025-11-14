import { HsvaColor } from "@uiw/react-color";

export const DEFAULT_COLOR_SWATCH_SHADES: Record<
  "blue" | "green" | "yellow" | "orange" | "red" | "purple",
  HsvaColor[]
> = {
  blue: [
    { h: 217, s: 91, v: 98, a: 1 }, // #60A5FA
    { h: 217, s: 91, v: 97, a: 1 }, // #3B82F6
    { h: 217, s: 91, v: 92, a: 1 }, // #2563EB
    { h: 217, s: 91, v: 69, a: 1 }, // #1E40AF
  ],
  green: [
    { h: 142, s: 69, v: 87, a: 1 }, // #4ADE80
    { h: 142, s: 76, v: 77, a: 1 }, // #22C55E
    { h: 142, s: 85, v: 64, a: 1 }, // #16A34A
    { h: 142, s: 84, v: 50, a: 1 }, // #15803D
  ],
  yellow: [
    { h: 48, s: 96, v: 99, a: 1 }, // #FDE047
    { h: 45, s: 93, v: 98, a: 1 }, // #FACC15
    { h: 43, s: 96, v: 92, a: 1 }, // #EAB308
    { h: 40, s: 98, v: 79, a: 1 }, // #CA8A04
  ],
  orange: [
    { h: 20, s: 91, v: 98, a: 1 }, // #FB923C
    { h: 20, s: 91, v: 98, a: 1 }, // #F97316
    { h: 17, s: 95, v: 92, a: 1 }, // #EA580C
    { h: 17, s: 90, v: 76, a: 1 }, // #C2410C
  ],
  red: [
    { h: 0, s: 77, v: 97, a: 1 }, // #F87171
    { h: 0, s: 77, v: 94, a: 1 }, // #EF4444
    { h: 0, s: 84, v: 86, a: 1 }, // #DC2626
    { h: 0, s: 84, v: 73, a: 1 }, // #B91C1C
  ],
  purple: [
    { h: 270, s: 67, v: 99, a: 1 }, // #C084FC
    { h: 270, s: 76, v: 97, a: 1 }, // #A855F7
    { h: 271, s: 91, v: 92, a: 1 }, // #9333EA
    { h: 271, s: 83, v: 81, a: 1 }, // #7E22CE
  ],
} as const;
