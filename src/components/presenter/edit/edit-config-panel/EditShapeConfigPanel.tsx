import { Label } from "@/components/ui/label";
import { ShapeAlignmentBar } from "./common/shape/ShapeAlignmentBar";
import { ShapePositionInputs } from "./common/shape/ShapePositionInputs";
import { ShapeSizeInputs } from "./common/shape/ShapeSizeInputs";
import { ShapeTransformInputs } from "./common/shape/ShapeTransformInputs";
import { ShapeFill } from "./common/shape/ShapeFill";
import { ShapeStroke } from "./common/shape/ShapeStroke";
import { useEditContext } from "@/pages/presenter/edit/context";
import { SlideObject, ShapeObject } from "@/components/feature/slide/types";
import { Effect as ShapeEffect } from "./common/effects/Effect";

export const EditShapeConfigPanel = () => {
  const { selectedSlide, selectedObjectId, updateObject, canvasSize } =
    useEditContext();

  // Find the selected object - works with any object type
  const selectedObject = selectedSlide?.objects?.find(
    (obj) => obj.id === selectedObjectId
  ) as SlideObject | undefined;

  if (!selectedObject) {
    return <div className="p-4 text-xs text-gray-400">No object selected</div>;
  }

  const handlePositionChange = (update: { x: number; y: number }) => {
    updateObject(selectedObject.id, {
      position: update,
    });
  };

  const handleSizeChange = (update: { width: number; height: number }) => {
    updateObject(selectedObject.id, {
      size: update,
    });
  };

  const handleTransformChange = (update: {
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
  }) => {
    updateObject(selectedObject.id, update);
  };

  // Different object types handle fill/stroke differently:
  // - Shape: fillColor + strokeColor/strokeWidth (the shape itself)
  // - Text: backgroundColor + borderColor/borderWidth (the text box bounds)
  // - Image/Video: only borderColor/borderWidth (no fill, just border around bounds)
  const isShapeObject = selectedObject.type === "shape";
  const isTextObject = selectedObject.type === "text";
  const isImageObject = selectedObject.type === "image";
  const isVideoObject = selectedObject.type === "video";
  const shapeObject = isShapeObject ? (selectedObject as ShapeObject) : null;

  const handleFillChange = (fillColor: string | undefined) => {
    if (isShapeObject) {
      updateObject(selectedObject.id, { fillColor });
    } else if (isTextObject) {
      updateObject(selectedObject.id, { backgroundColor: fillColor });
    }
    // Image and Video objects don't have fill
  };

  const handleStrokeChange = (update: {
    strokeColor?: string;
    strokeWidth?: number;
  }) => {
    if (isShapeObject) {
      // Shape stroke
      updateObject(selectedObject.id, {
        strokeColor: update.strokeColor,
        strokeWidth: update.strokeWidth,
      });
    } else if (isTextObject || isImageObject || isVideoObject) {
      // Border for text/image/video bounds
      updateObject(selectedObject.id, {
        borderColor: update.strokeColor,
        borderWidth: update.strokeWidth,
      });
    }
  };

  // Get fill and stroke values based on object type
  const fillValue = isShapeObject
    ? shapeObject?.fillColor
    : isTextObject && "backgroundColor" in selectedObject
      ? selectedObject.backgroundColor
      : undefined;

  const strokeColor = isShapeObject
    ? shapeObject?.strokeColor
    : (isTextObject || isImageObject || isVideoObject) &&
        "borderColor" in selectedObject
      ? selectedObject.borderColor
      : undefined;

  const strokeWidth = isShapeObject
    ? shapeObject?.strokeWidth
    : (isTextObject || isImageObject || isVideoObject) &&
        "borderWidth" in selectedObject
      ? selectedObject.borderWidth
      : undefined;

  // Convert scaleX/scaleY to flip array for the UI
  const flip: Array<"horizontal" | "vertical"> = [];
  if ((selectedObject.scaleX ?? 1) < 0) flip.push("horizontal");
  if ((selectedObject.scaleY ?? 1) < 0) flip.push("vertical");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label className="text-xs!">Position</Label>
        <div className="flex flex-col gap-2">
          <ShapeAlignmentBar
            currentPosition={selectedObject.position}
            objectSize={selectedObject.size}
            canvasSize={canvasSize}
            onAlign={handlePositionChange}
          />
          <ShapePositionInputs
            x={selectedObject.position.x}
            y={selectedObject.position.y}
            onChange={handlePositionChange}
          />
        </div>
      </div>
      <hr />
      <ShapeSizeInputs
        width={selectedObject.size.width}
        height={selectedObject.size.height}
        onChange={handleSizeChange}
      />
      <hr />
      <ShapeTransformInputs
        flip={flip}
        rotation={selectedObject.rotation ?? 0}
        scaleX={selectedObject.scaleX ?? 1}
        scaleY={selectedObject.scaleY ?? 1}
        onChange={handleTransformChange}
      />
      {/* Show fill only for shapes and text objects (not for images/videos) */}
      {(isShapeObject || isTextObject) && (
        <>
          <hr />
          <ShapeFill value={fillValue} onChange={handleFillChange} />
        </>
      )}
      {/* Show stroke/border for all objects */}
      <hr />
      <ShapeStroke
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        onChange={handleStrokeChange}
      />
      <hr />
      <ShapeEffect
        value={"effect" in selectedObject ? selectedObject.effect : undefined}
        onChange={(effect) => updateObject(selectedObject.id, { effect })}
      />
    </div>
  );
};
