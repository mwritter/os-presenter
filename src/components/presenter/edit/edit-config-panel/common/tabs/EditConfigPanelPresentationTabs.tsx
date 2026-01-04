import { TabsContent, TabsList } from "@/components/ui/tabs";

import { Tabs } from "@/components/ui/tabs";
import { EditConfigPanelTabContent } from "../EditConfigPanelContent";
import { EditSlideConfigPanel } from "../../EditSlideConfigPanel";
import { EditPresentationConfigPanel } from "../../EditPresentationConfigPanel";
import { EditConfigPanelTabTrigger } from "../EditConfigPanelTabTrigger";

export const EditConfigPanelPresentationTabs = () => {
  return (
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
  );
};
