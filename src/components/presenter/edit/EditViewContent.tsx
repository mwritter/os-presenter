import { useEditContext } from "@/presenter/edit/context";
import { Slide } from "@/components/feature/slide/Slide";
import { EditViewObjectActionbar } from "./edit-object-action-bar/EditViewObjectActionbar";
import { useRef } from "react";
import { useScaleOnResize } from "./hooks/use-scale-on-resize";
import { useObjectMoveAndResize } from "./hooks/use-object-move-and-resize";

export const EditViewContent = () => {
  const { 
    selectedSlide, 
    selectedObjectId, 
    editingObjectId,
    setEditingObject,
    updateTextContent,
    canvasSize 
  } = useEditContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<number>(1);

  useScaleOnResize({ containerRef, scaleRef, canvasSize });
  const { handleSlideMouseDown, handleResizeStart } = useObjectMoveAndResize({
    containerRef,
    scaleRef,
    editingObjectId,
  });

  const handleTextDoubleClick = (objectId: string) => {
    setEditingObject(objectId);
  };

  const handleTextContentChange = (objectId: string, content: string) => {
    updateTextContent(objectId, content);
    setEditingObject(null);
  };

  return (
    <div className="flex h-full w-full bg-shade-lighter justify-center items-center relative overflow-y-auto py-20">
      {selectedSlide && (
        <>
          <EditViewObjectActionbar />
          <div className="px-10 h-full w-full max-w-[1000px] flex flex-col justify-center items-center relative">
            <div
              ref={containerRef}
              className="w-full aspect-video relative"
              onMouseDown={handleSlideMouseDown}
            >
              <Slide
                id={selectedSlide.id}
                data={{
                  ...selectedSlide,
                  backgroundColor:
                    selectedSlide.backgroundColor || "var(--color-shade-2)",
                }}
                as="div"
                isEditable={true}
                selectedObjectId={selectedObjectId}
                editingObjectId={editingObjectId}
                onResizeStart={handleResizeStart}
                onTextDoubleClick={handleTextDoubleClick}
                onTextContentChange={handleTextContentChange}
                canvasSize={canvasSize}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
