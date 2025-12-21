// Legacy types for backwards compatibility
export type SlideBackground =
  | { type: "color"; value: string }
  | { type: "image"; value: string }
  | { type: "video"; value: string };

export type SlideText = {
  content: string;
  fontSize?: number;
  color?: string;
  alignment?: "left" | "center" | "right";
};

// Alignment types
export type TextAlignment = {
  horizontal: "left" | "center" | "right";
  vertical: "top" | "center" | "bottom";
};

// Shadow effect type
export type ShadowEffect = {
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
};

// Effect container type
export type Effect = {
  shadow?: ShadowEffect;
  // Future effects can be added here (e.g., blur, glow, etc.)
};

// Base object with common properties
export type BaseSlideObject = {
  id: string;
  type: "text" | "shape" | "image" | "video";
  position: { x: number; y: number }; // pixels relative to canvas
  size: { width: number; height: number }; // pixels
  rotation?: number; // degrees
  scaleX?: number; // scale factor for horizontal axis (negative for flip)
  scaleY?: number; // scale factor for vertical axis (negative for flip)
  zIndex: number;
  isLocked?: boolean; // Hard lock - prevents all editing
};

// Text object with extended formatting
export type TextObject = BaseSlideObject & {
  type: "text";
  content: string;
  fontSize: number;
  color: string;
  alignment: TextAlignment;
  fontFamily?: string; // Full font name to use in CSS (e.g., "American Typewriter Bold")
  fontVariant?: string; // Style name for UI (e.g., "Bold", "Condensed Bold")
  // Deprecated fields kept for backward compatibility
  fontWeight?: number;
  bold?: boolean;
  fontStyle?: "normal" | "italic" | "oblique";
  underline?: boolean;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  // Text content stroke (outline around letters)
  textStrokeColor?: string;
  textStrokeWidth?: number;
  // Text object bounds (background and border of the text box)
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  // Effects (for container/bounds)
  effect?: Effect;
  // Text content shadow (text-shadow CSS)
  textShadow?: ShadowEffect;
};

// Shape object (rectangle, circle, triangle)
export type ShapeObject = BaseSlideObject & {
  type: "shape";
  shapeType: "rectangle" | "circle" | "triangle";
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Optional text overlay
  content?: string;
  fontSize?: number;
  color?: string;
  alignment?: TextAlignment;
  fontFamily?: string; // Full font name for CSS
  fontVariant?: string; // Style name for UI
  // Deprecated fields
  fontWeight?: number;
  bold?: boolean;
  fontStyle?: "normal" | "italic" | "oblique";
  underline?: boolean;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textStrokeColor?: string;
  textStrokeWidth?: number;
  // Effects (for shape itself)
  effect?: Effect;
  // Text overlay shadow (text-shadow CSS for overlay text)
  textShadow?: ShadowEffect;
};

// Image object
export type ImageObject = BaseSlideObject & {
  type: "image";
  src: string;
  imageType?: "background" | "object"; // 'background' = media library image (non-editable), 'object' = regular editable image
  objectFit?: "cover" | "contain" | "fill";
  // Border around the image bounds
  borderColor?: string;
  borderWidth?: number;
  // Optional text overlay
  content?: string;
  fontSize?: number;
  color?: string;
  alignment?: TextAlignment;
  fontFamily?: string; // Full font name for CSS
  fontVariant?: string; // Style name for UI
  // Deprecated fields
  fontWeight?: number;
  bold?: boolean;
  fontStyle?: "normal" | "italic" | "oblique";
  underline?: boolean;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textStrokeColor?: string;
  textStrokeWidth?: number;
  // Effects (for image bounds)
  effect?: Effect;
  // Text overlay shadow (text-shadow CSS for overlay text)
  textShadow?: ShadowEffect;
};

// Video object
export type VideoObject = BaseSlideObject & {
  type: "video";
  src: string;
  videoType?: "background" | "object"; // 'background' = controllable media library video, 'object' = auto-play edit view video
  thumbnail?: string; // Thumbnail image for displaying on non-audience surfaces
  objectFit?: "cover" | "contain" | "fill";
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  // Border around the video bounds
  borderColor?: string;
  borderWidth?: number;
  // Optional text overlay
  content?: string;
  fontSize?: number;
  color?: string;
  alignment?: TextAlignment;
  fontFamily?: string; // Full font name for CSS
  fontVariant?: string; // Style name for UI
  // Deprecated fields
  fontWeight?: number;
  bold?: boolean;
  fontStyle?: "normal" | "italic" | "oblique";
  underline?: boolean;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textStrokeColor?: string;
  textStrokeWidth?: number;
  // Effects (for video bounds)
  effect?: Effect;
  // Text overlay shadow (text-shadow CSS for overlay text)
  textShadow?: ShadowEffect;
};

export type SlideObject = TextObject | ShapeObject | ImageObject | VideoObject;

// New SlideData structure
export type SlideData = {
  id: string;
  objects?: SlideObject[];
  backgroundColor?: string; // Canvas background color
};
