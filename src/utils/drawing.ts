import { getStroke } from "perfect-freehand";

import { Shape } from "../shapes/base";

import { TrailPoint } from "../types";

import { Transformer, worldToScreen } from "./canvas";

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

const drawHandle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number
) => {
    const r = size / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
};

const drawSelectionAroundShape = (
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    transform: Transformer
) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.save();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(80, 162, 255, 0.95)";

    const handleStroke = "rgba(238, 238, 238, 1)";
    const HANDLE_SIZE = 12;

    const bounds = shape.getBounds();

    if (bounds.kind === "segment") {
        const a = worldToScreen(transform, bounds.x0, bounds.y0);
        const b = worldToScreen(transform, bounds.x1, bounds.y1);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = handleStroke;
        ctx.fillStyle = handleStroke;

        drawHandle(ctx, a.x, a.y, HANDLE_SIZE);
        drawHandle(ctx, b.x, b.y, HANDLE_SIZE);

        ctx.restore();
        return;
    }

    const p0 = worldToScreen(transform, bounds.x, bounds.y);
    const p1 = worldToScreen(
        transform,
        bounds.x + bounds.width,
        bounds.y + bounds.height
    );

    const left = Math.min(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const right = Math.max(p0.x, p1.x);
    const bottom = Math.max(p0.y, p1.y);

    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.stroke();

    const points = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom },
    ];

    ctx.setLineDash([]);
    ctx.strokeStyle = handleStroke;
    ctx.fillStyle = handleStroke;

    for (const pt of points) {
        drawHandle(ctx, pt.x, pt.y, HANDLE_SIZE);
    }

    ctx.restore();
};

export const redraw = (
    canvas: HTMLCanvasElement,
    transformer: Transformer,
    shapesList: Shape[],
    currentShape: Shape | null,
    selectedShape: Shape | null,
    eraserTrail: TrailPoint[],
    now: number
) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    clearBoard(ctx, canvas.width, canvas.height, transformer);

    shapesList.forEach((shape) => shape.draw(canvas));
    if (currentShape) {
        currentShape.draw(canvas);
    }

    if (selectedShape) {
        drawSelectionAroundShape(ctx, selectedShape, transformer);
    }

    if (eraserTrail.length > 0) {
        drawEraserTrail(ctx, eraserTrail, now);
    }

    ctx.restore();
};
