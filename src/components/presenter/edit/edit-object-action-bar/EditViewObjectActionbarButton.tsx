import { Button, ButtonProps } from "@/components/ui/button";

export const EditViewObjectActionbarButton = ({
  icon,
  withOutDevider = false,
  ...props
}: ButtonProps & {
  icon: React.ReactNode;
  label: string;
  withOutDevider?: boolean;
}) => {
  return (
    <>
      <Button variant="ghost" size="sm" {...props}>
        <div className="px-2">{icon}</div>
      </Button>
      {!withOutDevider && <div className="h-[50%] w-px bg-white/10" />}
    </>
  );
};
