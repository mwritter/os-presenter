import { useEditContext } from "@/pages/presenter/edit/context";
import { Slide } from "@/components/feature/slide/Slide";
import { EditViewObjectActionbar } from "./edit-object-action-bar/EditViewObjectActionbar";
import { useEffect, useRef, useState } from "react";
import { EditConfigPanel } from "./edit-config-panel/EditConfigPanel";
import { AnimatePresence, motion } from "framer-motion";
import { ImageObject, VideoObject } from "@/components/feature/slide/types";
export const EditViewContent = () => {
  const {
    selectedSlide,
    selectedObjectId,
    editingObjectId,
    selectObject,
    updateObject,
    canvasSize,
    deleteObject,
  } = useEditContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMoveableInteracting, setIsMoveableInteracting] = useState(false);

  const handleSlideMouseDown = (e: React.MouseEvent) => {
    console.log("handleSlideMouseDown", selectedObjectId);
    // Don't start selecting if we're in edit mode or interacting with Moveable
    if (editingObjectId || isMoveableInteracting) return;

    const target = e.target as HTMLElement;
    const objectId =
      target.dataset.objectId ||
      target.closest("[data-object-id]")?.getAttribute("data-object-id");

    console.log("objectId", objectId);
    if (objectId) {
      // Check if the object is a background media (which should not be selectable)
      const clickedObject = selectedSlide?.objects?.find(
        (obj) => obj.id === objectId
      );
      // Don't select background videos
      if (
        clickedObject?.type === "video" &&
        (clickedObject as VideoObject).videoType === "background"
      ) {
        return;
      }
      // Don't select background images
      if (
        clickedObject?.type === "image" &&
        (clickedObject as ImageObject).imageType === "background"
      ) {
        return;
      }
      selectObject(objectId);
    } else {
      // Clicked on empty canvas, deselect
      selectObject(null);
    }
  };

  // Handle clicks outside the slide to deselect objects
  const handleOuterClick = (e: React.MouseEvent) => {
    // Don't deselect if we're in edit mode
    if (editingObjectId) return;

    // Check if click is outside the slide container
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      selectObject(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        selectObject(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) {
          deleteObject(selectedObjectId);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId]);

  return (
    <div className="grid grid-cols-[1fr_300px] h-full w-full bg-shade-lighter">
      <div
        className="flex flex-col justify-center items-center h-full w-full overflow-y-auto"
        onMouseDown={handleOuterClick}
      >
        {selectedSlide && (
          <>
            <EditViewObjectActionbar />
            <div className="px-5 h-screen w-full max-w-[1000px] flex flex-col justify-center items-center relative">
              <div
                ref={containerRef}
                className="w-full aspect-video relative"
                onMouseDown={handleSlideMouseDown}
              >
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.06, duration: 0.3 }}
                  >
                    <Slide
                      id={selectedSlide.id}
                      data={{
                        ...selectedSlide,
                        backgroundColor:
                          selectedSlide.backgroundColor ||
                          "var(--color-shade-2)",
                      }}
                      isEditable
                      selectedObjectId={selectedObjectId}
                      onUpdateObject={updateObject}
                      canvasSize={canvasSize}
                      onMoveableInteractionChange={setIsMoveableInteracting}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
      <EditConfigPanel />
    </div>
  );
};
