import { SlideData, SlideObject, TextObject, ShapeObject, ImageObject, VideoObject } from "@/components/feature/slide/types";
import { createContext, useContext, useState } from "react";
import { usePresenterStore, selectSelectedSlideGroupData, selectSelectedPlaylistItemData, selectActiveSlide } from "@/stores/presenterStore";
import { CanvasSize } from "@/components/presenter/types";

interface EditContextType {
  selectedSlide: SlideData | null;
  setSelectedSlide: (slide: SlideData) => void;
  selectedObjectId: string | null;
  selectObject: (objectId: string | null) => void;
  editingObjectId: string | null;
  setEditingObject: (objectId: string | null) => void;
  canvasSize: CanvasSize;
  addTextObject: () => void;
  addShapeObject: (shapeType: 'rectangle' | 'circle' | 'triangle') => void;
  addImageObject: (src: string) => void;
  addVideoObject: (src: string) => void;
  updateObject: (objectId: string, updates: Partial<SlideObject>) => void;
  updateTextContent: (objectId: string, content: string) => void;
  deleteObject: (objectId: string) => void;
  reorderObject: (objectId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  reorderObjects: (orderedObjects: SlideObject[]) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider = ({ children }: { children: React.ReactNode }) => {
    
    const updateSlideInLibrary = usePresenterStore((state) => state.updateSlideInLibrary);
    const updateSlideInPlaylistItem = usePresenterStore((state) => state.updateSlideInPlaylistItem);
    const selectedSlideGroup = usePresenterStore((state) => state.selectedSlideGroup);
    const selectedPlaylistItem = usePresenterStore((state) => state.selectedPlaylistItem);
    
    // Get canvas size from the current slide group
    const selectedPlaylistItemData = usePresenterStore(selectSelectedPlaylistItemData);
    const activeSlideGroupData = usePresenterStore(selectSelectedSlideGroupData);
    const activeSlide = usePresenterStore(selectActiveSlide);
    const slideGroup = selectedPlaylistItemData?.slideGroup || activeSlideGroupData;
    const canvasSize = slideGroup?.canvasSize || { width: 1920, height: 1080 };
    const initalSlide = activeSlide?.data || selectedPlaylistItemData?.slideGroup?.slides?.[0] || activeSlideGroupData?.slides?.[0] || null;
    const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(initalSlide);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  const updateSlideObjects = (updater: (objects: SlideObject[]) => SlideObject[]) => {
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
    const newObject: TextObject = {
      id: crypto.randomUUID(),
      type: 'text',
      position: { x: canvasSize.width * 0.25, y: canvasSize.height * 0.25 },
      size: { width: canvasSize.width * 0.5, height: 100 },
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      content: 'New Text',
      fontSize: 48,
      color: '#ffffff',
      alignment: 'left',
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addShapeObject = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    const newObject: ShapeObject = {
      id: crypto.randomUUID(),
      type: 'shape',
      position: { x: canvasSize.width * 0.35, y: canvasSize.height * 0.35 },
      size: { width: 300, height: 300 },
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      shapeType,
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 2,
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addImageObject = (src: string) => {
    const newObject: ImageObject = {
      id: crypto.randomUUID(),
      type: 'image',
      position: { x: canvasSize.width * 0.2, y: canvasSize.height * 0.2 },
      size: { width: canvasSize.width * 0.6, height: canvasSize.height * 0.6 },
      zIndex: (selectedSlide?.objects?.length || 0) + 1,
      src,
      objectFit: 'cover',
    };

    updateSlideObjects((objects) => [...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const addVideoObject = (src: string) => {
    const newObject: VideoObject = {
      id: crypto.randomUUID(),
      type: 'video',
      position: { x: canvasSize.width * 0.2, y: canvasSize.height * 0.2 },
      size: { width: canvasSize.width * 0.6, height: canvasSize.height * 0.6 },
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
        obj.id === objectId ? { ...obj, ...updates } as SlideObject : obj
      )
    );
  };

  const deleteObject = (objectId: string) => {
    updateSlideObjects((objects) => objects.filter((obj) => obj.id !== objectId));
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
    }
  };

  const reorderObject = (objectId: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
    updateSlideObjects((objects) => {
      const index = objects.findIndex((obj) => obj.id === objectId);
      if (index === -1) return objects;

      const newObjects = [...objects];
      const [object] = newObjects.splice(index, 1);

      if (direction === 'front') {
        // Move to front (highest zIndex)
        object.zIndex = Math.max(...objects.map(o => o.zIndex)) + 1;
        newObjects.push(object);
      } else if (direction === 'back') {
        // Move to back (lowest zIndex)
        object.zIndex = Math.min(...objects.map(o => o.zIndex)) - 1;
        newObjects.unshift(object);
      } else if (direction === 'forward' && index < objects.length - 1) {
        // Swap zIndex with next object
        const nextObj = objects[index + 1];
        const tempZ = object.zIndex;
        object.zIndex = nextObj.zIndex;
        nextObj.zIndex = tempZ;
        newObjects.splice(index + 1, 0, object);
      } else if (direction === 'backward' && index > 0) {
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
      objects.map((obj) =>
        obj.id === objectId && obj.type === 'text'
          ? { ...obj, content } as SlideObject
          : obj
      )
    );
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
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within an EditProvider');
  }
  return context;
};

export const useEditContextSafe = () => {
  const context = useContext(EditContext);
  return context;
};