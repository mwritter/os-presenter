import { SlideObject } from "./types";
import { TextObject } from "./objects/TextObject";
import { ShapeObject } from "./objects/ShapeObject";
import { ImageObject } from "./objects/ImageObject";
import { VideoObject } from "./objects/VideoObject";
import { SelectionBox } from "./objects/SelectionBox";

export type SlideObjectRendererProps = {
  objects: SlideObject[];
  isEditable?: boolean;
  selectedObjectId?: string | null;
  onResizeStart?: (
    objectId: string,
    handle: string,
    e: React.MouseEvent
  ) => void;
};

export const SlideObjectRenderer = ({
  objects = [],
  isEditable = false,
  selectedObjectId = null,
  onResizeStart,
}: SlideObjectRendererProps) => {
  // Sort objects by zIndex
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedObjects.map((object) => {
        const isSelected = selectedObjectId === object.id;
        // const isEditing = editingObjectId === object.id;

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
          <div key={object.id}>
            {ObjectComponent}
            {isEditable && isSelected && (
              <SelectionBox
                object={object}
                onResizeStart={(handle, e) =>
                  onResizeStart?.(object.id, handle, e)
                }
              />
            )}
          </div>
        );
      })}
    </>
  );
};
