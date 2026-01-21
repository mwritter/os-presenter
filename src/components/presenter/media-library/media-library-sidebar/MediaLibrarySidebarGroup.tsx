import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown, Folder } from "lucide-react";
import { useState } from "react";

export const MediaLibrarySidebarGroup = ({
  title,
  items,
}: {
  title: string;
  items: any[];
}) => {
  const [open, setOpen] = useState(false);
  const hasItems = items.length > 0;
  return (
    <div className="w-full">
      <Collapsible className="flex flex-col" open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <MediaLibrarySidebarGroupHeader title={title} open={open} />
        </CollapsibleTrigger>
        <CollapsibleContent
          className={cn(
            "overflow-hidden text-ellipsis relative",
            "data-[state=open]:animate-collapsible-open",
            "data-[state=closed]:animate-collapsible-close",
            "before:content-[''] before:absolute before:inset-0 before:left-2 before:top-0 before:h-full before:w-[2px] before:bg-white/25"
          )}
        >
          {hasItems && (
            <>
              <Spacer />
              {items.map((_item) => ({
                /* TODO: Groups can hold items or other groups */
              }))}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const Spacer = () => {
  return <div className="h-2" />;
};

export const MediaLibrarySidebarGroupHeader = ({
  title,
  open,
}: {
  title: string;
  open: boolean;
}) => {
  return (
    <div className="flex w-full items-center text-white text-xs px-1">
      <div className="flex items-center gap-2 flex-1 text-ellipsis overflow-hidden">
        <Folder className="size-4 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <ChevronDown
        className={cn(
          "size-3 transition-transform duration-200",
          open ? "rotate-180" : ""
        )}
      />
    </div>
  );
};
