import { create } from 'zustand';
import { Library, Playlist, SlideGroup } from '@/components/presenter/types';
import { SlideData } from '@/components/feature/slide/types';
import * as storage from '@/services/storage';

interface PresenterState {
  // State
  libraries: Library[];
  playlists: Playlist[];
  selectedLibraryId: string | null;
  selectedPlaylistId: string | null;
  selectedSlideGroup: {
    id: string;
    libraryId: string;
  } | null;
  selectedPlaylistItem: {
    id: string;
    playlistId: string;
  } | null;
  isLoading: boolean;

  // Library actions
  setLibraries: (libraries: Library[]) => void;
  addLibrary: (library: Library) => void;
  updateLibrary: (id: string, updates: Partial<Library>) => void;
  removeLibrary: (id: string) => void;
  addLibrarySlideGroup: (libraryId: string, slideGroup: SlideGroup) => void;
  addSlideToSlideGroup: (libraryId: string, slideGroupId: string, slideData?: SlideData) => void;
  addSlideToSelectedSlideGroup: (slideData?: SlideData) => void;
  
  // Playlist actions
  setPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;

  // Selection actions
  selectLibrary: (id: string | null) => void;
  selectPlaylist: (id: string | null) => void;
  selectSlideGroup: (slideGroupId: string, libraryId: string) => void;
  selectPlaylistItem: (itemId: string, playlistId: string) => void;
  clearSlideGroupSelection: () => void;
  clearPlaylistItemSelection: () => void;

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
  isLoading: false,
};

