import { TabsTrigger } from "@/components/ui/tabs";

export const EditConfigPanelTabTrigger = ({
  value,
  children,
}: React.ComponentProps<typeof TabsTrigger> & {
  value: string;
  children: React.ReactNode;
}) => {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-blue-500! text-xs p-1 rounded-none"
    >
      {children}
    </TabsTrigger>
  );
};
