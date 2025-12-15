import { getStroke } from "perfect-freehand";
import { Modes, Shape } from "../types";

const getStrokeString = (stroke: number[][]) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
};

export const drawFreehand = (
  canvasRef: HTMLCanvasElement,
  points: number[][],
) => {
  if (points.length === 0) {
    return;
  }

  const ctx = canvasRef.getContext("2d");

  if (!ctx) {
    return;
  }

  const myPath = getStroke(points);

  const pathData = getStrokeString(myPath);
  const path = new Path2D(pathData);
  ctx?.fill(path);
};

export const drawShape = (canvasRef: HTMLCanvasElement, shape: Shape) => {
  if (shape.type === Modes.Freehand) {
    drawFreehand(canvasRef, shape.points);
  }
};
