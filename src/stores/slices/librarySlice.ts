import { StateCreator } from "zustand";
import { Library, SlideGroup } from "@/components/presenter/types";
import { SlideData } from "@/components/feature/slide/types";
import * as storage from "@/services/storage";
import { createDefaultTextObject } from "../utils/createDefaultTextObject";

export interface LibrarySlice {
  libraries: Library[];
  isLibraryLoading: boolean;

  // Actions
  setLibraries: (libraries: Library[]) => void;
  addLibrary: (library: Library) => void;
  updateLibrary: (id: string, updates: Partial<Library>) => void;
  removeLibrary: (id: string) => void;
  addLibrarySlideGroup: (libraryId: string, slideGroup: SlideGroup) => void;
  removeLibrarySlideGroup: (libraryId: string, slideGroupId: string) => void;
  addSlideToSlideGroup: (
    libraryId: string,
    slideGroupId: string,
    slideData?: SlideData
  ) => void;
  updateSlideInLibrary: (
    libraryId: string,
    slideGroupId: string,
    slideId: string,
    updates: Partial<SlideData>
  ) => void;

  // Persistence
  loadLibraries: () => Promise<void>;
  saveLibraryToDisk: (library: Library) => Promise<void>;
}

export const createLibrarySlice: StateCreator<
  LibrarySlice,
  [],
  [],
  LibrarySlice
> = (set, get) => ({
  libraries: [],
  isLibraryLoading: false,

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
    }));
    // Delete from disk asynchronously
    storage.deleteLibrary(id).catch(console.error);
  },

  addLibrarySlideGroup: (libraryId, slideGroup) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (library) {
      // Ensure slide group has an ID
      const slideGroupWithId = {
        ...slideGroup,
        id: slideGroup.id || crypto.randomUUID(),
      };
      get().updateLibrary(libraryId, {
        slideGroups: [...library.slideGroups, slideGroupWithId],
      });
    }
  },

  removeLibrarySlideGroup: (libraryId, slideGroupId) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const updatedSlideGroups = library.slideGroups.filter(
      (sg) => sg.id !== slideGroupId
    );

    get().updateLibrary(libraryId, {
      slideGroups: updatedSlideGroups,
    });
  },

  addSlideToSlideGroup: (libraryId, slideGroupId, slideData) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroup = library.slideGroups.find((sg) => sg.id === slideGroupId);
    if (!slideGroup) return;

    // Generate unique slide ID: libraryId-shortUuid
    const shortId = crypto.randomUUID().split("-")[0];
    const uniqueSlideId = `${libraryId}-${shortId}`;

    // Create slide with default text object if no slideData provided
    const newSlide: SlideData = slideData ?? {
      id: uniqueSlideId,
      objects: [createDefaultTextObject(slideGroup.canvasSize)],
    };

    // Ensure slide has the unique ID
    if (slideData) {
      newSlide.id = uniqueSlideId;
    }

    // Update the slideGroup with the new slide
    const updatedSlideGroups = library.slideGroups.map((sg) =>
      sg.id === slideGroupId ? { ...sg, slides: [...sg.slides, newSlide] } : sg
    );

    get().updateLibrary(libraryId, {
      slideGroups: updatedSlideGroups,
    });
  },

  updateSlideInLibrary: (libraryId, slideGroupId, slideId, updates) => {
    const library = get().libraries.find((lib) => lib.id === libraryId);
    if (!library) return;

    const slideGroup = library.slideGroups.find((sg) => sg.id === slideGroupId);
    if (!slideGroup) return;

    // Update the specific slide in the slideGroup
    const updatedSlideGroups = library.slideGroups.map((sg) =>
      sg.id === slideGroupId
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

  loadLibraries: async () => {
    console.log("Loading libraries from disk...");
    set({ isLibraryLoading: true });
    try {
      const libraries = await storage.loadLibraries();
      console.log(`Loaded ${libraries.length} libraries`);
      
      // Migration: Ensure all slide groups have IDs
      const migratedLibraries = libraries.map((library) => ({
        ...library,
        slideGroups: library.slideGroups.map((sg) => ({
          ...sg,
          id: sg.id || crypto.randomUUID(), // Add ID if missing
        })),
      }));
      
      set({ libraries: migratedLibraries, isLibraryLoading: false });
      
      // Save migrated libraries back to disk if any were missing IDs
      const needsMigration = libraries.some((lib) =>
        lib.slideGroups.some((sg) => !(sg as any).id)
      );
      if (needsMigration) {
        console.log("Migrating libraries to add slide group IDs...");
        await Promise.all(
          migratedLibraries.map((lib) => storage.saveLibrary(lib))
        );
      }
    } catch (error) {
      console.error("Failed to load libraries:", error);
      set({ isLibraryLoading: false });
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
});

