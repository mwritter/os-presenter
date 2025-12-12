import { cn } from "@/lib/utils";

export const SearchItem = ({
  title,
  library,
  isSelected,
  onClick,
}: {
  title?: string;
  library?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <li
      className={cn(
        "border-b first-of-type:border-t py-1 px-2 w-full flex items-center justify-between",
        {
          "bg-selected": isSelected,
        }
      )}
      onClick={onClick}
    >
      <p className={cn("text-xs", { "text-transparent": !title })}>
        {title ?? "Presentation 1"}
      </p>
      <p
        className={cn("text-muted-foreground text-xs", {
          "text-transparent": !library,
        })}
      >
        {library ?? "Library 1"}
      </p>
    </li>
  );
};
