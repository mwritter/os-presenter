import { useEditContext } from "@/presenter/edit/context";
import { EditConfigPanelSlideTabs } from "./common/tabs/EditConfigPanelSlideTabs";
import { EditConfigPanelPresentationTabs } from "./common/tabs/EditConfigPanelPresentationTabs";

export const EditConfigPanelTabs = () => {
  const { selectedObjectId } = useEditContext();
  const isSlideObjectSelected = selectedObjectId !== null;

  return (
    <div className="flex flex-1 flex-col w-full overflow-hidden">
      {isSlideObjectSelected ? (
        <EditConfigPanelSlideTabs />
      ) : (
        <EditConfigPanelPresentationTabs />
      )}
    </div>
  );
};
