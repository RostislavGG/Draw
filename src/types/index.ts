export enum Modes {
    Select,
    Freehand,
    Rectangle,
    Arrow,
    Elipse,
    Line,
    Typography,
}

export type ShapeOptions = {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    opacity: number;
    roundEdges: boolean;
};
