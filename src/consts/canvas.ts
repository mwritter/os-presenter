import { CanvasSize } from "@/components/presenter/types";

export const CANVAS_PRESETS: { id: string;label: string; value: CanvasSize }[] = [
    { id: "hd", label: "HD (1280 x 720)", value: { width: 1280, height: 720 } },
    { id: "full-hd", label: "Full HD (1920 x 1080)", value: { width: 1920, height: 1080 } },
    { id: "4k", label: "4K (3840 x 2160)", value: { width: 3840, height: 2160 } },
    { id: "4:3", label: "4:3 (1024 x 768)", value: { width: 1024, height: 768 } },
  ];
  
export const DEFAULT_CANVAS_PRESET = CANVAS_PRESETS[1]; // Full HD