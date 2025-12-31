import getStroke from "perfect-freehand";

import { Shape } from "../shapes/base";
import { ERASER_TRAIL_MAX, ERASER_TRAIL_MS } from "../constants/trail";
import { TrailPoint } from "../types";

import { Transformer } from "./canvas";
import { clamp } from "./math";
import { getStrokeString } from "./freehand";

export const eraseAlongSegment = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    canvas: HTMLCanvasElement,
    viewportTransform: Transformer,
    shapes: Shape[]
) => {
    const stepWorld = 4 / viewportTransform.scale;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);

    const steps = Math.max(1, Math.ceil(dist / stepWorld));

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const sx = a.x + dx * t;
        const sy = a.y + dy * t;

        for (let j = shapes.length - 1; j >= 0; j--) {
            const shape = shapes[j];
            if (shape.deletionScheduled) continue;

            if (shape.hitTest(sx, sy, canvas)) {
                shape.deletionScheduled = true;
            }
        }
    }
};

export const pruneTrail = (eraserTrail: TrailPoint[], now: number) => {
    const cutoff = now - ERASER_TRAIL_MS;
    while (eraserTrail.length && eraserTrail[0].t < cutoff) {
        eraserTrail.shift();
    }

    if (eraserTrail.length > ERASER_TRAIL_MAX) {
        eraserTrail = eraserTrail.slice(-ERASER_TRAIL_MAX);
    }
};

const trailLengthPx = (trail: TrailPoint[]) => {
    let len = 0;
    for (let i = 1; i < trail.length; i++) {
        const dx = trail[i].x - trail[i - 1].x;
        const dy = trail[i].y - trail[i - 1].y;
        len += Math.hypot(dx, dy);
    }
    return len;
};

export const drawEraserTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailPoint[],
    dpr: number
) => {
    if (trail.length < 2) return;

    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const size = 8;
    const len = trailLengthPx(trail);

    const tailTaper = clamp(len * 0.6, size * 1.0, size * 6);

    const outline = getStroke(
        trail.map((t) => [t.x, t.y]),
        {
            size,
            thinning: 0,
            smoothing: 0.35,
            streamline: 0.65,
            simulatePressure: false,
            last: true,

            start: { taper: tailTaper, cap: false, easing: smoothstep },

            end: { taper: 0, cap: true },
        }
    );

    const path = new Path2D(getStrokeString(outline));
    ctx.save();
    ctx.fillStyle = "#c0c0c0ff";
    ctx.fill(path);
    ctx.restore();
};
