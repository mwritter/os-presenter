import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import {
  MAX_GRID_COLUMNS,
  MIN_GRID_COLUMNS,
  useShowViewContext,
} from "./context";

export const ShowViewFooter = ({
  onAddBlankSlide,
}: {
  onAddBlankSlide: () => void;
}) => {
  const { gridColumns, setGridColumns } = useShowViewContext();
  return (
    <div className="flex w-full h-10 items-center justify-between bg-shade-3 px-2 sticky bottom-0 left-0 right-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <Plus className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-shade-1/50 backdrop-blur-md border-none box-shadow-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddBlankSlide}
            className="w-full justify-start text-xs hover:bg-white/10!"
          >
            Add New Blank Slide
          </Button>
          <PopoverArrow className="fill-shade-1/50 backdrop-blur-md" />
        </PopoverContent>
      </Popover>
      <Slider
        id="show-view-grid-columns-control"
        value={[gridColumns]}
        max={MAX_GRID_COLUMNS - MIN_GRID_COLUMNS}
        min={1}
        step={1}
        onValueChange={(value) => setGridColumns(value[0])}
        className="w-24"
      />
    </div>
  );
};
