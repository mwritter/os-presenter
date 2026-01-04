import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const EditSideGroupPanelHeader = ({
  title = "",
}: {
  title?: string;
}) => {
  return (
    <div className="px-2 py-0.5 flex justify-between items-center">
      <p className="text-white text-xs font-bold">{title}</p>
      <Button variant="ghost" size="icon-xs">
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
};
