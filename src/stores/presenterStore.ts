import { create } from "zustand";
import { Library, Playlist, SlideGroup } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import * as storage from "@/services/storage";

interface PresenterState {
  // State
  libraries: Library[];
  playlists: Playlist[];
  selectedLibraryId: string | null;
  selectedPlaylistId: string | null;
  selectedSlideGroup: {
    index: number; // Array index in library.slideGroups
    libraryId: string;
  } | null;
  selectedPlaylistItem: {
    id: string;
    playlistId: string;
  } | null;
  activeSlide: {
    id: string; // Globally unique slide ID
    data: SlideData; // Full slide data for audience view
  } | null;
  isLoading: boolean;

  // Library actions
  setLibraries: (libraries: Library[]) => void;
  addLibrary: (library: Library) => void;
  updateLibrary: (id: string, updates: Partial<Library>) => void;
  removeLibrary: (id: string) => void;
  addLibrarySlideGroup: (libraryId: string, slideGroup: SlideGroup) => void;
  addSlideToSlideGroup: (
    libraryId: string,
    slideGroupIndex: number,
    slideData?: SlideData
  ) => void;
  addSlideToSelectedSlideGroup: (slideData?: SlideData) => void;
  updateSlideInLibrary: (
    libraryId: string,
    slideGroupIndex: number,
    slideId: string,
    updates: Partial<SlideData>
  ) => void;

  // Playlist actions
  setPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;
  addSlideGroupToPlaylist: (
    playlistId: string,
    libraryId: string,
    slideGroupIndex: number
  ) => void;
  updatePlaylistItemSlideGroup: (
    playlistId: string,
    itemId: string,
    updates: Partial<SlideGroup>
  ) => void;
  addSlideToPlaylistItem: (
    playlistId: string,
    itemId: string,
    slideData?: SlideData
  ) => void;
  updateSlideInPlaylistItem: (
    playlistId: string,
    itemId: string,
    slideId: string,
    updates: Partial<SlideData>
  ) => void;

  // Selection actions
  selectLibrary: (id: string | null) => void;
  selectPlaylist: (id: string | null) => void;
  selectSlideGroup: (slideGroupIndex: number, libraryId: string) => void;
  selectPlaylistItem: (itemId: string, playlistId: string) => void;
  clearSlideGroupSelection: () => void;
  clearPlaylistItemSelection: () => void;

  // Active slide actions (for presenter/audience sync)
  setActiveSlide: (slideId: string, slideData: SlideData) => void;
  clearActiveSlide: () => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;

  // Persistence actions
  loadData: () => Promise<void>;
  saveLibraryToDisk: (library: Library) => Promise<void>;
  savePlaylistToDisk: (playlist: Playlist) => Promise<void>;

  // Reset
  reset: () => void;
}

const initialState = {
  libraries: [],
  playlists: [],
  selectedLibraryId: null,
  selectedPlaylistId: null,
  selectedSlideGroup: null,
  selectedPlaylistItem: null,
  activeSlide: null,
  isLoading: false,
};

