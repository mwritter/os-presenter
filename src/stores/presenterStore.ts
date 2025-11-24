import { create } from "zustand";
import { SlideData } from "@/components/feature/slide/types";
import * as storage from "@/services/storage";
import { createLibrarySlice, LibrarySlice } from "./slices/librarySlice";
import { createPlaylistSlice, PlaylistSlice } from "./slices/playlistSlice";
import { createSelectionSlice, SelectionSlice } from "./slices/selectionSlice";

// Combined store type
type PresenterStore = LibrarySlice &
  PlaylistSlice &
  SelectionSlice & {
    // Cross-slice actions
    addSlideToSelectedSlideGroup: (slideData?: SlideData) => void;
    loadData: () => Promise<void>;
    reset: () => void;
  };

// Create the combined store
export const usePresenterStore = create<PresenterStore>()((set, get, api) => {
  const librarySlice = createLibrarySlice(set, get, api);
  const playlistSlice = createPlaylistSlice(set, get, api);
  const selectionSlice = createSelectionSlice(set, get, api);

  return {
    ...librarySlice,
    ...playlistSlice,
    ...selectionSlice,

    // Override removeLibrary to clear selection if needed
    removeLibrary: (id: string) => {
      set((state) => ({
        libraries: state.libraries.filter((lib) => lib.id !== id),
        // Clear selection if the removed library was selected
        selectedLibraryId:
          state.selectedLibraryId === id ? null : state.selectedLibraryId,
        // Clear slide group selection if it belongs to the removed library
        selectedSlideGroup:
          state.selectedSlideGroup?.libraryId === id
            ? null
            : state.selectedSlideGroup,
      }));
      // Delete from disk asynchronously
      storage.deleteLibrary(id).catch(console.error);
    },

    // Override removePlaylist to clear selection if needed
    removePlaylist: (id: string) => {
      set((state) => ({
        playlists: state.playlists.filter((pl) => pl.id !== id),
        // Clear selection if the removed playlist was selected
        selectedPlaylistId:
          state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
      }));
      // Delete from disk asynchronously
      storage.deletePlaylist(id).catch(console.error);
    },

    // Override removePlaylistItem to clear selection if needed
    removePlaylistItem: (playlistId: string, itemId: string) => {
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist) {
        console.error("Playlist not found");
        return;
      }

      // Filter out the item to remove
      const updatedItems = playlist.items.filter((item) => item.id !== itemId);

      // Update the playlist with the filtered items
      playlistSlice.updatePlaylist(playlistId, { items: updatedItems });

      // Clear selection if the removed item was selected
      const state = get();
      if (state.selectedPlaylistItem?.id === itemId) {
        selectionSlice.clearPlaylistItemSelection();
      }
    },

    // Cross-slice actions that need access to multiple slices
    addSlideToSelectedSlideGroup: (slideData) => {
      const state = get();
      const selectedSlideGroup = state.selectedSlideGroup;
      const selectedPlaylistItem = state.selectedPlaylistItem;

      // If viewing a playlist item, add to playlist item's slide group
      if (selectedPlaylistItem) {
        state.addSlideToPlaylistItem(
          selectedPlaylistItem.playlistId,
          selectedPlaylistItem.id,
          slideData
        );
      }
      // Otherwise add to library slide group
      else if (selectedSlideGroup) {
        state.addSlideToSlideGroup(
          selectedSlideGroup.libraryId,
          selectedSlideGroup.id,
          slideData
        );
      }
    },

    loadData: async () => {
      console.log("Loading libraries and playlists from disk...");
      set({ isLibraryLoading: true, isPlaylistLoading: true });
      try {
        const [libraries, playlists] = await Promise.all([
          storage.loadLibraries(),
          storage.loadPlaylists(),
        ]);
        console.log(
          `Loaded ${libraries.length} libraries and ${playlists.length} playlists`
        );
        set({
          libraries,
          playlists,
          isLibraryLoading: false,
          isPlaylistLoading: false,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        set({ isLibraryLoading: false, isPlaylistLoading: false });
        throw error;
      }
    },

    reset: () => {
      set({
        libraries: [],
        playlists: [],
        selectedLibraryId: null,
        selectedPlaylistId: null,
        selectedSlideGroup: null,
        selectedPlaylistItem: null,
        activeSlide: null,
        isLibraryLoading: false,
        isPlaylistLoading: false,
      });
    },
  };
});

// Individual store hooks for specific slices
export const useLibraryStore = <T>(selector: (state: LibrarySlice) => T): T =>
  usePresenterStore(selector as (state: PresenterStore) => T);

export const usePlaylistStore = <T>(selector: (state: PlaylistSlice) => T): T =>
  usePresenterStore(selector as (state: PresenterStore) => T);

export const useSelectionStore = <T>(
  selector: (state: SelectionSlice) => T
): T => usePresenterStore(selector as (state: PresenterStore) => T);

// Convenience hook for cross-slice actions
export const usePresenterActions = () =>
  usePresenterStore((state) => ({
    addSlideToSelectedSlideGroup: state.addSlideToSelectedSlideGroup,
    loadData: state.loadData,
    reset: state.reset,
  }));

// Computed selectors that require cross-slice data
export const useSelectedLibrary = () =>
  usePresenterStore((state) =>
    state.libraries.find((lib) => lib.id === state.selectedLibraryId)
  );

export const useSelectedPlaylist = () =>
  usePresenterStore((state) =>
    state.playlists.find((pl) => pl.id === state.selectedPlaylistId)
  );

export const useSelectedSlideGroupData = () =>
  usePresenterStore((state) => {
    if (!state.selectedSlideGroup) return null;
    const { id, libraryId } = state.selectedSlideGroup;
    const library = state.libraries.find((lib) => lib.id === libraryId);
    return library?.slideGroups.find((sg) => sg.id === id) ?? null;
  });

export const useSelectedPlaylistItemData = () =>
  usePresenterStore((state) => {
    if (!state.selectedPlaylistItem) return null;
    const { id, playlistId } = state.selectedPlaylistItem;
    const playlist = state.playlists.find((pl) => pl.id === playlistId);
    return playlist?.items.find((item) => item.id === id) ?? null;
  });

export const usePlaylistItemSlideGroup = (playlistId: string, itemId: string) =>
  usePresenterStore((state) => {
    const playlist = state.playlists.find((pl) => pl.id === playlistId);
    const item = playlist?.items.find((i) => i.id === itemId);
    return item?.slideGroup ?? null;
  });
