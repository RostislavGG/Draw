import { Shape } from "../shapes/base";
import { ERASER_TRAIL_MAX, ERASER_TRAIL_MS } from "../constants/trail";
import { TrailPoint } from "../types";

import { Transformer } from "./canvas";

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