export const usePresenterStore = create<PresenterState>((set, get) => ({
  ...initialState,

  // Library actions
  setLibraries: (libraries) => set({ libraries }),
  
  addLibrary: (library) => {
    console.log('Adding library:', library.name, library.id);
    set((state) => ({
      libraries: [...state.libraries, library],
    }));
    // Persist to disk asynchronously
    get().saveLibraryToDisk(library)
      .then(() => console.log('Library saved to disk:', library.name))
      .catch((error) => {
        console.error('Failed to save library:', error);
      });
  },
  
  updateLibrary: (id, updates) => {
    let updatedLibrary: Library | undefined;
    set((state) => {
      const libraries = state.libraries.map((lib) => {
        if (lib.id === id) {
          updatedLibrary = { ...lib, ...updates, updatedAt: new Date().toISOString() };
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
      selectedLibraryId: state.selectedLibraryId === id ? null : state.selectedLibraryId,
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

  addSlideToSlideGroup: (libraryId, slideGroupId, slideData) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroup = library.slideGroups.find((sg) => sg.id === slideGroupId);
    if (!slideGroup) return;

    // Create empty slide if no slideData provided
    const newSlide: SlideData = slideData ?? {
      id: crypto.randomUUID(),
    };

    // Update the slideGroup with the new slide
    const updatedSlideGroups = library.slideGroups.map((sg) =>
      sg.id === slideGroupId
        ? { ...sg, slides: [...sg.slides, newSlide] }
        : sg
    );

    get().updateLibrary(libraryId, {
      slideGroups: updatedSlideGroups,
    });
  },

  addSlideToSelectedSlideGroup: (slideData) => {
    const selectedSlideGroup = get().selectedSlideGroup;
    if (!selectedSlideGroup) return;

    get().addSlideToSlideGroup(
      selectedSlideGroup.libraryId,
      selectedSlideGroup.id,
      slideData
    );
  },

  // Playlist actions
  setPlaylists: (playlists) => set({ playlists }),
  
  addPlaylist: (playlist) => {
    console.log('Adding playlist:', playlist.name, playlist.id);
    set((state) => ({
      playlists: [...state.playlists, playlist],
    }));
    // Persist to disk asynchronously
    get().savePlaylistToDisk(playlist)
      .then(() => console.log('Playlist saved to disk:', playlist.name))
      .catch((error) => {
        console.error('Failed to save playlist:', error);
      });
  },
  
  updatePlaylist: (id, updates) => {
    let updatedPlaylist: Playlist | undefined;
    set((state) => {
      const playlists = state.playlists.map((pl) => {
        if (pl.id === id) {
          updatedPlaylist = { ...pl, ...updates, updatedAt: new Date().toISOString() };
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
      selectedPlaylistId: state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
    }));
    // Delete from disk asynchronously
    storage.deletePlaylist(id).catch(console.error);
  },

  // Selection actions
  selectLibrary: (id) =>
    set({
      selectedLibraryId: id,
      // Clear playlist selection when switching libraries
      // Keep slideGroup/playlistItem selection so Show view persists
      selectedPlaylistId: null,
    }),
  
  selectPlaylist: (id) =>
    set({
      selectedPlaylistId: id,
      // Clear library selection when switching playlists
      // Keep slideGroup/playlistItem selection so Show view persists
      selectedLibraryId: null,
    }),
  
  selectSlideGroup: (slideGroupId, libraryId) =>
    set({
      selectedSlideGroup: { id: slideGroupId, libraryId },
    }),
  
  selectPlaylistItem: (itemId, playlistId) =>
    set({
      selectedPlaylistItem: { id: itemId, playlistId },
    }),
  
  clearSlideGroupSelection: () =>
    set({
      selectedSlideGroup: null,
    }),
  
  clearPlaylistItemSelection: () =>
    set({
      selectedPlaylistItem: null,
    }),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Persistence actions
  loadData: async () => {
    console.log('Loading libraries and playlists from disk...');
    set({ isLoading: true });
    try {
      const [libraries, playlists] = await Promise.all([
        storage.loadLibraries(),
        storage.loadPlaylists(),
      ]);
      console.log(`Loaded ${libraries.length} libraries and ${playlists.length} playlists`);
      set({ libraries, playlists, isLoading: false });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  saveLibraryToDisk: async (library: Library) => {
    try {
      await storage.saveLibrary(library);
    } catch (error) {
      console.error('Failed to save library to disk:', error);
      throw error;
    }
  },

  savePlaylistToDisk: async (playlist: Playlist) => {
    try {
      await storage.savePlaylist(playlist);
    } catch (error) {
      console.error('Failed to save playlist to disk:', error);
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
export const selectSelectedLibraryId = (state: PresenterState) => state.selectedLibraryId;
export const selectSelectedPlaylistId = (state: PresenterState) => state.selectedPlaylistId;
export const selectSelectedSlideGroupId = (state: PresenterState) => state.selectedSlideGroup?.id ?? null;
export const selectSelectedSlideGroup = (state: PresenterState) => state.selectedSlideGroup ?? null;
export const selectIsLoading = (state: PresenterState) => state.isLoading;
export const selectSelectedLibrary = (state: PresenterState) =>
  state.libraries.find((lib) => lib.id === state.selectedLibraryId);
export const selectSelectedPlaylist = (state: PresenterState) =>
  state.playlists.find((pl) => pl.id === state.selectedPlaylistId);
export const selectSelectedSlideGroupData = (state: PresenterState) => {
  if (!state.selectedSlideGroup) return null;
  // Use the libraryId hint for O(n) + O(m) lookup instead of O(n × m)
  const { id, libraryId } = state.selectedSlideGroup;
  const library = state.libraries.find(lib => lib.id === libraryId);
  return library?.slideGroups.find(sg => sg.id === id) ?? null;
};
export const selectSelectedPlaylistItemId = (state: PresenterState) => state.selectedPlaylistItem?.id ?? null;
export const selectSelectedPlaylistItem = (state: PresenterState) => state.selectedPlaylistItem ?? null;
export const selectSelectedPlaylistItemData = (state: PresenterState) => {
  if (!state.selectedPlaylistItem) return null;
  const { id, playlistId } = state.selectedPlaylistItem;
  const playlist = state.playlists.find(pl => pl.id === playlistId);
  return playlist?.items.find(item => item.id === id) ?? null;
};

