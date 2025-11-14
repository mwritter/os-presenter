import { TabsContent, TabsList } from "@/components/ui/tabs";

import { Tabs } from "@/components/ui/tabs";
import { EditConfigPanelTabContent } from "../EditConfigPanelContent";
import { EditConfigPanelTabTrigger } from "../EditConfigPanelTabTrigger";
import { EditShapeConfigPanel } from "../../EditShapeConfigPanel";
import { EditTextConfigPanel } from "../../EditTextConfigPanel";

export const EditConfigPanelSlideTabs = () => {
  return (
    <Tabs
      defaultValue="shape"
      className="w-full h-full overflow-y-auto  overscroll-none relative"
    >
      <TabsList className="w-full rounded-none bg-shade-1 p-0 h-min sticky top-0 z-10">
        <EditConfigPanelTabTrigger value="shape">
          Shape
        </EditConfigPanelTabTrigger>
        <EditConfigPanelTabTrigger value="text">Text</EditConfigPanelTabTrigger>
        <EditConfigPanelTabTrigger value="build">
          Build
        </EditConfigPanelTabTrigger>
      </TabsList>
      <TabsContent value="shape">
        <EditConfigPanelTabContent>
          <EditShapeConfigPanel />
        </EditConfigPanelTabContent>
      </TabsContent>
      <TabsContent value="text">
        <EditConfigPanelTabContent>
          <EditTextConfigPanel />
        </EditConfigPanelTabContent>
      </TabsContent>
      <TabsContent value="build">
        <EditConfigPanelTabContent>
          <div>Build Config</div>
        </EditConfigPanelTabContent>
      </TabsContent>
    </Tabs>
  );
};
