// Legacy types for backwards compatibility
export type SlideBackground = 
  | { type: 'color'; value: string }
  | { type: 'image'; value: string }
  | { type: 'video'; value: string };

export type SlideText = {
  content: string;
  fontSize?: number;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
};

// Base object with common properties
export type BaseSlideObject = {
  id: string;
  type: 'text' | 'shape' | 'image' | 'video';
  position: { x: number; y: number }; // pixels relative to canvas
  size: { width: number; height: number }; // pixels
  rotation?: number; // degrees
  zIndex: number;
};

// Text object with extended formatting
export type TextObject = BaseSlideObject & {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

// Shape object (rectangle, circle, triangle)
export type ShapeObject = BaseSlideObject & {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
};

// Image object
export type ImageObject = BaseSlideObject & {
  type: 'image';
  src: string;
  objectFit?: 'cover' | 'contain' | 'fill';
};

// Video object
export type VideoObject = BaseSlideObject & {
  type: 'video';
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export type SlideObject = TextObject | ShapeObject | ImageObject | VideoObject;

// New SlideData structure
export type SlideData = {
  id: string;
  objects?: SlideObject[];
  backgroundColor?: string; // Canvas background color
  // Legacy support (optional, for migration)
  text?: SlideText;
  background?: SlideBackground;
};