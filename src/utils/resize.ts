import { Bounds, ResizeHandle } from "../types";

export const getResizeAnchorWorld = (bounds: Bounds, handle: ResizeHandle) => {
    if (bounds.kind === "segment") {
        return handle === "a"
            ? { x: bounds.x1, y: bounds.y1 }
            : { x: bounds.x0, y: bounds.y0 };
    }

    const x0 = bounds.x;
    const y0 = bounds.y;
    const x1 = bounds.x + bounds.width;
    const y1 = bounds.y + bounds.height;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

    switch (handle) {
        case "nw":
            return { x: x1, y: y1 };
        case "n":
            return { x: cx, y: y1 };
        case "ne":
            return { x: x0, y: y1 };
        case "e":
            return { x: x0, y: cy };
        case "se":
            return { x: x0, y: y0 };
        case "s":
            return { x: cx, y: y0 };
        case "sw":
            return { x: x1, y: y0 };
        case "w":
            return { x: x1, y: cy };
        default:
            return { x: x0, y: y0 };
    }
};

// returns a normalized rect bounds (width/height >= 0)
export const rectBoundsFromHandleDrag = (
    start: Extract<Bounds, { kind: "rect" }>,
    handle: ResizeHandle,
    anchor: { x: number; y: number },
    pointer: { x: number; y: number },
    minSize = 2
): Extract<Bounds, { kind: "rect" }> => {
    // Only valid for rect handles
    // Compute raw corners based on anchor + pointer, then normalize.
    let left = Math.min(anchor.x, pointer.x);
    let right = Math.max(anchor.x, pointer.x);
    let top = Math.min(anchor.y, pointer.y);
    let bottom = Math.max(anchor.y, pointer.y);

    // Side handles should lock one axis to anchor line
    // (because for "e"/"w" you want height unchanged, etc.)
    const startX0 = start.x;
    const startY0 = start.y;
    const startX1 = start.x + start.width;
    const startY1 = start.y + start.height;

    if (handle === "n" || handle === "s") {
        left = startX0;
        right = startX1;
        // vertical changes only
        if (handle === "n") {
            bottom = startY1;
            top = pointer.y;
        } else {
            top = startY0;
            bottom = pointer.y;
        }
    } else if (handle === "e" || handle === "w") {
        top = startY0;
        bottom = startY1;
        if (handle === "w") {
            right = startX1;
            left = pointer.x;
        } else {
            left = startX0;
            right = pointer.x;
        }
    } else if (
        handle === "ne" ||
        handle === "nw" ||
        handle === "se" ||
        handle === "sw"
    ) {
        // corners already fine (anchor+pointer)
    } else {
        // segment handles shouldn't call this
    }

    // enforce min size
    if (right - left < minSize) {
        const mid = (left + right) / 2;
        left = mid - minSize / 2;
        right = mid + minSize / 2;
    }
    if (bottom - top < minSize) {
        const mid = (top + bottom) / 2;
        top = mid - minSize / 2;
        bottom = mid + minSize / 2;
    }

    return {
        kind: "rect",
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
};
