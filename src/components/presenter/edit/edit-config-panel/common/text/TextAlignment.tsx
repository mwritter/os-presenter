import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
} from "lucide-react";
import { TextAlignment as TextAlignmentType } from "@/components/feature/slide/types";

export const TextAlignment = ({
  value,
  onChange,
}: {
  value: TextAlignmentType;
  onChange: (alignment: TextAlignmentType) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <TextAlignmentHorizontalControls
        alignment={value.horizontal}
        setAlignment={(horizontal) => onChange({ ...value, horizontal })}
      />
      <TextAlignmentVerticalControls
        alignment={value.vertical}
        setAlignment={(vertical) => onChange({ ...value, vertical })}
      />
    </div>
  );
};

const TextAlignmentHorizontalControls = ({
  alignment,
  setAlignment,
}: {
  alignment: "left" | "center" | "right";
  setAlignment: (alignment: "left" | "center" | "right") => void;
}) => {
  return (
    <div className="flex items-center bg-shade-1 rounded-sm">
      <Button
        className={cn(
          "flex-1 size-6 rounded-sm rounded-br-none rounded-tr-none",
          {
            "bg-shade-lighter hover:bg-shade-lighter!": alignment === "left",
          }
        )}
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("left")}
      >
        <AlignLeft className="size-3" />
      </Button>
      <Button
        className={cn("flex-1 size-6 rounded-none border-x border-x-shade-2", {
          "bg-shade-lighter hover:bg-shade-lighter!": alignment === "center",
        })}
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("center")}
      >
        <AlignCenter className="size-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("right")}
        className={cn(
          "flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none",
          {
            "bg-shade-lighter hover:bg-shade-lighter!": alignment === "right",
          }
        )}
      >
        <AlignRight className="size-3" />
      </Button>
    </div>
  );
};

const TextAlignmentVerticalControls = ({
  alignment,
  setAlignment,
}: {
  alignment: "top" | "center" | "bottom";
  setAlignment: (alignment: "top" | "center" | "bottom") => void;
}) => {
  const isTop = alignment === "top";
  const isCenter = alignment === "center";
  const isBottom = alignment === "bottom";
  return (
    <div className="flex items-center bg-shade-1 rounded-sm">
      <Button
        className={cn(
          "flex-1 size-6 rounded-sm rounded-br-none rounded-tr-none border-r border-r-shade-2",
          {
            "bg-shade-lighter hover:bg-shade-lighter!": isTop,
          }
        )}
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("top")}
      >
        <AlignStartHorizontal className="size-3" />
      </Button>
      <Button
        className={cn("flex-1 size-6 rounded-none border-r border-x-shade-2", {
          "bg-shade-lighter hover:bg-shade-lighter!": isCenter,
        })}
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("center")}
      >
        <AlignCenterHorizontal className="size-3" />
      </Button>
      <Button
        className={cn(
          "flex-1 size-6 rounded-sm rounded-bl-none rounded-tl-none",
          {
            "bg-shade-lighter hover:bg-shade-lighter!": isBottom,
          }
        )}
        variant="ghost"
        size="icon-sm"
        onClick={() => setAlignment("bottom")}
      >
        <AlignEndHorizontal className="size-3" />
      </Button>
    </div>
  );
};
