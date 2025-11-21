import { SlideObject } from "./types";
import { SlideObjectWrapper } from "./objects/SlideObjectWrapper";

export type SlideObjectRendererProps = {
  objects: SlideObject[];
  isEditable?: boolean;
  selectedObjectId?: string | null;
  forceShowVideo?: boolean; // Force showing actual video elements (for AudienceSlide)
};

export const SlideObjectRenderer = ({
  objects = [],
  isEditable = false,
  selectedObjectId = null,
  forceShowVideo = false,
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
            forceShowVideo={forceShowVideo}
          />
        );
      })}
    </>
  );
};
