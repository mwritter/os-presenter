import { StateCreator } from "zustand";
import { SlideTagGroup } from "@/components/feature/slide/slide-tag/types";
import * as storage from "@/services/storage";
import { emitTagGroupsChanged } from "@/services/settings";

export interface TagGroupSlice {
  // State
  tagGroups: SlideTagGroup[];
  isTagGroupsLoading: boolean;
  tagGroupsError: string | null;

  // Actions
  loadTagGroups: () => Promise<void>;
  createTagGroup: (name: string, color: string) => Promise<SlideTagGroup>;
  updateTagGroup: (
    id: string,
    updates: Partial<Omit<SlideTagGroup, "id">>
  ) => Promise<void>;
  deleteTagGroup: (id: string) => Promise<void>;
  getTagGroupById: (id: string) => SlideTagGroup | undefined;
  
  // Sync actions (for cross-window communication)
  setTagGroups: (tagGroups: SlideTagGroup[]) => void;
}

const initialTagGroupState = {
  tagGroups: [] as SlideTagGroup[],
  isTagGroupsLoading: false,
  tagGroupsError: null as string | null,
};

export const createTagGroupSlice: StateCreator<
  TagGroupSlice,
  [],
  [],
  TagGroupSlice
> = (set, get) => ({
  ...initialTagGroupState,

  loadTagGroups: async () => {
    set({ isTagGroupsLoading: true, tagGroupsError: null });
    try {
      const tagGroups = await storage.loadTagGroups();
      set({ tagGroups, isTagGroupsLoading: false });
    } catch (error) {
      console.error("Failed to load tag groups:", error);
      set({
        tagGroupsError:
          error instanceof Error ? error.message : "Failed to load tag groups",
        isTagGroupsLoading: false,
      });
      throw error;
    }
  },

  createTagGroup: async (name: string, color: string) => {
    const newTagGroup: SlideTagGroup = {
      id: crypto.randomUUID(),
      name,
      color,
    };

    // Optimistically update state
    set((state) => ({
      tagGroups: [...state.tagGroups, newTagGroup],
    }));

    // Save to disk
    try {
      await storage.saveTagGroups(get().tagGroups);
      // Emit event for cross-window sync
      await emitTagGroupsChanged(get().tagGroups);
    } catch (error) {
      // Rollback on error
      set((state) => ({
        tagGroups: state.tagGroups.filter((tg) => tg.id !== newTagGroup.id),
        tagGroupsError:
          error instanceof Error ? error.message : "Failed to create tag group",
      }));
      throw error;
    }

    return newTagGroup;
  },

  updateTagGroup: async (
    id: string,
    updates: Partial<Omit<SlideTagGroup, "id">>
  ) => {
    const previousTagGroups = get().tagGroups;

    // Optimistically update state
    set((state) => ({
      tagGroups: state.tagGroups.map((tg) =>
        tg.id === id ? { ...tg, ...updates } : tg
      ),
    }));

    // Save to disk
    try {
      await storage.saveTagGroups(get().tagGroups);
      // Emit event for cross-window sync
      await emitTagGroupsChanged(get().tagGroups);
    } catch (error) {
      // Rollback on error
      set({
        tagGroups: previousTagGroups,
        tagGroupsError:
          error instanceof Error ? error.message : "Failed to update tag group",
      });
      throw error;
    }
  },

  deleteTagGroup: async (id: string) => {
    const previousTagGroups = get().tagGroups;

    // Optimistically update state
    set((state) => ({
      tagGroups: state.tagGroups.filter((tg) => tg.id !== id),
    }));

    // Save to disk
    try {
      await storage.saveTagGroups(get().tagGroups);
      // Emit event for cross-window sync
      await emitTagGroupsChanged(get().tagGroups);
    } catch (error) {
      // Rollback on error
      set({
        tagGroups: previousTagGroups,
        tagGroupsError:
          error instanceof Error ? error.message : "Failed to delete tag group",
      });
      throw error;
    }
  },

  getTagGroupById: (id: string) => {
    return get().tagGroups.find((tg) => tg.id === id);
  },

  // Sync action - updates local state without emitting events
  // Used by useSettingsSync to receive changes from other windows
  setTagGroups: (tagGroups: SlideTagGroup[]) => {
    set({ tagGroups });
  },
});

// Selectors for optimized component re-renders
export const selectTagGroups = (state: TagGroupSlice) => state.tagGroups;
export const selectIsTagGroupsLoading = (state: TagGroupSlice) =>
  state.isTagGroupsLoading;
export const selectTagGroupsError = (state: TagGroupSlice) =>
  state.tagGroupsError;

// Selector factory for getting a tag group by ID
export const selectTagGroupById = (id: string | undefined) => (state: TagGroupSlice) =>
  id ? state.tagGroups.find((tg) => tg.id === id) : undefined;

