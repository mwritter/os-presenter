import { SlideObject } from "./types";
import { SlideObjectWrapper } from "./objects/SlideObjectWrapper";

export type SlideObjectRendererProps = {
  objects: SlideObject[];
  isEditable?: boolean;
  selectedObjectId?: string | null;
};

export const SlideObjectRenderer = ({
  objects = [],
  isEditable = false,
  selectedObjectId = null,
}: SlideObjectRendererProps) => {
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);
  const hasSelection = selectedObjectId !== null;

  return (
    <>
      {sortedObjects.map((object) => {
        const isSelected = selectedObjectId === object.id;

        return (
          <SlideObjectWrapper
            key={object.id}
            object={object}
            isSelected={isSelected}
            isEditable={isEditable}
            hasSelection={hasSelection}
          />
        );
      })}
    </>
  );
};
