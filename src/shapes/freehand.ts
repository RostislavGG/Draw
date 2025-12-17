import { getStroke } from "perfect-freehand";

import { Modes } from "../types";

import { Shape } from "./base";

export class Freehand extends Shape {
    readonly type = Modes.Freehand;

    private path: Path2D | null = null;
    points: [number, number][];
    strokeWidth: number;
    strokeColor: string;

    constructor(id: string, x: number, y: number, sw: number, sc: string) {
        super(id);
        this.points = [[x, y]];
        this.strokeColor = sc;
        this.strokeWidth = sw;
    }

    private getStrokeString = (stroke: number[][]) => {
        if (!stroke.length) return "";

        const d = stroke.reduce(
            (acc, [x0, y0], i, arr) => {
                const [x1, y1] = arr[(i + 1) % arr.length];
                acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
                return acc;
            },
            ["M", ...stroke[0], "Q"]
        );

        d.push("Z");
        return d.join(" ");
    };

    draw(canvas: HTMLCanvasElement): void {
        if (this.points.length === 0) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const myPath = getStroke(this.points, {
            size: this.strokeWidth,
        });

        const pathData = this.getStrokeString(myPath);
        const path = new Path2D(pathData);
        this.path = path;
        ctx.beginPath();
        ctx.fillStyle = this.strokeColor;
        ctx.fill(path);
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        if (!this.path) {
            return false;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return false;
        }

        return ctx.isPointInPath(this.path, x, y);
    }

    updateShape(x: number, y: number): void {
        this.points.push([x, y]);
    }
}
