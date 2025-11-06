import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export const IconButton = ({
    Icon,
    label,
    active = false,
    children,
    ...props
  }: ButtonProps & { Icon?: LucideIcon; label: string; active?: boolean }) => {
      const buttonId = `toolbar-button-${label.toLowerCase().replace(" ", "-")}`;
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1", {
          "pointer-events-none ": active,
      })} >
        <Button
          id={buttonId}
          className={cn("flex flex-col items-center justify-center hover:bg-black/10 hover:text-gray-400 text-gray-400 px-5", {
              "bg-black/10 text-gray-400 pointer-events-none": active,
          })}
          variant="ghost"
          {...props}
        >
          {Icon ? <Icon className={cn("size-4", {
            "size-10": props.size === "icon-lg" || props.size === "icon-xl",
          })} /> : children}
        </Button>
        <label htmlFor={buttonId} className="text-gray-400 text-xs select-none">
          {label}
        </label>
      </div>
    );
  };