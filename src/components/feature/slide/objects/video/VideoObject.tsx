import { VideoObject as VideoObjectType, SlideObject } from "../../types";
import { cn } from "@/lib/utils";
import { useTextEditing } from "../hooks/use-text-editing";
import { getContainerStyles } from "./utils/getContainerStyles";
import { getVideoStyles } from "./utils/getVideoStyles";

export type VideoObjectProps = {
  object: SlideObject;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const VideoObject = ({
  object,
  isEditable = false,
}: VideoObjectProps) => {
  // Type narrowing - this component should only receive video objects
  if (object.type !== "video") return null;

  const videoObject = object as VideoObjectType;

  const {
    contentRef,
    isEditing,
    textContent,
    handleSave,
    handleKeyDown,
    handleDoubleClick,
    handleMouseDown,
    textOverlayStyle,
    textContentStyle,
  } = useTextEditing({ object: videoObject, isEditable });

  const containerStyle = getContainerStyles({
    object: videoObject,
    isEditable,
  });

  const videoStyle = getVideoStyles({ isEditable });

  return (
    <div
      style={containerStyle}
      data-object-id={videoObject.id}
      data-object-type="video"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <video
        src={videoObject.src}
        autoPlay={videoObject.autoPlay}
        loop={videoObject.loop}
        muted={videoObject.muted}
        style={videoStyle}
      />
      {(textContent || isEditing) && (
        <div style={textOverlayStyle} className={cn({ editing: isEditing })}>
          <div
            ref={contentRef}
            style={textContentStyle}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={isEditing ? handleSave : undefined}
            onKeyDown={isEditing ? handleKeyDown : undefined}
          >
            {textContent}
          </div>
        </div>
      )}
    </div>
  );
};
