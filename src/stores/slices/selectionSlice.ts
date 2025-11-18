import { StateCreator } from "zustand";
import { SlideData } from "@/components/feature/slide/types";

export interface SelectionSlice {
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

  // Actions
  selectLibrary: (id: string | null) => void;
  selectPlaylist: (id: string | null) => void;
  selectSlideGroup: (slideGroupIndex: number, libraryId: string) => void;
  selectPlaylistItem: (itemId: string, playlistId: string) => void;
  clearSlideGroupSelection: () => void;
  clearPlaylistItemSelection: () => void;
  setActiveSlide: (slideId: string, slideData: SlideData) => void;
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

  setActiveSlide: (slideId, slideData) => {
    set({ activeSlide: { id: slideId, data: slideData } });

    // TODO: In the future, emit this to audience screens via Tauri events
    console.log("Active slide changed:", slideId, slideData);
  },

  clearActiveSlide: () => set({ activeSlide: null }),
});

