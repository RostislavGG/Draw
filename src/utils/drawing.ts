import { getStroke } from "perfect-freehand";

import { Shape } from "../shapes/base";

import { TrailPoint } from "../types";

import { Transformer } from "./canvas";

export const getStrokeString = (stroke: number[][]) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
};

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

const drawEraserTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailPoint[],
    now: number
) => {
    if (trail.length < 2) {
        return;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const myPath = getStroke(
        trail.map((t) => [t.x, t.y]),
        {
            size: 14,
        }
    );

    const pathData = getStrokeString(myPath);
    const path = new Path2D(pathData);

    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = "#c0c0c0ff";
    ctx.fill(path);

    ctx.restore();
};

export const redraw = (
    canvas: HTMLCanvasElement,
    transformer: Transformer,
    shapesList: Shape[],
    currentShape: Shape | null,
    backgroundBitmap: ImageBitmap | null,
    backgroundSize: { width: number; height: number } | null,
    eraserTrail: TrailPoint[],
    now: number
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

    if (eraserTrail.length > 0) {
        drawEraserTrail(ctx, eraserTrail, now);
    }

    ctx.restore();
};
