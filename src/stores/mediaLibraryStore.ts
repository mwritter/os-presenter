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

export interface MediaLibraryState {
  // State
  mediaItems: MediaItem[];
  selectedMediaId: string | null;
  isLoading: boolean;

  // Media actions
  setMediaItems: (items: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  addMediaItems: (items: MediaItem[]) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  removeMediaItem: (id: string) => void;
  removeMediaItems: (ids: string[]) => void;

  // Selection actions
  selectMedia: (id: string | null) => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;

  // Utility actions
  getMediaById: (id: string) => MediaItem | undefined;
  getMediaByType: (type: MediaType) => MediaItem[];

  // Persistence actions
  loadData: () => Promise<void>;
  importMedia: (sourcePath: string) => Promise<MediaItem>;
  getMediaUrl: (fileName: string) => Promise<string>;

  // Reset
  reset: () => void;
}

const initialState = {
  mediaItems: [],
  selectedMediaId: null,
  isLoading: false,
};

export const useMediaLibraryStore = create<MediaLibraryState>((set, get) => ({
  ...initialState,

  // Media actions
  setMediaItems: (items) => set({ mediaItems: items }),

  addMediaItem: (item) =>
    set((state) => ({
      mediaItems: [...state.mediaItems, item],
    })),

  addMediaItems: (items) =>
    set((state) => ({
      mediaItems: [...state.mediaItems, ...items],
    })),

  updateMediaItem: (id, updates) =>
    set((state) => ({
      mediaItems: state.mediaItems.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    })),

  removeMediaItem: (id) => {
    set((state) => ({
      mediaItems: state.mediaItems.filter((item) => item.id !== id),
      // Clear selection if the removed item was selected
      selectedMediaId:
        state.selectedMediaId === id ? null : state.selectedMediaId,
    }));
    // Delete from disk asynchronously
    storage.deleteMediaItem(id).catch(console.error);
  },

  removeMediaItems: (ids) => {
    set((state) => {
      const idsSet = new Set(ids);
      return {
        mediaItems: state.mediaItems.filter((item) => !idsSet.has(item.id)),
        // Clear selection if the removed items included the selected one
        selectedMediaId:
          state.selectedMediaId && idsSet.has(state.selectedMediaId)
            ? null
            : state.selectedMediaId,
      };
    });
    // Delete from disk asynchronously
    Promise.all(ids.map((id) => storage.deleteMediaItem(id))).catch(
      console.error
    );
  },

  // Selection actions
  selectMedia: (id) => set({ selectedMediaId: id }),

  // Loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Utility actions
  getMediaById: (id) => {
    const state = get();
    return state.mediaItems.find((item) => item.id === id);
  },

  getMediaByType: (type) => {
    const state = get();
    return state.mediaItems.filter((item) => item.type === type);
  },

  // Persistence actions
  loadData: async () => {
    set({ isLoading: true });
    try {
      const items = await storage.loadMediaItems();
      set({ mediaItems: items, isLoading: false });
    } catch (error) {
      console.error("Failed to load media items:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  importMedia: async (sourcePath: string) => {
    set({ isLoading: true });
    try {
      let mediaItem = await storage.importMediaFile(sourcePath);
      
      // Check if this media item already exists in our state (deduplication)
      const existingItem = get().mediaItems.find((item) => item.id === mediaItem.id);
      
      if (existingItem) {
        console.log("Media item already exists in library, reusing:", mediaItem.id);
        set({ isLoading: false });
        return existingItem;
      }
      
      // Generate thumbnail for video files (only for new items)
      if (mediaItem.type === "video") {
        try {
          console.log("Generating thumbnail for video:", mediaItem.id);
          const thumbnailBlob = await generateVideoThumbnail(mediaItem.source);
          
          if (thumbnailBlob) {
            // Save the thumbnail
            const thumbnailFilename = await storage.saveThumbnail(
              mediaItem.id,
              thumbnailBlob
            );
            
            // Update media item metadata with thumbnail
            mediaItem = await storage.updateMediaThumbnail(
              mediaItem.id,
              thumbnailFilename
            );
            
            console.log("Thumbnail generated successfully:", thumbnailFilename);
          } else {
            console.warn("Failed to generate thumbnail for video:", mediaItem.id);
          }
        } catch (thumbnailError) {
          // Log error but don't fail the import
          console.error("Error generating thumbnail:", thumbnailError);
        }
      }
      
      // Add the new media item to state
      set((state) => ({
        mediaItems: [...state.mediaItems, mediaItem],
        isLoading: false,
      }));
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
// Usage: const mediaItems = useMediaLibraryStore(selectMediaItems);
export const selectMediaItems = (state: MediaLibraryState) => state.mediaItems;
export const selectSelectedMediaId = (state: MediaLibraryState) =>
  state.selectedMediaId;
export const selectIsLoading = (state: MediaLibraryState) => state.isLoading;
export const selectSelectedMedia = (state: MediaLibraryState) =>
  state.mediaItems.find((item) => item.id === state.selectedMediaId);
export const selectImageMedia = (state: MediaLibraryState) =>
  state.mediaItems.filter((item) => item.type === "image");
export const selectVideoMedia = (state: MediaLibraryState) =>
  state.mediaItems.filter((item) => item.type === "video");
