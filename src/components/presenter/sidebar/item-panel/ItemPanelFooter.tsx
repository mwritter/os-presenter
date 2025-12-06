import { Button } from "@/components/ui/button";
import { ListFilterIcon, XIcon } from "lucide-react";
import { useItemPanelContext } from "./context";

export const ItemPanelFooter = () => {
  const { filter, setFilter } = useItemPanelContext();

  const clearFilter = () => {
    setFilter("");
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <div className="p-1">
      <div className="flex gap-2 pl-2 items-center justify-center p-1 border border-shade-1 rounded-xs focus-within:border-shade-lighter relative">
        <span className="py-1">
          <ListFilterIcon className="size-3 text-shade-lighter" />
        </span>
        <input
          value={filter ?? ""}
          onChange={handleFilterChange}
          type="text"
          placeholder="Filter"
          className="peer text-white w-full text-xs focus:ring-0 focus:outline-none"
        />
        <Button
          size="icon-xs"
          variant="ghost"
          className="peer-placeholder-shown:hidden"
          onClick={clearFilter}
        >
          <XIcon className="size-3 " />
        </Button>
      </div>
    </div>
  );
};
