import { Shape } from "../shapes/base";

import { Transformer } from "./canvas";

const clearBoard = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    transformer: Transformer
) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.setTransform(
        transformer.scale,
        0,
        0,
        transformer.scale,
        transformer.x,
        transformer.y
    );
};

const drawBackground = (
    ctx: CanvasRenderingContext2D,
    backgroundBitmap: ImageBitmap | null,
    backgroundSize: { width: number; height: number } | null
) => {
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    clearBoard(ctx, canvas.width, canvas.height, transformer);
    drawBackground(ctx, backgroundBitmap, backgroundSize);

    shapesList.forEach((shape) => shape.draw(canvas));
    if (currentShape) {
        currentShape.draw(canvas);
    }

    ctx.restore();
};
