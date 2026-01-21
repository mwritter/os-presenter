import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type TagGroupsFooterProps = {
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onAdd?: () => void;
};

export const TagGroupsFooter = ({
  selectedCount = 0,
  onDeleteSelected,
  onAdd,
}: TagGroupsFooterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon-xs" onClick={onAdd}>
        <Plus />
      </Button>
      <span className="text-white/10 text-xs">|</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
      >
        <Minus />
      </Button>
    </div>
  );
};
