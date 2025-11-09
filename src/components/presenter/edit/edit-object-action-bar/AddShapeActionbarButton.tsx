import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Circle, Shapes, Square } from "lucide-react";
import { useEditContext } from "@/presenter/edit/context";
import { EditViewObjectActionbarButton } from "./EditViewObjectActionbarButton";

export const AddShapeActionbarButton = () => {
  const { addShapeObject } = useEditContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EditViewObjectActionbarButton icon={<Shapes />} label="Shape" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => addShapeObject("rectangle")}>
          <Square className="mr-2 h-4 w-4" />
          Rectangle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addShapeObject("circle")}>
          <Circle className="mr-2 h-4 w-4" />
          Circle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addShapeObject("triangle")}>
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2 L22 22 L2 22 Z" />
          </svg>
          Triangle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
