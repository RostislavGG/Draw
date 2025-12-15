import { Shape, Modes, BaseShape } from "../types";

export const shapeBuilder = (
  shape: Shape | null,
  mode: Modes,
  x: number,
  y: number,
): Shape => {
  let currentShape = shape;

  if (!currentShape) {
    currentShape = buildInitialShape(mode, x, y);
  }

  switch (currentShape.type) {
    case Modes.Freehand:
      currentShape.points = [...currentShape.points, [x, y]];
      break;
    case Modes.Rectangle:
      currentShape.width = x - currentShape.x;
      currentShape.height = y - currentShape.y;
      break;
    case Modes.Line:
      currentShape.endX = x;
      currentShape.endY = y;
      break;
  }

  return currentShape;
};

const buildInitialShape = (mode: Modes, x: number, y: number): Shape => {
  const base: BaseShape = {
    id: "",
    type: mode,
    x,
    y,
  };

  let final;
  switch (mode) {
    case Modes.Freehand:
      final = {
        ...base,
        strokeColor: "#ff0000",
        points: [],
      };
      break;
    case Modes.Rectangle:
      final = {
        ...base,
        width: 0,
        height: 0,
      };
    case Modes.Line:
      final = {
        ...base,
        endX: x,
        endY: y,
      };
      break;
    case Modes.Typography:
      final = {
        ...base,
        fontSize: 12,
        text: "",
      };
      break;
  }

  return final as Shape;
};
