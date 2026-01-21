import { Circle, Shapes, Square, Triangle } from "lucide-react";
import { useEditContext } from "@/pages/presenter/edit/context";
import { EditViewObjectActionbarButton } from "./EditViewObjectActionbarButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export const AddShapeActionbarButton = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { addShapeObject } = useEditContext();

  const handleAddShape = (shape: "rectangle" | "circle" | "triangle") => {
    addShapeObject(shape);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditViewObjectActionbarButton
          icon={<Shapes />}
          label="Shape"
          disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-1 w-[150px] grid bg-shade-1/50 backdrop-blur-md box-shadow-md mr-2"
        sideOffset={5}
      >
        <p className="text-[10px] font-bold opacity-25 mb-1">Shapes</p>
        <div className="flex flex-col gap-1">
          <ShapeButton
            shape="rectangle"
            onClick={() => handleAddShape("rectangle")}
          />
          <ShapeButton
            shape="circle"
            onClick={() => handleAddShape("circle")}
          />
          <ShapeButton
            shape="triangle"
            onClick={() => handleAddShape("triangle")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ShapeButton = ({
  shape,
  onClick,
}: {
  shape: "rectangle" | "circle" | "triangle";
  onClick: () => void;
}) => {
  const getShapeIcon = (shapeType: "rectangle" | "circle" | "triangle") => {
    switch (shapeType) {
      case "rectangle":
        return <Square className="size-2" />;
      case "circle":
        return <Circle className="size-2" />;
      case "triangle":
        return <Triangle className="size-2" />;
    }
  };

  return (
    <button
      className="text-xs text-left hover:bg-white/10 rounded-md p-1"
      onClick={onClick}
    >
      <span className="flex items-center gap-1">
        {getShapeIcon(shape)}
        <span className="text-xs capitalize">{shape}</span>
      </span>
    </button>
  );
};
