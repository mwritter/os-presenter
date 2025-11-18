import { ShapeObject } from "../../../types";
import { Rectangle } from "../shapes/Rectangle";
import { Circle } from "../shapes/Circle";
import { Triangle } from "../shapes/Triangle";

export const getShape = ({ object }: { object: ShapeObject }) => {
  switch (object.shapeType) {
    case "rectangle":
      return Rectangle;
    case "circle":
      return Circle;
    case "triangle":
      return Triangle;
  }
};
