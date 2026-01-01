import getStroke from "perfect-freehand";

import { LASER_TRAIL_MAX, LASER_TRAIL_MS } from "../constants/trail";
import type { TrailPoint } from "../types";

import { clamp } from "./math";
import { getStrokeString } from "./freehand";

export const pruneLaserTrail = (trail: TrailPoint[], now: number) => {
    const cutoff = now - LASER_TRAIL_MS;

    while (trail.length && trail[0].t < cutoff) {
        trail.shift();
    }

    if (trail.length > LASER_TRAIL_MAX) {
        trail.splice(0, trail.length - LASER_TRAIL_MAX);
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

export const drawLaserTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailPoint[],
    dpr: number,
    color: string,
    now: number
) => {
    if (trail.length < 2) return;

    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const life01 = (t: number) => clamp(1 - (now - t) / LASER_TRAIL_MS, 0, 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = trail.length;

    const points: Array<[number, number, number]> = trail.map((p, i) => {
        const progress = n <= 1 ? 1 : i / (n - 1); // 0 tail -> 1 head
        const life = life01(p.t);

        const headBias = 0.15 + 0.85 * Math.pow(progress, 0.75);
        const pressure = clamp(life * headBias, 0, 1);

        return [p.x, p.y, pressure];
    });

    const len = trailLengthPx(trail);

    const baseSize = 3;

    const tailTaper = clamp(len * 0.7, baseSize * 1.0, baseSize * 7);

    const newestLife = life01(trail[n - 1].t);
    const globalAlpha = Math.pow(newestLife, 1.1);

    const outline = getStroke(points, {
        size: baseSize,
        thinning: 0.75,
        smoothing: 0.45,
        streamline: 0.6,
        simulatePressure: false,
        last: true,

        start: { taper: tailTaper, cap: false, easing: smoothstep },
        end: { taper: 0, cap: true },
    });

    const path = new Path2D(getStrokeString(outline));

    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.restore();
};
