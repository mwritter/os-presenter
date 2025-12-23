import { useRef, useEffect, useState } from "react";
import Moveable, {
  OnDrag,
  OnDragEnd,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd,
} from "react-moveable";
import { SlideObject } from "../../types";
import { getMoveableGuidelines } from "./utils/getMoveableGuidelines";

export type MoveableWrapperProps = {
  object: SlideObject;
  target: HTMLElement | SVGElement | string | null | undefined;
  onUpdate: (updates: Partial<SlideObject>) => void;
  scale: number;
  container: React.RefObject<HTMLElement>;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

export const MoveableWrapper = ({
  object,
  target,
  onUpdate,
  scale,
  container,
  onInteractionStart,
  onInteractionEnd,
}: MoveableWrapperProps) => {
  const moveableRef = useRef<Moveable>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const isInteractingRef = useRef(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  // Scale the snap threshold to maintain consistent behavior at different zoom levels
  const scaledSnapThreshold = 50 * scale;

  // Track shift key for aspect ratio lock during resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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
    object.scaleX,
    object.scaleY,
  ]);

  // Store reference to the target element
  useEffect(() => {
    if (typeof target === "string") {
      targetElementRef.current = document.querySelector(target) as HTMLElement;
    } else {
      targetElementRef.current = target as HTMLElement;
    }
  }, [target]);

  const guidelines = getMoveableGuidelines(container.current);

  const handleDrag = (e: OnDrag) => {
    if (!isInteractingRef.current) {
      isInteractingRef.current = true;
      onInteractionStart?.();
    }
    const rotation = object.rotation || 0;
    const scaleX = object.scaleX ?? 1;
    const scaleY = object.scaleY ?? 1;
    e.target.style.transform = `translate(${e.translate[0]}px, ${e.translate[1]}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
  };

  const handleDragEnd = (e: OnDragEnd) => {
    isInteractingRef.current = false;
    onInteractionEnd?.();
    requestAnimationFrame(() => {
      // Update position in state
      const newX = object.position.x + e.lastEvent.translate[0];
      const newY = object.position.y + e.lastEvent.translate[1];

      // Clear the translate from transform, keep scale and rotation
      if (targetElementRef.current) {
        const rotation = object.rotation || 0;
        const scaleX = object.scaleX ?? 1;
        const scaleY = object.scaleY ?? 1;
        const hasScale = scaleX !== 1 || scaleY !== 1;
        const hasRotation = rotation !== 0;

        if (hasScale || hasRotation) {
          targetElementRef.current.style.transform = `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
        } else {
          targetElementRef.current.style.transform = "";
        }
      }

      onUpdate({
        position: {
          x: newX,
          y: newY,
        },
      });
    });
  };

  const handleResize = (e: OnResize) => {
    if (!isInteractingRef.current) {
      isInteractingRef.current = true;
      onInteractionStart?.();
    }
    const MIN_SIZE = 1;

    // Enforce minimum size
    const width = Math.max(e.width, MIN_SIZE);
    const height = Math.max(e.height, MIN_SIZE);
    const rotation = object.rotation || 0;
    const scaleX = object.scaleX ?? 1;
    const scaleY = object.scaleY ?? 1;

    e.target.style.width = `${width}px`;
    e.target.style.height = `${height}px`;
    e.target.style.transform = `translate(${e.drag.translate[0]}px, ${e.drag.translate[1]}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
  };

  const handleResizeEnd = (e: OnResizeEnd) => {
    isInteractingRef.current = false;
    onInteractionEnd?.();
    requestAnimationFrame(() => {
      const MIN_SIZE = 1;

      // Enforce minimum size
      const newWidth = Math.max(e.lastEvent.width, MIN_SIZE);
      const newHeight = Math.max(e.lastEvent.height, MIN_SIZE);
      const newX = object.position.x + e.lastEvent.drag.translate[0];
      const newY = object.position.y + e.lastEvent.drag.translate[1];

      // Clear the translate from transform, keep scale and rotation
      // Also ensure width/height inline styles match the final size
      if (targetElementRef.current) {
        const rotation = object.rotation || 0;
        const scaleX = object.scaleX ?? 1;
        const scaleY = object.scaleY ?? 1;
        const hasScale = scaleX !== 1 || scaleY !== 1;
        const hasRotation = rotation !== 0;

        targetElementRef.current.style.width = `${newWidth}px`;
        targetElementRef.current.style.height = `${newHeight}px`;

        if (hasScale || hasRotation) {
          targetElementRef.current.style.transform = `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
        } else {
          targetElementRef.current.style.transform = "";
        }
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
    });
  };

  const handleRotate = (e: OnRotate) => {
    if (!isInteractingRef.current) {
      isInteractingRef.current = true;
      onInteractionStart?.();
    }
    const scaleX = object.scaleX ?? 1;
    const scaleY = object.scaleY ?? 1;
    e.target.style.transform = `translate(0px, 0px) scale(${scaleX}, ${scaleY}) rotate(${e.rotation}deg)`;
  };

  const handleRotateEnd = (e: OnRotateEnd) => {
    isInteractingRef.current = false;
    onInteractionEnd?.();
    requestAnimationFrame(() => {
      onUpdate({
        rotation: e.lastEvent.rotate,
      });
    });
  };

  // Keep aspect ratio for images/videos, or when shift is held
  const shouldKeepRatio =
    object.type === "image" || object.type === "video" || isShiftHeld;

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
      throttleRotate={isShiftHeld ? 15 : 0}
      keepRatio={shouldKeepRatio}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
      rotationPosition="top"
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResize={handleResize}
      onResizeEnd={handleResizeEnd}
      onRotate={handleRotate}
      onRotateEnd={handleRotateEnd}
    />
  );
};
