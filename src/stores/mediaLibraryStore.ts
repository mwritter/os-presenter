import { create } from 'zustand';
import { ImageObject, SlideData, VideoObject } from '@/components/feature/slide/types';
import * as storage from '@/services/storage';
import { DEFAULT_CANVAS_PRESET } from '@/consts/canvas';

export type MediaType = 'image' | 'video';

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
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() } 
          : item
      ),
    })),
  
  removeMediaItem: (id) => {
    set((state) => ({
      mediaItems: state.mediaItems.filter((item) => item.id !== id),
      // Clear selection if the removed item was selected
      selectedMediaId: state.selectedMediaId === id ? null : state.selectedMediaId,
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
        selectedMediaId: state.selectedMediaId && idsSet.has(state.selectedMediaId) 
          ? null 
          : state.selectedMediaId,
      };
    });
    // Delete from disk asynchronously
    Promise.all(ids.map((id) => storage.deleteMediaItem(id))).catch(console.error);
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
      console.error('Failed to load media items:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  importMedia: async (sourcePath: string) => {
    set({ isLoading: true });
    try {
      const mediaItem = await storage.importMediaFile(sourcePath);
      set((state) => ({
        mediaItems: [...state.mediaItems, mediaItem],
        isLoading: false,
      }));
      return mediaItem;
    } catch (error) {
      console.error('Failed to import media:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  getMediaUrl: async (fileName: string) => {
    try {
      return await storage.getMediaFileUrl(fileName);
    } catch (error) {
      console.error('Failed to get media URL:', error);
      throw error;
    }
  },
  
  // Reset
  reset: () => set(initialState),
}));

// Selectors for optimized component re-renders
// Usage: const mediaItems = useMediaLibraryStore(selectMediaItems);
export const selectMediaItems = (state: MediaLibraryState) => state.mediaItems;
export const selectSelectedMediaId = (state: MediaLibraryState) => state.selectedMediaId;
export const selectIsLoading = (state: MediaLibraryState) => state.isLoading;
export const selectSelectedMedia = (state: MediaLibraryState) =>
  state.mediaItems.find((item) => item.id === state.selectedMediaId);
export const selectImageMedia = (state: MediaLibraryState) =>
  state.mediaItems.filter((item) => item.type === 'image');
export const selectVideoMedia = (state: MediaLibraryState) =>
  state.mediaItems.filter((item) => item.type === 'video');

// Helper function to convert MediaItem to SlideData for use with Slide component
// Currently always show the image or video as Full HD (1920x1080)
export const mediaItemToSlideData = (mediaItem: MediaItem): SlideData => {

  const imageProps = {
    id: mediaItem.id,
    type: 'image',
    src: mediaItem.source,
    position: { x: 0, y: 0 },
    size: DEFAULT_CANVAS_PRESET.value,
    zIndex: 0,
    rotation: 0,
    objectFit: 'contain',
  } satisfies ImageObject;

  const videoProps = {
    id: mediaItem.id,
    type: 'video',
    src: mediaItem.source,
    position: { x: 0, y: 0 },
    size: DEFAULT_CANVAS_PRESET.value,
    zIndex: 0,
    rotation: 0,
    autoPlay: false,
    loop: true,
    muted: true,
  } satisfies VideoObject;

  return {
    id: `media-${mediaItem.id}`,
    objects: mediaItem.type === 'image' ? [imageProps] : [videoProps],
  };
};

