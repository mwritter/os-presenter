import { SlideObject } from "./types";
import { MoveableObject } from "./objects/moveable/MoveableObject";

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
