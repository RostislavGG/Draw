export enum Modes {
  Select,
  Freehand,
  Rectangle,
  Arrow,
  Elipse,
  Line,
  Typography,
}

export type BaseShape = {
  id: string;
  type: Modes;
  x: number;
  y: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
};

export type Freehand = BaseShape & {
  type: Modes.Freehand;
  points: [number, number][];
};

export type Rectangle = BaseShape & {
  type: Modes.Rectangle;
  width: number;
  height: number;
};

export type Line = BaseShape & {
  type: Modes.Line;
  endX: number;
  endY: number;
};

export type Typography = BaseShape & {
  type: Modes.Typography;
  fontSize: number;
  text: string;
};

export type Shape = Freehand | Rectangle | Line | Typography;
