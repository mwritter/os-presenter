import { StateCreator } from "zustand";
import { Playlist, SlideGroup } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import * as storage from "@/services/storage";
import { createDefaultTextObject } from "../utils/createDefaultTextObject";
import { LibrarySlice } from "./librarySlice";

export interface PlaylistSlice {
  playlists: Playlist[];
  isPlaylistLoading: boolean;

  // Actions
  setPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;
  removePlaylistItem: (playlistId: string, itemId: string) => void;
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

  // Persistence
  loadPlaylists: () => Promise<void>;
  savePlaylistToDisk: (playlist: Playlist) => Promise<void>;
}

export const createPlaylistSlice: StateCreator<
  PlaylistSlice & LibrarySlice,
  [],
  [],
  PlaylistSlice
> = (set, get) => ({
  playlists: [],
  isPlaylistLoading: false,

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
    }));
    // Delete from disk asynchronously
    storage.deletePlaylist(id).catch(console.error);
  },

  removePlaylistItem: (playlistId, itemId) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) {
      console.error("Playlist not found");
      return;
    }

    // Filter out the item to remove
    const updatedItems = playlist.items.filter((item) => item.id !== itemId);

    // Update the playlist with the filtered items
    get().updatePlaylist(playlistId, { items: updatedItems });
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

    // Create slide with default text object if no slideData provided
    const newSlide: SlideData = slideData ?? {
      id: uniqueSlideId,
      objects: [createDefaultTextObject(item.slideGroup.canvasSize)],
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

  loadPlaylists: async () => {
    console.log("Loading playlists from disk...");
    set({ isPlaylistLoading: true });
    try {
      const playlists = await storage.loadPlaylists();
      console.log(`Loaded ${playlists.length} playlists`);
      set({ playlists, isPlaylistLoading: false });
    } catch (error) {
      console.error("Failed to load playlists:", error);
      set({ isPlaylistLoading: false });
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
});

