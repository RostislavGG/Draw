import { Modes, SelectGesture } from "../types";

type CursorName = CSSStyleDeclaration["cursor"];

export type UpdateCursorArgs = {
    canvas: HTMLCanvasElement | null;
    isFocused: boolean;
    isPointerOverCanvas: boolean;
    mode: Modes;
    gesture: SelectGesture;
    isMouseDown: boolean;
    isEditingText: boolean;
    hitHandleCursor?: CursorName | null;
    hitBorderCursor?: CursorName | null;
    isHoveringShape?: boolean;
};

const NON_DRAWING_MODES = new Set<Modes>([Modes.Select, Modes.Forward]);

export const isShapeDrawingMode = (mode: Modes) => {
    return !NON_DRAWING_MODES.has(mode);
};

export const updateCanvasCursor = (args: UpdateCursorArgs): CursorName => {
    const {
        canvas,
        isFocused,
        isPointerOverCanvas,
        mode,
        gesture,
        isMouseDown,
        isEditingText,
        hitHandleCursor = null,
        hitBorderCursor = null,
        isHoveringShape = false,
    } = args;

    if (!canvas) return "default";

    if (!isFocused || !isPointerOverCanvas) {
        canvas.style.cursor = "default";
        return "default";
    }

    if (isShapeDrawingMode(mode)) {
        if (isEditingText) {
            canvas.style.cursor = "default";
            return "default";
        }

        canvas.style.cursor = "none";
        return "none";
    }

    if (mode === Modes.Select) {
        if (isMouseDown) {
            if (gesture.kind === "resize") {
                const c =
                    hitHandleCursor ??
                    hitBorderCursor ??
                    gesture.cursor ??
                    "default";
                canvas.style.cursor = c;
                return c;
            }

            if (gesture.kind === "drag-shape") {
                canvas.style.cursor = "move";
                return "move";
            }

            if (gesture.kind === "pan") {
                canvas.style.cursor = "grabbing";
                return "grabbing";
            }
        }

        if (hitHandleCursor) {
            canvas.style.cursor = hitHandleCursor;
            return hitHandleCursor;
        }
        if (hitBorderCursor) {
            canvas.style.cursor = hitBorderCursor;
            return hitBorderCursor;
        }

        if (isHoveringShape) {
            canvas.style.cursor = "move";
            return "move";
        }

        canvas.style.cursor = "default";
        return "default";
    }

    canvas.style.cursor = "default";
    return "default";
};

export const makeAreaGradient = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number
) => {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0.0, "rgba(255, 0, 102, 0.95)");
    grad.addColorStop(0.2, "rgba(255, 153, 0, 0.95)");
    grad.addColorStop(0.4, "rgba(255, 255, 0, 0.95)");
    grad.addColorStop(0.6, "rgba(0, 200, 255, 0.95)");
    grad.addColorStop(0.8, "rgba(140, 0, 255, 0.95)");
    grad.addColorStop(1.0, "rgba(255, 0, 200, 0.95)");
    return grad;
};
