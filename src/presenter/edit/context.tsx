import {
  SlideData,
  SlideObject,
  ShapeObject,
  ImageObject,
  VideoObject,
} from "@/components/feature/slide/types";
import { createContext, useContext, useState, useEffect } from "react";
import {
  usePresenterStore,
  selectSelectedSlideGroupData,
  selectSelectedPlaylistItemData,
  selectActiveSlide,
} from "@/stores/presenterStore";
import { CanvasSize } from "@/components/presenter/types";
import { createDefaultTextObject } from "@/stores/utils/createDefaultTextObject";

interface EditContextType {
  selectedSlide: SlideData | null;
  setSelectedSlide: (slide: SlideData) => void;
  selectedObjectId: string | null;
  selectObject: (objectId: string | null) => void;
  editingObjectId: string | null;
  setEditingObject: (objectId: string | null) => void;
  canvasSize: CanvasSize;
  addTextObject: () => void;
  addShapeObject: (shapeType: "rectangle" | "circle" | "triangle") => void;
  addImageObject: (src: string) => void;
  addVideoObject: (src: string) => void;
  updateObject: (objectId: string, updates: Partial<SlideObject>) => void;
  updateTextContent: (objectId: string, content: string) => void;
  deleteObject: (objectId: string) => void;
  reorderObject: (
    objectId: string,
    direction: "forward" | "backward" | "front" | "back"
  ) => void;
  reorderObjects: (orderedObjects: SlideObject[]) => void;
  updateSlideBackground: (backgroundColor: string | undefined) => void;
  updateAllSlidesBackground: (backgroundColor: string | undefined) => void;
  updateCanvasSize: (canvasSize: CanvasSize) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider = ({ children }: { children: React.ReactNode }) => {
  const updateSlideInLibrary = usePresenterStore(
    (state) => state.updateSlideInLibrary
  );
  const updateSlideInPlaylistItem = usePresenterStore(
    (state) => state.updateSlideInPlaylistItem
  );
  const updatePlaylistItemSlideGroup = usePresenterStore(
    (state) => state.updatePlaylistItemSlideGroup
  );
  const updateLibrary = usePresenterStore((state) => state.updateLibrary);
  const selectedSlideGroup = usePresenterStore(
    (state) => state.selectedSlideGroup
  );
  const selectedPlaylistItem = usePresenterStore(
    (state) => state.selectedPlaylistItem
  );

  // Get canvas size from the current slide group
  const selectedPlaylistItemData = usePresenterStore(
    selectSelectedPlaylistItemData
  );
  const activeSlideGroupData = usePresenterStore(selectSelectedSlideGroupData);
  const activeSlide = usePresenterStore(selectActiveSlide);
  const slideGroup =
    selectedPlaylistItemData?.slideGroup || activeSlideGroupData;
  const canvasSize = slideGroup?.canvasSize || { width: 1920, height: 1080 };
  const initalSlide =
    activeSlide?.data ||
    selectedPlaylistItemData?.slideGroup?.slides?.[0] ||
    activeSlideGroupData?.slides?.[0] ||
    null;
  const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(
    initalSlide
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  // Sync selectedSlide with store when slideGroup changes (e.g., navigating back from show view)
  useEffect(() => {
    if (!selectedSlide && slideGroup?.slides?.[0]) {
      // If no slide selected, select the first one
      setSelectedSlide(slideGroup.slides[0]);
    } else if (selectedSlide && slideGroup?.slides) {
      // If a slide is selected, find and update it from the store
      const updatedSlide = slideGroup.slides.find(
        (s) => s.id === selectedSlide.id
      );
      if (updatedSlide) {
        // Only update if the data has actually changed (deep comparison by JSON)
        // This prevents infinite loops while still syncing changes from other views
        if (JSON.stringify(updatedSlide) !== JSON.stringify(selectedSlide)) {
          setSelectedSlide(updatedSlide);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideGroup, selectedSlide?.id]);

  const updateSlideObjects = (
    updater: (objects: SlideObject[]) => SlideObject[]
  ) => {
    if (!selectedSlide) return;

    const currentObjects = selectedSlide.objects || [];
    const updatedObjects = updater(currentObjects);
    const updatedSlide: SlideData = {
      ...selectedSlide,
      objects: updatedObjects,
    };

    // Update in store based on context (library or playlist)
    if (selectedPlaylistItem) {
      updateSlideInPlaylistItem(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        selectedSlide.id,
        { objects: updatedObjects }
      );
    } else if (selectedSlideGroup) {
      updateSlideInLibrary(
        selectedSlideGroup.libraryId,
        selectedSlideGroup.index,
        selectedSlide.id,
        { objects: updatedObjects }
      );
    }

    setSelectedSlide(updatedSlide);
  };

  const addTextObject = () => {
    const newObject = createDefaultTextObject(canvasSize);

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addShapeObject = (shapeType: "rectangle" | "circle" | "triangle") => {
    const newObject: ShapeObject = {
      id: crypto.randomUUID(),
      type: "shape",
      position: { x: canvasSize.width * 0.35, y: canvasSize.height * 0.35 },
      size: { width: 300, height: 300 },
      scaleX: 1,
      scaleY: 1,
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      shapeType,
      fillColor: "#3b82f6",
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addImageObject = (src: string) => {
    const newObject: ImageObject = {
      id: crypto.randomUUID(),
      type: "image",
      position: { x: canvasSize.width * 0.2, y: canvasSize.height * 0.2 },
      size: { width: canvasSize.width * 0.6, height: canvasSize.height * 0.6 },
      scaleX: 1,
      scaleY: 1,
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      src,
      objectFit: "cover",
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addVideoObject = (src: string) => {
    const newObject: VideoObject = {
      id: crypto.randomUUID(),
      type: "video",
      position: { x: canvasSize.width * 0.2, y: canvasSize.height * 0.2 },
      size: { width: canvasSize.width * 0.6, height: canvasSize.height * 0.6 },
      scaleX: 1,
      scaleY: 1,
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      src,
      autoPlay: false,
      loop: false,
      muted: true,
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const updateObject = (objectId: string, updates: Partial<SlideObject>) => {
    updateSlideObjects((objects) =>
      objects.map((obj) =>
        obj.id === objectId ? ({ ...obj, ...updates } as SlideObject) : obj
      )
    );
  };

  const deleteObject = (objectId: string) => {
    updateSlideObjects((objects) =>
      objects.filter((obj) => obj.id !== objectId)
    );
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
    }
  };

  const reorderObject = (
    objectId: string,
    direction: "forward" | "backward" | "front" | "back"
  ) => {
    updateSlideObjects((objects) => {
      const index = objects.findIndex((obj) => obj.id === objectId);
      if (index === -1) return objects;

      const newObjects = [...objects];
      const [object] = newObjects.splice(index, 1);

      if (direction === "front") {
        // Move to front (highest zIndex)
        object.zIndex = Math.max(...objects.map((o) => o.zIndex)) + 1;
        newObjects.push(object);
      } else if (direction === "back") {
        // Move to back (lowest zIndex)
        object.zIndex = Math.min(...objects.map((o) => o.zIndex)) - 1;
        newObjects.unshift(object);
      } else if (direction === "forward" && index < objects.length - 1) {
        // Swap zIndex with next object
        const nextObj = objects[index + 1];
        const tempZ = object.zIndex;
        object.zIndex = nextObj.zIndex;
        nextObj.zIndex = tempZ;
        newObjects.splice(index + 1, 0, object);
      } else if (direction === "backward" && index > 0) {
        // Swap zIndex with previous object
        const prevObj = objects[index - 1];
        const tempZ = object.zIndex;
        object.zIndex = prevObj.zIndex;
        prevObj.zIndex = tempZ;
        newObjects.splice(index - 1, 0, object);
      } else {
        newObjects.splice(index, 0, object);
      }

      return newObjects.sort((a, b) => a.zIndex - b.zIndex);
    });
  };

  const reorderObjects = (orderedObjects: SlideObject[]) => {
    // Reassign z-index based on position in the array
    // Array is sorted with highest z-index first, so reverse the mapping
    const updatedObjects = orderedObjects.map((obj, index) => ({
      ...obj,
      zIndex: orderedObjects.length - index, // First item gets highest z-index
    }));
    const sortedObjects = updatedObjects.sort((a, b) => b.zIndex - a.zIndex);

    updateSlideObjects(() => sortedObjects);
  };

  const selectObject = (objectId: string | null) => {
    setSelectedObjectId(objectId);
  };

  const setEditingObject = (objectId: string | null) => {
    setEditingObjectId(objectId);
  };

  const updateTextContent = (objectId: string, content: string) => {
    updateSlideObjects((objects) =>
      objects.map((obj) => {
        if (obj.id !== objectId) return obj;

        // If this is the first time adding text content to a shape/image/video object,
        // add default text styling properties
        const needsDefaultTextStyles =
          obj.type !== "text" &&
          !("fontSize" in obj) &&
          !("color" in obj) &&
          !("fontFamily" in obj);

        if (needsDefaultTextStyles) {
          // Apply default text styles from createDefaultTextObject
          return {
            ...obj,
            content,
            fontSize: 48,
            color: "#FFFFFF",
            alignment: "center" as const,
            fontFamily: "Arial",
            fontStyle: "normal" as const,
          } as SlideObject;
        }

        return { ...obj, content } as SlideObject;
      })
    );
  };

  const updateSlideBackground = (backgroundColor: string | undefined) => {
    if (!selectedSlide) return;

    const updatedSlide: SlideData = {
      ...selectedSlide,
      backgroundColor,
    };

    // Update in store
    if (selectedPlaylistItem) {
      updateSlideInPlaylistItem(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        selectedSlide.id,
        { backgroundColor }
      );
    } else if (selectedSlideGroup) {
      updateSlideInLibrary(
        selectedSlideGroup.libraryId,
        selectedSlideGroup.index,
        selectedSlide.id,
        { backgroundColor }
      );
    }

    setSelectedSlide(updatedSlide);
  };

  const updateAllSlidesBackground = (backgroundColor: string | undefined) => {
    if (!slideGroup) return;

    // Update all slides in the slide group
    const updatedSlides = slideGroup.slides.map((slide) => ({
      ...slide,
      backgroundColor,
    }));

    // Update in store
    if (selectedPlaylistItem) {
      updatePlaylistItemSlideGroup(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        { slides: updatedSlides }
      );
    } else if (selectedSlideGroup) {
      const library = usePresenterStore
        .getState()
        .libraries.find((lib) => lib.id === selectedSlideGroup.libraryId);
      if (library) {
        const updatedSlideGroups = [...library.slideGroups];
        updatedSlideGroups[selectedSlideGroup.index] = {
          ...updatedSlideGroups[selectedSlideGroup.index],
          slides: updatedSlides,
        };
        updateLibrary(selectedSlideGroup.libraryId, {
          slideGroups: updatedSlideGroups,
        });
      }
    }

    // Update local state if current slide is selected
    if (selectedSlide) {
      setSelectedSlide({ ...selectedSlide, backgroundColor });
    }
  };

  const updateCanvasSize = (newCanvasSize: CanvasSize) => {
    if (!slideGroup) return;

    // Update in store
    if (selectedPlaylistItem) {
      updatePlaylistItemSlideGroup(
        selectedPlaylistItem.playlistId,
        selectedPlaylistItem.id,
        { canvasSize: newCanvasSize }
      );
    } else if (selectedSlideGroup) {
      const library = usePresenterStore
        .getState()
        .libraries.find((lib) => lib.id === selectedSlideGroup.libraryId);
      if (library) {
        const updatedSlideGroups = [...library.slideGroups];
        updatedSlideGroups[selectedSlideGroup.index] = {
          ...updatedSlideGroups[selectedSlideGroup.index],
          canvasSize: newCanvasSize,
        };
        updateLibrary(selectedSlideGroup.libraryId, {
          slideGroups: updatedSlideGroups,
        });
      }
    }
  };

  return (
    <EditContext.Provider
      value={{
        selectedSlide,
        setSelectedSlide,
        selectedObjectId,
        selectObject,
        editingObjectId,
        setEditingObject,
        canvasSize,
        addTextObject,
        addShapeObject,
        addImageObject,
        addVideoObject,
        updateObject,
        updateTextContent,
        deleteObject,
        reorderObject,
        reorderObjects,
        updateSlideBackground,
        updateAllSlidesBackground,
        updateCanvasSize,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within an EditProvider");
  }
  return context;
};

export const useEditContextSafe = () => {
  const context = useContext(EditContext);
  return context;
};
