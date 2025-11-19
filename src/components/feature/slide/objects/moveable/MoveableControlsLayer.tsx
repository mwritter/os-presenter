import { FC, useEffect, useState } from "react";
import { SlideObject } from "../../types";
import { MoveableWrapper } from "./MoveableWrapper";

export type MoveableControlsLayerProps = {
  objects: SlideObject[];
  selectedObjectId: string | null;
  canvasRef: React.RefObject<HTMLElement>;
  scale: number;
  onUpdateObject: (objectId: string, updates: Partial<SlideObject>) => void;
  isInteracting: boolean;
  setIsInteracting: (value: boolean) => void;
};

export const MoveableControlsLayer: FC<MoveableControlsLayerProps> = ({
  objects,
  selectedObjectId,
  canvasRef,
  scale,
  onUpdateObject,
  setIsInteracting,
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  // Find the target element when selection changes
  useEffect(() => {
    if (selectedObjectId && canvasRef.current) {
      const element = canvasRef.current.querySelector(
        `[data-object-id="${selectedObjectId}"]`
      ) as HTMLElement;
      if (element) {
        setTargetElement(element);
      }
    } else {
      setTargetElement(null);
    }
  }, [selectedObjectId, canvasRef]);

  // Don't render if no object selected, object is locked, or no target element
  if (!selectedObject || selectedObject.isLocked || !targetElement) {
    return null;
  }

  const handleUpdate = (updates: Partial<SlideObject>) => {
    onUpdateObject(selectedObjectId!, updates);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <MoveableWrapper
          object={selectedObject}
          target={targetElement}
          onUpdate={handleUpdate}
          scale={scale}
          container={canvasRef}
          onInteractionStart={() => setIsInteracting(true)}
          onInteractionEnd={() => setIsInteracting(false)}
        />
      </div>
    </div>
  );
};
