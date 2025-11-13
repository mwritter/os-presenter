import { EditConfigPanelTabs } from "./EditConfigPanelTabs";
import { EditConfigPanelFooter } from "./EditConfigPanelFooter";

export const EditConfigPanel = () => {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-shade-2">
      <EditConfigPanelTabs />
      <EditConfigPanelFooter />
    </div>
  );
};
