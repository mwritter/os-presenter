import { ImageObject } from "../objects/image/ImageObject";
import { ShapeObject } from "../objects/shape/ShapeObject";
import { TextObject } from "../objects/text/TextObject";
import { VideoObject } from "../objects/video/VideoObject";
import { SlideObject } from "../types";

export const getSlideObject = (object: SlideObject) => {
  switch (object.type) {
    case "text":
      return TextObject;
    case "shape":
      return ShapeObject;
    case "image":
      return ImageObject;
    case "video":
      return VideoObject;
    default:
      return null;
  }
};
