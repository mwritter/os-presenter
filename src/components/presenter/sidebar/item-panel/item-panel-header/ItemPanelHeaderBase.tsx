import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemPanelHeaderBaseProps {
  itemCount: number;
  onAdd: (e: React.MouseEvent) => void;
}

export const ItemPanelHeaderBase = ({
  itemCount,
  onAdd,
}: ItemPanelHeaderBaseProps) => {
  return (
    <div className="flex justify-between items-center text-[10px] uppercase p-2 bg-shade-3">
      <span className="text-gray-400">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      <Button
        className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-gray-400"
        variant="ghost"
        size="icon-xs"
        onClick={onAdd}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
