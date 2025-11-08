import { VideoObject as VideoObjectType } from '../types';
import { CSSProperties } from 'react';

export type VideoObjectProps = {
  object: VideoObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const VideoObject = ({ object, isEditable = false, isSelected = false }: VideoObjectProps) => {
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

  const videoStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: isEditable ? 'none' : 'auto',
  };

  return (
    <div
      style={containerStyle}
      data-object-id={object.id}
      data-object-type="video"
    >
      <video
        src={object.src}
        autoPlay={object.autoPlay}
        loop={object.loop}
        muted={object.muted}
        style={videoStyle}
      />
    </div>
  );
};

