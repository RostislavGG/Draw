import { Bounds, HandleInfo, RectHandle } from "../types";

import { Transformer, worldToScreen } from "./canvas";

const rectCursor: Record<RectHandle, string> = {
    nw: "nwse-resize",
    se: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
};

export const HANDLE_SIZE_PX = 12;
export const HANDLE_HIT_RADIUS_PX = 10;

export const getHandlesForBounds = (
    bounds: Bounds,
    t: Transformer
): HandleInfo[] => {
    if (bounds.kind === "segment") {
        const a = worldToScreen(t, bounds.x0, bounds.y0);
        const b = worldToScreen(t, bounds.x1, bounds.y1);
        return [
            { id: "a", sx: a.x, sy: a.y, cursor: "grab" },
            { id: "b", sx: b.x, sy: b.y, cursor: "grab" },
        ];
    }

    const x0 = bounds.x;
    const y0 = bounds.y;
    const x1 = bounds.x + bounds.width;
    const y1 = bounds.y + bounds.height;

    const pts: Array<{ id: RectHandle; wx: number; wy: number }> = [
        { id: "nw", wx: x0, wy: y0 },
        { id: "ne", wx: x1, wy: y0 },
        { id: "se", wx: x1, wy: y1 },
        { id: "sw", wx: x0, wy: y1 },
    ];

    return pts.map((p) => {
        const s = worldToScreen(t, p.wx, p.wy);
        return { id: p.id, sx: s.x, sy: s.y, cursor: rectCursor[p.id] };
    });
};

export const hitTestHandles = (
    handles: HandleInfo[],
    screenX: number,
    screenY: number,
    radiusPx = HANDLE_HIT_RADIUS_PX
): HandleInfo | null => {
    const r2 = radiusPx * radiusPx;
    for (const h of handles) {
        const dx = screenX - h.sx;
        const dy = screenY - h.sy;
        if (dx * dx + dy * dy <= r2) return h;
    }
    return null;
};

export const BORDER_HIT_PAD_PX = 10;
export const BORDER_CORNER_PAD_PX = 12;

export const cursorForRectHandle = (h: RectHandle): string => rectCursor[h];

export const hitTestSelectionBorder = (
    bounds: Bounds,
    t: Transformer,
    screenX: number,
    screenY: number,
    padPx: number = BORDER_HIT_PAD_PX,
    cornerPadPx: number = BORDER_CORNER_PAD_PX
): RectHandle | null => {
    if (bounds.kind !== "rect") return null;

    const p0 = worldToScreen(t, bounds.x, bounds.y);
    const p1 = worldToScreen(
        t,
        bounds.x + bounds.width,
        bounds.y + bounds.height
    );

    const left = Math.min(p0.x, p1.x);
    const right = Math.max(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const bottom = Math.max(p0.y, p1.y);

    if (
        screenX < left - padPx ||
        screenX > right + padPx ||
        screenY < top - padPx ||
        screenY > bottom + padPx
    ) {
        return null;
    }

    const cornerHit = (cx: number, cy: number) => {
        const dx = screenX - cx;
        const dy = screenY - cy;
        return dx * dx + dy * dy <= cornerPadPx * cornerPadPx;
    };

    if (cornerHit(left, top)) return "nw";
    if (cornerHit(right, top)) return "ne";
    if (cornerHit(right, bottom)) return "se";
    if (cornerHit(left, bottom)) return "sw";

    const innerL = left + padPx;
    const innerR = right - padPx;
    const innerT = top + padPx;
    const innerB = bottom - padPx;

    const insideInner =
        screenX >= innerL &&
        screenX <= innerR &&
        screenY >= innerT &&
        screenY <= innerB;

    if (insideInner) return null;

    // Choose nearest edge
    const dLeft = Math.abs(screenX - left);
    const dRight = Math.abs(screenX - right);
    const dTop = Math.abs(screenY - top);
    const dBottom = Math.abs(screenY - bottom);

    const min = Math.min(dLeft, dRight, dTop, dBottom);

    if (min === dLeft) return "w";
    if (min === dRight) return "e";
    if (min === dTop) return "n";
    return "s";
};
