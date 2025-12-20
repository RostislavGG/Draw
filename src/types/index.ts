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

export type Bounds =
    | { kind: "rect"; x: number; y: number; width: number; height: number }
    | { kind: "segment"; x0: number; y0: number; x1: number; y1: number };

export type SelectGesture =
    | { kind: "none" }
    | {
          kind: "pan";
          startX: number;
          startY: number;
          camX: number;
          camY: number;
      }
    | {
          kind: "drag-shape";
          shapeId: string;
          lastWorldX: number;
          lastWorldY: number;
      };
