import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const ShowViewFooter = ({
  onAddBlankSlide,
}: {
  onAddBlankSlide: () => void;
}) => {
  return (
    <div className="flex w-full h-10 items-center justify-between bg-shade-3 px-2 absolute bottom-0 left-0 right-0">
      <Button
        className="text-gray-400 rounded-sm hover:text-gray-400 hover:bg-white/10"
        variant="ghost"
        size="icon-xs"
        onClick={onAddBlankSlide}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
