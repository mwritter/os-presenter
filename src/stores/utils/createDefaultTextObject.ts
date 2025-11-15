import { TextObject } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";

// Helper function to create a default text object centered on the slide at 75% size
export const createDefaultTextObject = (canvasSize: CanvasSize): TextObject => {
  const width = canvasSize.width * 0.75;
  const height = canvasSize.height * 0.75;
  const x = (canvasSize.width - width) / 2;
  const y = (canvasSize.height - height) / 2;

  return {
    id: crypto.randomUUID(),
    type: "text",
    position: { x, y },
    size: { width, height },
    scaleX: 1,
    scaleY: 1,
    zIndex: 1,
    content: "",
    fontSize: 48,
    color: "#FFFFFF",
    alignment: "center",
    fontFamily: "Arial",
    fontStyle: "normal",
  };
};
