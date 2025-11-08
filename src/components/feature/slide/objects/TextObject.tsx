import { TextObject as TextObjectType } from '../types';
import { CSSProperties } from 'react';

export type TextObjectProps = {
  object: TextObjectType;
  isEditable?: boolean;
  isSelected?: boolean;
};

export const TextObject = ({ object, isEditable = false, isSelected = false }: TextObjectProps) => {
  const style: CSSProperties = {
    position: 'absolute',
    left: `${object.position.x}px`,
    top: `${object.position.y}px`,
    width: `${object.size.width}px`,
    height: `${object.size.height}px`,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    zIndex: object.zIndex,
    fontSize: `${object.fontSize}px`,
    color: object.color,
    textAlign: object.alignment,
    fontFamily: object.fontFamily || 'inherit',
    fontWeight: object.bold ? 'bold' : 'normal',
    fontStyle: object.italic ? 'italic' : 'normal',
    textDecoration: object.underline ? 'underline' : 'none',
    cursor: isEditable ? 'move' : 'default',
    userSelect: isEditable ? 'none' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: object.alignment === 'center' ? 'center' : object.alignment === 'right' ? 'flex-end' : 'flex-start',
    wordWrap: 'break-word',
    overflow: 'hidden',
    padding: '8px',
  };

  return (
    <div
      style={style}
      data-object-id={object.id}
      data-object-type="text"
    >
      {object.content}
    </div>
  );
};

