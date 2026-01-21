import { create } from "zustand";
import * as storage from "@/services/storage";
import { generateVideoThumbnail } from "@/utils/generateVideoThumbnail";

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  source: string; // Path or URL to the media file
  thumbnail?: string; // Optional thumbnail path/URL
  duration?: number; // For videos, duration in seconds
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>; // For any additional metadata
  hash?: string; // SHA256 hash for deduplication
}

export interface MediaPlaylist {
  id: string;
  name: string;
  mediaItems: MediaItem[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy alias for backwards compatibility
export type MediaLibrarySidebarPlaylistItem = MediaPlaylist;

export interface MediaLibraryState {
  // State
  playlists: MediaPlaylist[];
  selectedPlaylistId: string | null;
  selectedMediaId: string | null;
  isLoading: boolean;

  // Playlist actions
  setPlaylists: (playlists: MediaPlaylist[]) => void;
  addPlaylist: (playlist: MediaPlaylist) => void;
  updatePlaylist: (id: string, updates: Partial<MediaPlaylist>) => void;
  removePlaylist: (id: string) => void;
  selectPlaylist: (id: string | null) => void;
  reorderPlaylists: (playlists: MediaPlaylist[]) => void;

  // Media actions within playlists
  addMediaToPlaylist: (playlistId: string, item: MediaItem) => void;
  removeMediaFromPlaylist: (playlistId: string, mediaId: string) => void;
  updateMediaInPlaylist: (
    playlistId: string,
    mediaId: string,
    updates: Partial<MediaItem>
  ) => void;
  reorderMediaItemsInPlaylist: (
    playlistId: string,
    mediaItems: MediaItem[]
  ) => void;

  // Selection actions
  selectMedia: (id: string | null) => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;

  // Utility actions
  getPlaylistById: (id: string) => MediaPlaylist | undefined;
  getMediaById: (mediaId: string) => MediaItem | undefined;
  getMediaByType: (type: MediaType) => MediaItem[];
  getAllMediaItems: () => MediaItem[];
  getSelectedPlaylist: () => MediaPlaylist | undefined;

  // Persistence actions
  loadData: () => Promise<void>;
  savePlaylist: (playlist: MediaPlaylist) => Promise<void>;
  createPlaylist: (name?: string) => Promise<MediaPlaylist>;
  importMedia: (sourcePath: string, playlistId?: string) => Promise<MediaItem>;
  getMediaUrl: (fileName: string) => Promise<string>;

  // Reset
  reset: () => void;
}

const initialState = {
  playlists: [] as MediaPlaylist[],
  selectedPlaylistId: null as string | null,
  selectedMediaId: null as string | null,
  isLoading: false,
};

const DEFAULT_PLAYLIST_NAME = "Imported Media";

export const useMediaLibraryStore = create<MediaLibraryState>((set, get) => ({
  ...initialState,

  // Playlist actions
  setPlaylists: (playlists) => set({ playlists }),

  addPlaylist: (playlist) =>
    set((state) => ({
      playlists: [...state.playlists, playlist],
    })),

  updatePlaylist: (id, updates) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === id
          ? { ...playlist, ...updates, updatedAt: new Date() }
          : playlist
      ),
    }));
    // Save updated playlist to disk
    const updatedPlaylist = get().playlists.find((p) => p.id === id);
    if (updatedPlaylist) {
      storage.saveMediaPlaylist(updatedPlaylist).catch(console.error);
    }
  },

  removePlaylist: (id) => {
    set((state) => ({
      playlists: state.playlists.filter((playlist) => playlist.id !== id),
      selectedPlaylistId:
        state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
    }));
    // Delete from disk asynchronously
    storage.deleteMediaPlaylist(id).catch(console.error);
  },

  selectPlaylist: (id) => set({ selectedPlaylistId: id }),

  reorderPlaylists: (playlists) => {
    set({ playlists });
    // Save all reordered playlists to disk
    playlists.forEach((playlist) => {
      storage.saveMediaPlaylist(playlist).catch(console.error);
    });
  },

  // Media actions within playlists
  addMediaToPlaylist: (playlistId, item) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems: [...playlist.mediaItems, item],
              updatedAt: new Date(),
            }
          : playlist
      ),
    }));
    // Save updated playlist to disk
    const updatedPlaylist = get().playlists.find((p) => p.id === playlistId);
    if (updatedPlaylist) {
      storage.saveMediaPlaylist(updatedPlaylist).catch(console.error);
    }
  },

  removeMediaFromPlaylist: (playlistId, mediaId) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems: playlist.mediaItems.filter(
                (item) => item.id !== mediaId
              ),
              updatedAt: new Date(),
            }
          : playlist
      ),
      selectedMediaId:
        state.selectedMediaId === mediaId ? null : state.selectedMediaId,
    }));
    // Save updated playlist to disk
    const updatedPlaylist = get().playlists.find((p) => p.id === playlistId);
    if (updatedPlaylist) {
      storage.saveMediaPlaylist(updatedPlaylist).catch(console.error);
    }
    // Delete the actual media file from disk
    storage.deleteMediaItem(mediaId).catch(console.error);
  },

  updateMediaInPlaylist: (playlistId, mediaId, updates) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems: playlist.mediaItems.map((item) =>
                item.id === mediaId
                  ? { ...item, ...updates, updatedAt: new Date() }
                  : item
              ),
              updatedAt: new Date(),
            }
          : playlist
      ),
    }));
    // Save updated playlist to disk
    const updatedPlaylist = get().playlists.find((p) => p.id === playlistId);
    if (updatedPlaylist) {
      storage.saveMediaPlaylist(updatedPlaylist).catch(console.error);
    }
  },

  reorderMediaItemsInPlaylist: (playlistId, mediaItems) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              mediaItems,
              updatedAt: new Date(),
            }
          : playlist
      ),
    }));
    // Save updated playlist to disk
    const updatedPlaylist = get().playlists.find((p) => p.id === playlistId);
    if (updatedPlaylist) {
      storage.saveMediaPlaylist(updatedPlaylist).catch(console.error);
    }
  },

  // Selection actions
  selectMedia: (id) => set({ selectedMediaId: id }),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Utility actions
  getPlaylistById: (id) => {
    const state = get();
    return state.playlists.find((playlist) => playlist.id === id);
  },

  getMediaById: (mediaId) => {
    const state = get();
    for (const playlist of state.playlists) {
      const item = playlist.mediaItems.find((item) => item.id === mediaId);
      if (item) return item;
    }
    return undefined;
  },

  getMediaByType: (type) => {
    const state = get();
    return state.playlists.flatMap((playlist) =>
      playlist.mediaItems.filter((item) => item.type === type)
    );
  },

  getAllMediaItems: () => {
    const state = get();
    return state.playlists.flatMap((playlist) => playlist.mediaItems);
  },

  getSelectedPlaylist: () => {
    const state = get();
    return state.playlists.find(
      (playlist) => playlist.id === state.selectedPlaylistId
    );
  },

  // Persistence actions
  loadData: async () => {
    set({ isLoading: true });
    try {
      const playlists = await storage.loadMediaPlaylists();
      // Auto-select first playlist if none selected
      const selectedPlaylistId = playlists.length > 0 ? playlists[0].id : null;
      set({ playlists, selectedPlaylistId, isLoading: false });
    } catch (error) {
      console.error("Failed to load media playlists:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  savePlaylist: async (playlist: MediaPlaylist) => {
    try {
      await storage.saveMediaPlaylist(playlist);
    } catch (error) {
      console.error("Failed to save playlist:", error);
      throw error;
    }
  },

  createPlaylist: async (name?: string) => {
    const now = new Date();
    const newPlaylist: MediaPlaylist = {
      id: crypto.randomUUID(),
      name: name || "New Playlist",
      mediaItems: [],
      order: get().playlists.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    // Add to state
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
      selectedPlaylistId: newPlaylist.id,
    }));

    // Save to disk
    try {
      await storage.saveMediaPlaylist(newPlaylist);
    } catch (error) {
      console.error("Failed to save new playlist:", error);
      // Rollback state on error
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== newPlaylist.id),
      }));
      throw error;
    }

    return newPlaylist;
  },

  importMedia: async (sourcePath: string, playlistId?: string) => {
    set({ isLoading: true });
    try {
      let mediaItem = await storage.importMediaFile(sourcePath);

      // Determine target playlist
      let targetPlaylistId = playlistId || get().selectedPlaylistId;

      // Check if this media item already exists in any playlist (deduplication)
      const existingItem = get()
        .getAllMediaItems()
        .find(
          (item) => item.id === mediaItem.id || item.hash === mediaItem.hash
        );

      if (existingItem) {
        console.log(
          "Media item already exists in library, reusing:",
          mediaItem.id
        );
        set({ isLoading: false });
        return existingItem;
      }

      // Generate thumbnail for video files (only for new items)
      if (mediaItem.type === "video") {
        try {
          console.log("Generating thumbnail for video:", mediaItem.id);
          const thumbnailBlob = await generateVideoThumbnail(mediaItem.source);

          if (thumbnailBlob) {
            const thumbnailFilename = await storage.saveThumbnail(
              mediaItem.id,
              thumbnailBlob
            );
            mediaItem = await storage.updateMediaThumbnail(
              mediaItem.id,
              thumbnailFilename
            );
            console.log("Thumbnail generated successfully:", thumbnailFilename);
          } else {
            console.warn(
              "Failed to generate thumbnail for video:",
              mediaItem.id
            );
          }
        } catch (thumbnailError) {
          console.error("Error generating thumbnail:", thumbnailError);
        }
      }

      // If no playlist exists, create a default one
      if (
        !targetPlaylistId ||
        !get().playlists.find((p) => p.id === targetPlaylistId)
      ) {
        const newPlaylist: MediaPlaylist = {
          id: crypto.randomUUID(),
          name: DEFAULT_PLAYLIST_NAME,
          mediaItems: [mediaItem],
          order: get().playlists.length + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          playlists: [...state.playlists, newPlaylist],
          selectedPlaylistId: newPlaylist.id,
          isLoading: false,
        }));

        // Save the new playlist to disk
        await storage.saveMediaPlaylist(newPlaylist);
        return mediaItem;
      }

      // Add to existing playlist
      set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === targetPlaylistId
            ? {
                ...playlist,
                mediaItems: [...playlist.mediaItems, mediaItem],
                updatedAt: new Date(),
              }
            : playlist
        ),
        isLoading: false,
      }));

      // Save updated playlist to disk
      const updatedPlaylist = get().playlists.find(
        (p) => p.id === targetPlaylistId
      );
      if (updatedPlaylist) {
        await storage.saveMediaPlaylist(updatedPlaylist);
      }

      return mediaItem;
    } catch (error) {
      console.error("Failed to import media:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  getMediaUrl: async (fileName: string) => {
    try {
      return await storage.getMediaFileUrl(fileName);
    } catch (error) {
      console.error("Failed to get media URL:", error);
      throw error;
    }
  },

  // Reset
  reset: () => set(initialState),
}));

