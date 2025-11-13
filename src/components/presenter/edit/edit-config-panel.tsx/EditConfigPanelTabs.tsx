// Tab bar that changes based on whats selected
// If no slide object is selected, show [presentation | slide] tabs
// If a slide object is selected, show [shape | text] tab

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditPresentationConfigPanel } from "./EditPresentationConfigPanel";
import { EditSlideConfigPanel } from "./EditSlideConfigPanel";

// Looks like all objects can have text added to them will have to look into this more, currently only text objects have text

export const EditConfigPanelTabs = () => {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <Tabs defaultValue="presentation" className="w-full">
        <TabsList className="w-full rounded-none bg-shade-1 p-0 h-min">
          <EditConfigPanelTabTrigger value="presentation">
            Presentation
          </EditConfigPanelTabTrigger>
          <EditConfigPanelTabTrigger value="slide">
            Slide
          </EditConfigPanelTabTrigger>
          <EditConfigPanelTabTrigger value="build">
            Build
          </EditConfigPanelTabTrigger>
        </TabsList>
        <TabsContent value="presentation">
          <EditConfigPanelTabContent>
            <EditPresentationConfigPanel />
          </EditConfigPanelTabContent>
        </TabsContent>
        <TabsContent value="slide">
          <EditConfigPanelTabContent>
            <EditSlideConfigPanel />
          </EditConfigPanelTabContent>
        </TabsContent>
        <TabsContent value="build">
          <EditConfigPanelTabContent>Build Config</EditConfigPanelTabContent>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EditConfigPanelTabTrigger = ({
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

const EditConfigPanelTabContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex flex-col h-full w-full p-2">{children}</div>;
};
