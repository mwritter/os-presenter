import { ImageObject as ImageObjectType } from '../types';
import { CSSProperties } from 'react';

export type ImageObjectProps = {
  object: ImageObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const ImageObject = ({ object, isEditable = false }: ImageObjectProps) => {
  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex,
    cursor: isEditable ? 'move' : 'default',
    userSelect: 'none',
    overflow: 'hidden',
  };

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: (object.objectFit as any) || 'cover',
    pointerEvents: 'none',
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="image"
    >
      <img
        src={object.src}
        alt=""
        style={imageStyle}
        draggable={false}
      />
    </div>
  );
};

