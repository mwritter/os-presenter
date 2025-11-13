import { SlideObject } from "./types";
import { TextObject } from "./objects/TextObject";
import { ShapeObject } from "./objects/ShapeObject";
import { ImageObject } from "./objects/ImageObject";
import { VideoObject } from "./objects/VideoObject";
import { MoveableWrapper } from "./objects/MoveableWrapper";
import { FC, useEffect, useState } from "react";

type MoveableObjectProps = {
  object: SlideObject;
  isSelected: boolean;
  isEditable: boolean;
  scale: number;
  canvasRef: React.RefObject<HTMLElement>;
  onUpdateObject: (objectId: string, updates: Partial<SlideObject>) => void;
};

const MoveableObject: FC<MoveableObjectProps> = ({
  object,
  isSelected,
  isEditable,
  scale,
  canvasRef,
  onUpdateObject,
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

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
  let ObjectComponent;
  switch (object.type) {
    case "text":
      ObjectComponent = (
        <TextObject
          object={object}
          isEditable={isEditable}
          isSelected={isSelected}
        />
      );
      break;
    case "shape":
      ObjectComponent = (
        <ShapeObject
          object={object}
          isEditable={isEditable}
          isSelected={isSelected}
        />
      );
      break;
    case "image":
      ObjectComponent = (
        <ImageObject
          object={object}
          isEditable={isEditable}
          isSelected={isSelected}
        />
      );
      break;
    case "video":
      ObjectComponent = (
        <VideoObject
          object={object}
          isEditable={isEditable}
          isSelected={isSelected}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <>
      {ObjectComponent}
      {isEditable && isSelected && targetElement && (
        <MoveableWrapper
          object={object}
          target={targetElement}
          onUpdate={(updates) => onUpdateObject(object.id, updates)}
          scale={scale}
          container={canvasRef!}
        />
      )}
    </>
  );
};

export type SlideObjectRendererProps = {
  scale: number;
  objects: SlideObject[];
  isEditable?: boolean;
  selectedObjectId?: string | null;
  canvasRef?: React.RefObject<HTMLElement>;
  onUpdateObject?: (objectId: string, updates: Partial<SlideObject>) => void;
};

export const SlideObjectRenderer = ({
  scale,
  objects = [],
  isEditable = false,
  selectedObjectId = null,
  canvasRef,
  onUpdateObject,
}: SlideObjectRendererProps) => {
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedObjects.map((object) => {
        const isSelected = selectedObjectId === object.id;

        return (
          <MoveableObject
            scale={scale}
            key={object.id}
            object={object}
            isSelected={isSelected}
            isEditable={isEditable}
            canvasRef={canvasRef!}
            onUpdateObject={onUpdateObject!}
          />
        );
      })}
    </>
  );
};