// Selectors for optimized component re-renders
// Usage: const playlists = useMediaLibraryStore(selectPlaylists);
export const selectPlaylists = (state: MediaLibraryState) => state.playlists;
export const selectSelectedPlaylistId = (state: MediaLibraryState) =>
  state.selectedPlaylistId;
export const selectSelectedPlaylist = (state: MediaLibraryState) =>
  state.playlists.find((p) => p.id === state.selectedPlaylistId);
export const selectSelectedMediaId = (state: MediaLibraryState) =>
  state.selectedMediaId;
export const selectIsLoading = (state: MediaLibraryState) => state.isLoading;

// Get all media items across all playlists
export const selectAllMediaItems = (state: MediaLibraryState) =>
  state.playlists.flatMap((playlist) => playlist.mediaItems);

// Get media items from selected playlist
export const selectMediaItems = (state: MediaLibraryState) => {
  const selectedPlaylist = state.playlists.find(
    (p) => p.id === state.selectedPlaylistId
  );
  return selectedPlaylist?.mediaItems ?? [];
};

export const selectSelectedMedia = (state: MediaLibraryState) => {
  for (const playlist of state.playlists) {
    const item = playlist.mediaItems.find(
      (item) => item.id === state.selectedMediaId
    );
    if (item) return item;
  }
  return undefined;
};

export const selectImageMedia = (state: MediaLibraryState) =>
  state.playlists.flatMap((playlist) =>
    playlist.mediaItems.filter((item) => item.type === "image")
  );

export const selectVideoMedia = (state: MediaLibraryState) =>
  state.playlists.flatMap((playlist) =>
    playlist.mediaItems.filter((item) => item.type === "video")
  );