export const usePresenterStore = create<PresenterState>((set, get) => ({
  ...initialState,

  // Library actions
  setLibraries: (libraries) => set({ libraries }),

  addLibrary: (library) => {
    console.log("Adding library:", library.name, library.id);
    set((state) => ({
      libraries: [...state.libraries, library],
    }));
    // Persist to disk asynchronously
    get()
      .saveLibraryToDisk(library)
      .then(() => console.log("Library saved to disk:", library.name))
      .catch((error) => {
        console.error("Failed to save library:", error);
      });
  },

  updateLibrary: (id, updates) => {
    let updatedLibrary: Library | undefined;
    set((state) => {
      const libraries = state.libraries.map((lib) => {
        if (lib.id === id) {
          updatedLibrary = {
            ...lib,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedLibrary;
        }
        return lib;
      });
      return { libraries };
    });
    // Persist to disk asynchronously
    if (updatedLibrary) {
      get().saveLibraryToDisk(updatedLibrary).catch(console.error);
    }
  },

  removeLibrary: (id) => {
    set((state) => ({
      libraries: state.libraries.filter((lib) => lib.id !== id),
      // Clear selection if the removed library was selected
      selectedLibraryId:
        state.selectedLibraryId === id ? null : state.selectedLibraryId,
    }));
    // Delete from disk asynchronously
    storage.deleteLibrary(id).catch(console.error);
  },

  addLibrarySlideGroup: (libraryId, slideGroup) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (library) {
      get().updateLibrary(libraryId, {
        slideGroups: [...library.slideGroups, slideGroup],
      });
    }
  },

  addSlideToSlideGroup: (libraryId, slideGroupIndex, slideData) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroup = library.slideGroups[slideGroupIndex];
    if (!slideGroup) return;

    // Generate unique slide ID: libraryId-shortUuid
    const shortId = crypto.randomUUID().split("-")[0];
    const uniqueSlideId = `${libraryId}-${shortId}`;

    // Create empty slide if no slideData provided
    const newSlide: SlideData = slideData ?? {
      id: uniqueSlideId,
    };

    // Ensure slide has the unique ID
    if (slideData) {
      newSlide.id = uniqueSlideId;
    }

    // Update the slideGroup with the new slide
    const updatedSlideGroups = library.slideGroups.map((sg, idx) =>
      idx === slideGroupIndex ? { ...sg, slides: [...sg.slides, newSlide] } : sg
    );

    get().updateLibrary(libraryId, {
      slideGroups: updatedSlideGroups,
    });
  },

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
        selectedSlideGroup.index,
        slideData
      );
    }
  },

  updateSlideInLibrary: (libraryId, slideGroupIndex, slideId, updates) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroup = library.slideGroups[slideGroupIndex];
    if (!slideGroup) return;

    // Update the specific slide in the slideGroup
    const updatedSlideGroups = library.slideGroups.map((sg, idx) =>
      idx === slideGroupIndex
        ? {
            ...sg,
            slides: sg.slides.map((slide) =>
              slide.id === slideId ? { ...slide, ...updates } : slide
            ),
          }
        : sg
    );

    get().updateLibrary(libraryId, {
      slideGroups: updatedSlideGroups,
    });
  },

  // Playlist actions
  setPlaylists: (playlists) => set({ playlists }),

  addPlaylist: (playlist) => {
    console.log("Adding playlist:", playlist.name, playlist.id);
    set((state) => ({
      playlists: [...state.playlists, playlist],
    }));
    // Persist to disk asynchronously
    get()
      .savePlaylistToDisk(playlist)
      .then(() => console.log("Playlist saved to disk:", playlist.name))
      .catch((error) => {
        console.error("Failed to save playlist:", error);
      });
  },

  updatePlaylist: (id, updates) => {
    let updatedPlaylist: Playlist | undefined;
    set((state) => {
      const playlists = state.playlists.map((pl) => {
        if (pl.id === id) {
          updatedPlaylist = {
            ...pl,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedPlaylist;
        }
        return pl;
      });
      return { playlists };
    });
    // Persist to disk asynchronously
    if (updatedPlaylist) {
      get().savePlaylistToDisk(updatedPlaylist).catch(console.error);
    }
  },

  removePlaylist: (id) => {
    set((state) => ({
      playlists: state.playlists.filter((pl) => pl.id !== id),
      // Clear selection if the removed playlist was selected
      selectedPlaylistId:
        state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
    }));
    // Delete from disk asynchronously
    storage.deletePlaylist(id).catch(console.error);
  },

  addSlideGroupToPlaylist: (playlistId, libraryId, slideGroupIndex) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    const slideGroup = library?.slideGroups[slideGroupIndex];

    if (!library || !slideGroup) {
      console.error("Library or slide group not found");
      return;
    }

    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) {
      console.error("Playlist not found");
      return;
    }

    // Create a deep copy of the slide group with new meta and regenerated slide IDs
    const slideGroupCopy: SlideGroup = {
      canvasSize: slideGroup.canvasSize,
      meta: {
        playlistId,
        originLibraryId: libraryId,
        originSlideGroupId: slideGroup.meta?.libraryId
          ? `${libraryId}-${slideGroupIndex}`
          : undefined,
      },
      title: slideGroup.title,
      // Deep copy slides with new unique IDs: playlistId-shortUuid
      slides: slideGroup.slides.map((slide) => {
        const shortId = crypto.randomUUID().split("-")[0];
        return {
          ...slide,
          id: `${playlistId}-${shortId}`,
        };
      }),
      createdAt: slideGroup.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Create new playlist item with embedded slide group
    const newItem = {
      id: crypto.randomUUID(),
      slideGroup: slideGroupCopy,
      order: playlist.items.length,
    };

    get().updatePlaylist(playlistId, {
      items: [...playlist.items, newItem],
    });
  },

  updatePlaylistItemSlideGroup: (playlistId, itemId, updates) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;

    const updatedItems = playlist.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          slideGroup: {
            ...item.slideGroup,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return item;
    });

    get().updatePlaylist(playlistId, { items: updatedItems });
  },

  addSlideToPlaylistItem: (playlistId, itemId, slideData) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;

    const item = playlist.items.find((i) => i.id === itemId);
    if (!item) return;

    // Generate unique slide ID: playlistId-shortUuid
    const shortId = crypto.randomUUID().split("-")[0];
    const uniqueSlideId = `${playlistId}-${shortId}`;

    // Create empty slide if no slideData provided
    const newSlide: SlideData = slideData ?? {
      id: uniqueSlideId,
    };

    // Ensure slide has the unique ID
    if (slideData) {
      newSlide.id = uniqueSlideId;
    }

    const updatedItems = playlist.items.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          slideGroup: {
            ...i.slideGroup,
            slides: [...i.slideGroup.slides, newSlide],
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return i;
    });

    get().updatePlaylist(playlistId, { items: updatedItems });
  },

  updateSlideInPlaylistItem: (playlistId, itemId, slideId, updates) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;

    const item = playlist.items.find((i) => i.id === itemId);
    if (!item) return;

    const updatedItems = playlist.items.map((i) => {
      if (i.id === itemId) {
        const updatedSlides = i.slideGroup.slides.map((slide) => {
          if (slide.id === slideId) {
            return { ...slide, ...updates };
          }
          return slide;
        });

        return {
          ...i,
          slideGroup: {
            ...i.slideGroup,
            slides: updatedSlides,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return i;
    });

    get().updatePlaylist(playlistId, { items: updatedItems });
  },

  // Selection actions
  selectLibrary: (id) =>
    set({
      selectedLibraryId: id,
      // Clear playlist selection when switching libraries
      selectedPlaylistId: null,
    }),

  selectPlaylist: (id) =>
    set({
      selectedPlaylistId: id,
      // Clear library selection when switching playlists
      selectedLibraryId: null,
    }),

  selectSlideGroup: (slideGroupIndex, libraryId) =>
    set({
      selectedSlideGroup: { index: slideGroupIndex, libraryId },
      selectedPlaylistItem: null,
    }),

  selectPlaylistItem: (itemId, playlistId) =>
    set({
      selectedPlaylistItem: { id: itemId, playlistId },
      selectedSlideGroup: null,
    }),

  clearSlideGroupSelection: () =>
    set({
      selectedSlideGroup: null,
    }),

  clearPlaylistItemSelection: () =>
    set({
      selectedPlaylistItem: null,
    }),

  // Active slide actions (for presenter/audience sync)
  setActiveSlide: (slideId, slideData) => {
    set({ activeSlide: { id: slideId, data: slideData } });

    // TODO: In the future, emit this to audience screens via Tauri events
    console.log("Active slide changed:", slideId, slideData);
  },

  clearActiveSlide: () => set({ activeSlide: null }),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Persistence actions
  loadData: async () => {
    console.log("Loading libraries and playlists from disk...");
    set({ isLoading: true });
    try {
      const [libraries, playlists] = await Promise.all([
        storage.loadLibraries(),
        storage.loadPlaylists(),
      ]);
      console.log(
        `Loaded ${libraries.length} libraries and ${playlists.length} playlists`
      );
      set({ libraries, playlists, isLoading: false });
    } catch (error) {
      console.error("Failed to load data:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  saveLibraryToDisk: async (library: Library) => {
    try {
      await storage.saveLibrary(library);
    } catch (error) {
      console.error("Failed to save library to disk:", error);
      throw error;
    }
  },

  savePlaylistToDisk: async (playlist: Playlist) => {
    try {
      await storage.savePlaylist(playlist);
    } catch (error) {
      console.error("Failed to save playlist to disk:", error);
      throw error;
    }
  },

  // Reset
  reset: () => set(initialState),
}));

// Selectors for optimized component re-renders
// Usage: const libraries = usePresenterStore(selectLibraries);
export const selectLibraries = (state: PresenterState) => state.libraries;
export const selectPlaylists = (state: PresenterState) => state.playlists;
export const selectSelectedLibraryId = (state: PresenterState) =>
  state.selectedLibraryId;
export const selectSelectedPlaylistId = (state: PresenterState) =>
  state.selectedPlaylistId;
export const selectSelectedSlideGroupId = (state: PresenterState) =>
  state.selectedSlideGroup?.index ?? null;
export const selectSelectedSlideGroup = (state: PresenterState) =>
  state.selectedSlideGroup ?? null;
export const selectIsLoading = (state: PresenterState) => state.isLoading;
export const selectSelectedLibrary = (state: PresenterState) =>
  state.libraries.find((lib) => lib.id === state.selectedLibraryId);
export const selectSelectedPlaylist = (state: PresenterState) =>
  state.playlists.find((pl) => pl.id === state.selectedPlaylistId);
export const selectSelectedSlideGroupData = (state: PresenterState) => {
  if (!state.selectedSlideGroup) return null;
  const { index, libraryId } = state.selectedSlideGroup;
  const library = state.libraries.find((lib) => lib.id === libraryId);
  return library?.slideGroups[index] ?? null;
};
export const selectSelectedPlaylistItemId = (state: PresenterState) =>
  state.selectedPlaylistItem?.id ?? null;
export const selectSelectedPlaylistItem = (state: PresenterState) =>
  state.selectedPlaylistItem ?? null;
export const selectSelectedPlaylistItemData = (state: PresenterState) => {
  if (!state.selectedPlaylistItem) return null;
  const { id, playlistId } = state.selectedPlaylistItem;
  const playlist = state.playlists.find((pl) => pl.id === playlistId);
  return playlist?.items.find((item) => item.id === id) ?? null;
};
export const selectPlaylistItemSlideGroup =
  (playlistId: string, itemId: string) => (state: PresenterState) => {
    const playlist = state.playlists.find((pl) => pl.id === playlistId);
    const item = playlist?.items.find((i) => i.id === itemId);
    return item?.slideGroup ?? null;
  };
export const selectActiveSlide = (state: PresenterState) => state.activeSlide;
export const selectActiveSlideId = (state: PresenterState) =>
  state.activeSlide?.id ?? null;
