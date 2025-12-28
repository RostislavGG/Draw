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

export const rectBoundsFromHandleDrag = (
    start: Extract<Bounds, { kind: "rect" }>,
    handle: ResizeHandle,
    anchor: { x: number; y: number },
    pointer: { x: number; y: number }
): Extract<Bounds, { kind: "rect" }> => {
    const startX0 = start.x;
    const startY0 = start.y;
    const startX1 = start.x + start.width;
    const startY1 = start.y + start.height;

    if (handle === "n") {
        return {
            kind: "rect",
            x: startX0,
            y: pointer.y,
            width: startX1 - startX0,
            height: startY1 - pointer.y,
        };
    }
    if (handle === "s") {
        return {
            kind: "rect",
            x: startX0,
            y: startY0,
            width: startX1 - startX0,
            height: pointer.y - startY0,
        };
    }
    if (handle === "e") {
        return {
            kind: "rect",
            x: startX0,
            y: startY0,
            width: pointer.x - startX0,
            height: startY1 - startY0,
        };
    }
    if (handle === "w") {
        return {
            kind: "rect",
            x: pointer.x,
            y: startY0,
            width: startX1 - pointer.x,
            height: startY1 - startY0,
        };
    }

    const isW = handle === "nw" || handle === "sw";
    const isN = handle === "nw" || handle === "ne";

    const x = isW ? pointer.x : anchor.x;
    const y = isN ? pointer.y : anchor.y;

    const width = isW ? anchor.x - pointer.x : pointer.x - anchor.x;
    const height = isN ? anchor.y - pointer.y : pointer.y - anchor.y;

    return { kind: "rect", x, y, width, height };
};
