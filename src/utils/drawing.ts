import { Shape } from "../shapes/base";

import { Transformer } from "./canvas";

const clearBoard = (canvas: HTMLCanvasElement, transformer: Transformer) => {
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(1, 0, 0, 1, 0, 0);
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.setTransform(
        transformer.scale,
        0,
        0,
        transformer.scale,
        transformer.x,
        transformer.y
    );
};

const drawBackground = (
    canvas: HTMLCanvasElement,
    backgroundBitmap: ImageBitmap | null,
    backgroundSize: { width: number; height: number } | null
) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    if (backgroundBitmap && backgroundSize) {
        ctx.drawImage(
            backgroundBitmap,
            0,
            0,
            backgroundSize.width,
            backgroundSize.height
        );
    }
};

export const redraw = (
    canvas: HTMLCanvasElement,
    transformer: Transformer,
    shapesList: Shape[],
    currentShape: Shape | null,
    backgroundBitmap: ImageBitmap | null,
    backgroundSize: { width: number; height: number } | null
) => {
    clearBoard(canvas, transformer);

    drawBackground(canvas, backgroundBitmap, backgroundSize);

    shapesList.forEach((shape) => shape.draw(canvas));

    if (currentShape) {
        currentShape.draw(canvas);
    }
};
