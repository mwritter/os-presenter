import { create } from "zustand";
import { createTagGroupSlice, TagGroupSlice } from "./slices/tagGroupSlice";

// Combined settings store type
// Add additional settings slices here as they are created
type SettingsStore = TagGroupSlice & {
  // Cross-slice actions
  loadSettings: () => Promise<void>;
};

// Create the combined settings store
export const useSettingsStore = create<SettingsStore>()((set, get, api) => {
  const tagGroupSlice = createTagGroupSlice(set, get, api);

  return {
    ...tagGroupSlice,

    // Load all settings data
    loadSettings: async () => {
      await Promise.all([tagGroupSlice.loadTagGroups()]);
    },
  };
});

// Individual slice hooks for specific settings
export const useTagGroupStore = <T>(selector: (state: TagGroupSlice) => T): T =>
  useSettingsStore(selector as (state: SettingsStore) => T);

// Convenience hook for settings actions
export const useSettingsActions = () =>
  useSettingsStore((state) => ({
    loadSettings: state.loadSettings,
  }));

// Re-export selectors from slices
export {
  selectTagGroups,
  selectTagGroupById,
  selectIsTagGroupsLoading,
  selectTagGroupsError,
} from "./slices/tagGroupSlice";

