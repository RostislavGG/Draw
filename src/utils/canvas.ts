export type Transformer = {
    scale: number;
    x: number;
    y: number;
};

export type ViewInsets = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

export const screenToWorld = (
    transformer: Transformer,
    sx: number,
    sy: number
) => {
    return {
        x: (sx - transformer.x) / transformer.scale,
        y: (sy - transformer.y) / transformer.scale,
    };
};

export const worldToScreen = (t: Transformer, x: number, y: number) => ({
    x: x * t.scale + t.x,
    y: y * t.scale + t.y,
});

const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

export const clampToBackground = (
    transformer: Transformer,
    canvas: HTMLCanvasElement,
    backgroundSize: { width: number; height: number },
    insets: ViewInsets = { left: 0, top: 0, right: 0, bottom: 0 }
) => {
    const bgW = Math.max(1, backgroundSize.width - insets.left - insets.right);
    const bgH = Math.max(1, backgroundSize.height - insets.top - insets.bottom);

    const scaledW = bgW * transformer.scale;
    const scaledH = bgH * transformer.scale;

    if (scaledW <= canvas.width) {
        transformer.x = (canvas.width - scaledW) / 2;
    } else {
        transformer.x = clamp(transformer.x, canvas.width - scaledW, 0);
    }

    if (scaledH <= canvas.height) {
        transformer.y = (canvas.height - scaledH) / 2;
    } else {
        transformer.y = clamp(transformer.y, canvas.height - scaledH, 0);
    }
};
