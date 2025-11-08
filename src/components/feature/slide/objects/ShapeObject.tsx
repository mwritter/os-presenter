import { ShapeObject as ShapeObjectType } from '../types';
import { CSSProperties } from 'react';

export type ShapeObjectProps = {
  object: ShapeObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ShapeObject = ({ object, isEditable = false }: ShapeObjectProps) => {
  const baseStyle: CSSProperties = {
    position: 'absolute',
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex,
    backgroundColor: object.fillColor,
    border: object.strokeColor && object.strokeWidth ? `${object.strokeWidth}px solid ${object.strokeColor}` : 'none',
    cursor: isEditable ? 'move' : 'default',
    userSelect: 'none',
  };

  const style: CSSProperties = {
    ...baseStyle,
    ...(object.shapeType === 'circle' && { borderRadius: '50%' }),
    ...(object.shapeType === 'triangle' && {
      backgroundColor: 'transparent',
      border: 'none',
      width: 0,
      height: 0,
    }),
  };

  // For triangle, we use CSS borders trick
  if (object.shapeType === 'triangle') {
    const triangleWidth = object.size.width;
    const triangleHeight = object.size.height;
    style.borderLeft = `${triangleWidth / 2}px solid transparent`;
    style.borderRight = `${triangleWidth / 2}px solid transparent`;
    style.borderBottom = `${triangleHeight}px solid ${object.fillColor}`;
  }

  return (
    <div
      style={style}
      data-object-id={object.id}
      data-object-type="shape"
    />
  );
};

