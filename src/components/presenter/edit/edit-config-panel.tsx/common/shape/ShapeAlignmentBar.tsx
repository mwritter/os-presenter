import { Button } from "@/components/ui/button";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";

type AlignmentBarProps = {
  currentPosition: { x: number; y: number };
  objectSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  onAlign: (position: { x: number; y: number }) => void;
};

export const ShapeAlignmentBar = ({
  currentPosition,
  objectSize,
  canvasSize,
  onAlign,
}: AlignmentBarProps) => {
  return (
    <div className="flex items-center gap-1">
      <ShapeAlignmentVerticalControls
        currentPosition={currentPosition}
        objectSize={objectSize}
        canvasSize={canvasSize}
        onAlign={onAlign}
      />
      <ShapeAlignmentHorizontalControls
        currentPosition={currentPosition}
        objectSize={objectSize}
        canvasSize={canvasSize}
        onAlign={onAlign}
      />
    </div>
  );
};

// Aligns the slide object vertically
const ShapeAlignmentVerticalControls = ({
  currentPosition,
  objectSize,
  canvasSize,
  onAlign,
}: AlignmentBarProps) => {
  const alignTop = () => {
    const x = currentPosition.x; // Keep current x position
    const y = 0; // Align to top
    onAlign({ x, y });
  };

  const alignMiddle = () => {
    const x = currentPosition.x; // Keep current x position
    const y = (canvasSize.height - objectSize.height) / 2; // Center vertically
    onAlign({ x, y });
  };

  const alignBottom = () => {
    const x = currentPosition.x; // Keep current x position
    const y = canvasSize.height - objectSize.height; // Align to bottom
    onAlign({ x, y });
  };

  return (
    <div className="flex items-center flex-1 bg-shade-1 rounded-sm">
      <Button
        className="size-6 flex-1 rounded-sm rounded-br-none rounded-tr-none"
        variant="ghost"
        size="icon-sm"
        onClick={alignTop}
      >
        <AlignStartHorizontal className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-none border-x border-x-shade-2"
        variant="ghost"
        size="icon-sm"
        onClick={alignMiddle}
      >
        <AlignCenterHorizontal className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none"
        variant="ghost"
        size="icon-sm"
        onClick={alignBottom}
      >
        <AlignEndHorizontal className="size-3" />
      </Button>
    </div>
  );
};

// Aligns the slide object horizontally
const ShapeAlignmentHorizontalControls = ({
  currentPosition,
  objectSize,
  canvasSize,
  onAlign,
}: AlignmentBarProps) => {
  const alignLeft = () => {
    const x = 0; // Align to left
    const y = currentPosition.y; // Keep current y position
    onAlign({ x, y });
  };

  const alignCenter = () => {
    const x = (canvasSize.width - objectSize.width) / 2; // Center horizontally
    const y = currentPosition.y; // Keep current y position
    onAlign({ x, y });
  };

  const alignRight = () => {
    const x = canvasSize.width - objectSize.width; // Align to right
    const y = currentPosition.y; // Keep current y position
    onAlign({ x, y });
  };

  return (
    <div className="flex items-center flex-1 bg-shade-1 rounded-sm">
      <Button
        className="flex-1 size-6 rounded-sm rounded-br-none rounded-tr-none"
        variant="ghost"
        size="icon-sm"
        onClick={alignLeft}
      >
        <AlignStartVertical className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-none border-x border-x-shade-2"
        variant="ghost"
        size="icon-sm"
        onClick={alignCenter}
      >
        <AlignCenterVertical className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none"
        variant="ghost"
        size="icon-sm"
        onClick={alignRight}
      >
        <AlignEndVertical className="size-3" />
      </Button>
    </div>
  );
};
