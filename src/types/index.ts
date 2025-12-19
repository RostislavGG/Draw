export enum Modes {
    Select,
    Freehand,
    Rectangle,
    Arrow,
    Elipse,
    Line,
    Typography,
    Eraser,
}

export type ShapeOptions = {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    fontSize: number;
    textAlign: TextAlign;
    opacity: number;
    roundEdges: boolean;
};

export type TrailPoint = {
    x: number;
    y: number;
    t: number;
};

export enum TextAlign {
    Left,
    Center,
    Right,
}
