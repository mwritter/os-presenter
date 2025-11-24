import { StateCreator } from "zustand";
import { SlideData } from "@/components/feature/slide/types";
import { CanvasSize } from "@/components/presenter/types";
import { emit } from "@tauri-apps/api/event";

export interface SelectionSlice {
  selectedLibraryId: string | null;
  selectedPlaylistId: string | null;
  selectedSlideGroup: {
    id: string; // SlideGroup ID
    libraryId: string;
  } | null;
  selectedPlaylistItem: {
    id: string;
    playlistId: string;
  } | null;
  activeSlide: {
    id: string; // Globally unique slide ID
    data: SlideData; // Full slide data for audience view
    canvasSize: CanvasSize; // Canvas size for proper rendering
  } | null;

  // Actions
  selectLibrary: (id: string | null) => void;
  selectPlaylist: (id: string | null) => void;
  selectSlideGroup: (slideGroupId: string, libraryId: string) => void;
  selectPlaylistItem: (itemId: string, playlistId: string) => void;
  clearSlideGroupSelection: () => void;
  clearPlaylistItemSelection: () => void;
  setActiveSlide: (
    slideId: string,
    slideData: SlideData,
    canvasSize?: CanvasSize
  ) => void;
  clearActiveSlide: () => void;
}

export const createSelectionSlice: StateCreator<
  SelectionSlice,
  [],
  [],
  SelectionSlice
> = (set) => ({
  selectedLibraryId: null,
  selectedPlaylistId: null,
  selectedSlideGroup: null,
  selectedPlaylistItem: null,
  activeSlide: null,

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

  selectSlideGroup: (slideGroupId, libraryId) =>
    set({
      selectedSlideGroup: { id: slideGroupId, libraryId },
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

  setActiveSlide: (slideId, slideData, canvasSize = { width: 1920, height: 1080 }) => {
    // Migration: Add videoType to video objects that don't have it (for backwards compatibility)
    const migratedData = {
      ...slideData,
      objects: slideData.objects?.map((obj) => {
        if (obj.type === "video" && !obj.videoType) {
          // Default to 'background' for videos without videoType (from media library)
          return { ...obj, videoType: "background" as const };
        }
        return obj;
      }),
    };

    const activeSlide = { id: slideId, data: migratedData, canvasSize };
    set({ activeSlide });

    // Emit Tauri event to audience windows
    emit("active-slide-changed", activeSlide).catch((error) => {
      console.error("Failed to emit active-slide-changed event:", error);
    });
  },

  clearActiveSlide: () => {
    set({ activeSlide: null });
    
    // Emit clear event to audience windows
    emit("active-slide-changed", null).catch((error) => {
      console.error("Failed to emit active-slide-changed event:", error);
    });
  },
});

