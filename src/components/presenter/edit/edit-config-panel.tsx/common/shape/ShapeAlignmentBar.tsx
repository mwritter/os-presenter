import { Button } from "@/components/ui/button";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";

export const ShapeAlignmentBar = () => {
  return (
    <div className="flex items-center gap-1">
      <ShapeAlignmentVerticalControls />
      <ShapeAlignmentHorizontalControls />
    </div>
  );
};

// Aligns the slide object vertically
const ShapeAlignmentVerticalControls = () => {
  return (
    <div className="flex items-center flex-1 bg-shade-1 rounded-sm">
      <Button
        className="size-6 flex-1 rounded-sm rounded-br-none rounded-tr-none"
        variant="ghost"
        size="icon-sm"
      >
        <AlignStartVertical className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-none border-x border-x-shade-2"
        variant="ghost"
        size="icon-sm"
      >
        <AlignCenterVertical className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none"
        variant="ghost"
        size="icon-sm"
      >
        <AlignEndVertical className="size-3" />
      </Button>
    </div>
  );
};

// Aligns the slide object horizontally
const ShapeAlignmentHorizontalControls = () => {
  return (
    <div className="flex items-center flex-1 bg-shade-1 rounded-sm">
      <Button
        className="flex-1 size-6 rounded-sm rounded-br-none rounded-tr-none"
        variant="ghost"
        size="icon-sm"
      >
        <AlignStartHorizontal className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-none border-x border-x-shade-2"
        variant="ghost"
        size="icon-sm"
      >
        <AlignCenterHorizontal className="size-3" />
      </Button>
      <Button
        className="flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none"
        variant="ghost"
        size="icon-sm"
      >
        <AlignEndHorizontal className="size-3" />
      </Button>
    </div>
  );
};
