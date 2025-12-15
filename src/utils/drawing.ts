import { Shape } from "../shapes/base";

const clearBoard = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    const bb = canvas.getBoundingClientRect();
    ctx?.clearRect(0, 0, bb.width, bb.height);
};

export const redraw = (
    canvas: HTMLCanvasElement,
    shapesList: Shape[],
    currentShape: Shape | null
) => {
    clearBoard(canvas);

    shapesList.forEach((shape) => shape.draw(canvas));

    if (currentShape) {
        currentShape.draw(canvas);
    }
};
