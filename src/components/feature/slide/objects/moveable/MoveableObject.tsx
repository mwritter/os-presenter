import { SlideObject } from "../../types";
import { MoveableWrapper } from "./MoveableWrapper";
import { FC, useEffect, useState } from "react";
import { getSlideObject } from "../../util/getSlideObject";

type MoveableObjectProps = {
  object: SlideObject;
  isSelected: boolean;
  isEditable: boolean;
  scale: number;
  canvasRef: React.RefObject<HTMLElement>;
  onUpdateObject: (objectId: string, updates: Partial<SlideObject>) => void;
};

export const MoveableObject: FC<MoveableObjectProps> = ({
  object,
  isSelected,
  isEditable,
  scale,
  canvasRef,
  onUpdateObject,
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const SlideObjectComponent = getSlideObject(object);
  const showMoveable = isEditable && isSelected && Boolean(targetElement);

  // Find the target element when the component mounts or selection changes
  useEffect(() => {
    if (isEditable && isSelected && canvasRef.current) {
      // Use a small delay to ensure the element is in the DOM
      const element = canvasRef.current?.querySelector(
        `[data-object-id="${object.id}"]`
      ) as HTMLElement;
      if (element) {
        setTargetElement(element);
      }
    } else {
      setTargetElement(null);
    }
  }, [isSelected, isEditable, object.id, canvasRef]);

  const handleUpdate = (updates: Partial<SlideObject>) => {
    onUpdateObject(object.id, updates);
  };

  return (
    <>
      {SlideObjectComponent && (
        <SlideObjectComponent
          object={object}
          isEditable={isEditable}
          isSelected={isSelected}
        />
      )}
      {showMoveable && (
        <MoveableWrapper
          object={object}
          target={targetElement}
          onUpdate={handleUpdate}
          scale={scale}
          container={canvasRef!}
        />
      )}
    </>
  );
};
