import { TagGroupsSection } from "@/components/settings/tag-groups/TagGroupsSection";
import { useSettingsStore } from "@/stores/settings/settingsStore";
import { useEffect } from "react";

const TagGroupsPage = () => {
  const tagGroups = useSettingsStore((state) => state.tagGroups);
  const isLoading = useSettingsStore((state) => state.isTagGroupsLoading);
  const loadTagGroups = useSettingsStore((state) => state.loadTagGroups);

  useEffect(() => {
    loadTagGroups();
  }, [loadTagGroups]);

  return <TagGroupsSection tagGroups={tagGroups} isLoading={isLoading} />;
};

export default TagGroupsPage;
