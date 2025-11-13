import { useRef, useEffect } from "react";
import Moveable, { OnDragEnd, OnResizeEnd } from "react-moveable";
import { SlideObject } from "../types";

export type MoveableWrapperProps = {
  object: SlideObject;
  target: HTMLElement | SVGElement | string | null | undefined;
  onUpdate: (updates: Partial<SlideObject>) => void;
  scale: number;
  container: React.RefObject<HTMLElement>;
};

export const MoveableWrapper = ({
  object,
  target,
  onUpdate,
  scale,
  container,
}: MoveableWrapperProps) => {
  const moveableRef = useRef<Moveable>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);

  // Store reference to the target element
  useEffect(() => {
    if (typeof target === "string") {
      targetElementRef.current = document.querySelector(target) as HTMLElement;
    } else {
      targetElementRef.current = target as HTMLElement;
    }
  }, [target]);

  // Calculate guidelines for snapping to edges and center
  const guidelines = container.current
    ? {
        horizontalGuidelines: [
          0, // top edge
          container.current.offsetHeight / 2, // vertical center
          container.current.offsetHeight, // bottom edge
        ],
        verticalGuidelines: [
          0, // left edge
          container.current.offsetWidth / 2, // horizontal center
          container.current.offsetWidth, // right edge
        ],
      }
    : { horizontalGuidelines: [], verticalGuidelines: [] };

  // Scale the snap threshold to maintain consistent behavior at different zoom levels
  const scaledSnapThreshold = 50 * scale;

  // Update moveable when object changes
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current?.updateRect();
    }
  }, [
    object.position.x,
    object.position.y,
    object.size.width,
    object.size.height,
    object.rotation,
  ]);

  const handleDragEnd = (e: OnDragEnd) => {
    requestAnimationFrame(() => {
      // Update position in state
      const newX = object.position.x + e.lastEvent.translate[0];
      const newY = object.position.y + e.lastEvent.translate[1];

      // Clear the translate from transform, keep only rotation
      if (targetElementRef.current) {
        const rotation = object.rotation || 0;
        targetElementRef.current.style.transform = rotation
          ? `rotate(${rotation}deg)`
          : "";
      }

      onUpdate({
        position: {
          x: newX,
          y: newY,
        },
      });
    });
  };

  const handleResizeEnd = (e: OnResizeEnd) => {
    // Update size and position in state
    const newWidth = e.lastEvent.width;
    const newHeight = e.lastEvent.height;
    const newX = object.position.x + e.lastEvent.drag.translate[0];
    const newY = object.position.y + e.lastEvent.drag.translate[1];

    // Clear the translate from transform, keep only rotation
    // Also ensure width/height inline styles match the final size
    if (targetElementRef.current) {
      const rotation = object.rotation || 0;
      targetElementRef.current.style.width = `${newWidth}px`;
      targetElementRef.current.style.height = `${newHeight}px`;
      targetElementRef.current.style.transform = rotation
        ? `rotate(${rotation}deg)`
        : "";
    }

    onUpdate({
      size: {
        width: newWidth,
        height: newHeight,
      },
      position: {
        x: newX,
        y: newY,
      },
    });
  };

  return (
    <Moveable
      ref={moveableRef}
      draggable={true}
      zoom={1 / scale}
      target={target}
      container={container.current}
      resizable={true}
      rotatable={true}
      snappable={true}
      snapContainer={container.current}
      snapThreshold={scaledSnapThreshold}
      snapGap={true}
      snapDigit={0}
      isDisplaySnapDigit={true}
      isDisplayInnerSnapDigit={false}
      horizontalGuidelines={guidelines.horizontalGuidelines}
      verticalGuidelines={guidelines.verticalGuidelines}
      snapDirections={{
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      }}
      elementSnapDirections={{
        top: true,
        left: true,
        bottom: true,
        right: true,
        center: true,
        middle: true,
      }}
      origin={false}
      edge={false}
      throttleDrag={0}
      throttleResize={0}
      throttleRotate={0}
      keepRatio={false}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
      rotationPosition="top"
      onDrag={(e) => {
        // Update position during drag
        const rotation = object.rotation || 0;
        e.target.style.transform = `translate(${e.translate[0]}px, ${e.translate[1]}px) rotate(${rotation}deg)`;
      }}
      onDragEnd={handleDragEnd}
      onResize={(e) => {
        // Update size and position during resize
        const rotation = object.rotation || 0;
        e.target.style.width = `${e.width}px`;
        e.target.style.height = `${e.height}px`;
        e.target.style.transform = `translate(${e.drag.translate[0]}px, ${e.drag.translate[1]}px) rotate(${rotation}deg)`;
      }}
      onResizeEnd={handleResizeEnd}
      onRotate={(e) => {
        // Update rotation during rotate
        e.target.style.transform = `translate(0px, 0px) rotate(${e.rotate}deg)`;
      }}
      onRotateEnd={(e) => {
        onUpdate({
          rotation: e.lastEvent.rotate,
        });
      }}
    />
  );
};
