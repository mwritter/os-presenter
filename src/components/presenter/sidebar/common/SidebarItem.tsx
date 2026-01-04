import { cn } from "@/lib/utils";

interface SidebarItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}
export const SidebarItem = ({
  icon,
  children,
  className,
}: SidebarItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-1 py-0.5",
        className
      )}
    >
      {icon && (
        <div className="shrink-0 size-3.5 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="relative w-full gap-2 text-white text-xs whitespace-nowrap text-ellipsis overflow-hidden">
        {children}
      </div>
    </div>
  );
};
