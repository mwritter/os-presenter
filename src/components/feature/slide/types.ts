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

export type SlideData = {
  id: string;
  text?: SlideText;
  background?: SlideBackground;
};