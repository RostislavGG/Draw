export enum Modes {
    Select,
    Freehand,
    Rectangle,
    Arrow,
    Elipse,
    Line,
    Typography,
    Eraser,
    Forward,
    Screenshot,
    Video,
}

export type ShapeOptions = {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    fontSize: number;
    textAlign: TextAlign;
    fontStyle: FontStyle;
    opacity: number;
    roundEdges: boolean;
};

export type TrailPoint = {
    x: number;
    y: number;
    t: number;
};

export type TextData = {
    x: number;
    y: number;
    text: string;
    key: number;
    color: string;
    bgColor: string;
    fontSize: number;
    textAlign: TextAlign;
    opacity: number;
    fontStyle: FontStyle;
};

export enum TextAlign {
    Left,
    Center,
    Right,
}

export enum FontStyle {
    Normal,
    Italic,
    Bold,
}

export type Bounds =
    | { kind: "rect"; x: number; y: number; width: number; height: number }
    | { kind: "segment"; x0: number; y0: number; x1: number; y1: number };

export type RectHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type SegmentHandle = "a" | "b";

export type ResizeHandle = RectHandle | SegmentHandle;

export type HandleInfo = {
    id: ResizeHandle;
    sx: number;
    sy: number;
    cursor: string;
};

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
      }
    | {
          kind: "resize";
          shapeId: string;
          handle: ResizeHandle;
          startBounds: Bounds;
          anchorWorld: { x: number; y: number };
          startSnapshot: any;
          cursor: string;
      };

export type ResizeCtx = {
    handle: ResizeHandle;
    pointerWorld: { x: number; y: number };
    anchorWorld: { x: number; y: number };
    startBounds: Bounds;
    startSnapshot: any;
};

export type HitTestOptions = {
    hitSlop?: number;
};
