import { SlideObject } from "../types";
import { FC } from "react";
import { getSlideObject } from "../util/getSlideObject";

type SlideObjectWrapperProps = {
  object: SlideObject;
  isSelected: boolean;
  isEditable: boolean;
  hasSelection: boolean; // true if any object is selected
  forceShowVideo?: boolean; // Force showing actual video elements
};

export const SlideObjectWrapper: FC<SlideObjectWrapperProps> = ({
  object,
  isEditable,
  isSelected,
  hasSelection,
  forceShowVideo = false,
}) => {
  const SlideObjectComponent = getSlideObject(object);

  // When an object is selected, make non-selected objects non-interactive
  // This allows manipulating objects that are behind others
  const shouldBlockInteraction = isEditable && hasSelection && !isSelected;

  // Hard locked objects should always be non-interactive (clicks pass through)
  const isHardLocked = object.isLocked;

  // Determine if we need to block pointer events
  const needsPointerBlock = shouldBlockInteraction || isHardLocked;

  // Determine if we need to prevent text selection
  const preventTextSelection = isHardLocked;

  // Don't wrap with a div if no modifications needed
  if (!needsPointerBlock && !preventTextSelection) {
    return (
      <>
        {SlideObjectComponent && (
          <SlideObjectComponent
            object={object}
            isEditable={isEditable}
            isSelected={isSelected}
            forceShowVideo={forceShowVideo}
          />
        )}
      </>
    );
  }

  return (
    <>
      {SlideObjectComponent && (
        <div
          style={{
            pointerEvents: needsPointerBlock ? "none" : "auto",
            userSelect: preventTextSelection ? "none" : "auto",
          }}
        >
          <SlideObjectComponent
            object={object}
            isEditable={isEditable}
            isSelected={isSelected}
            forceShowVideo={forceShowVideo}
          />
        </div>
      )}
    </>
  );
};
