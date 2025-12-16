export type Transformer = {
    scale: number;
    x: number;
    y: number;
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
