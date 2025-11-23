import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Plus } from "lucide-react";

export const ShowViewFooter = ({
  onAddBlankSlide,
}: {
  onAddBlankSlide: () => void;
}) => {
  return (
    <div className="flex w-full h-10 items-center justify-between bg-shade-3 px-2 sticky bottom-0 left-0 right-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-xs">
            <Plus className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddBlankSlide}
            className="w-full justify-start text-xs hover:bg-white/10!"
          >
            Add New Blank Slide
          </Button>
          <PopoverArrow className="fill-shade-1" />
        </PopoverContent>
      </Popover>
    </div>
  );
};
