import { getStroke } from "perfect-freehand";

import { Bounds, Modes } from "../types";

import { getStrokeString } from "../utils/drawing";
import { makeLaserFillStyle } from "../utils/freehand-colors";

import { Shape } from "./base";

export class Freehand extends Shape {
    readonly type = Modes.Freehand;

    private path: Path2D | null = null;
    points: [number, number][];
    strokeWidth: number;
    strokeColor: string;

    opacity: number;

    constructor(
        id: string,
        x: number,
        y: number,
        sw: number,
        sc: string,
        op: number
    ) {
        super(id);
        this.points = [[x, y]];
        this.strokeColor = sc;
        this.strokeWidth = sw;
        this.opacity = op;
    }

    draw(canvas: HTMLCanvasElement): void {
        if (this.points.length === 0) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const myPath = getStroke(this.points, { size: this.strokeWidth * 2 });
        const pathData = getStrokeString(myPath);
        const path = new Path2D(pathData);
        this.path = path;

        const op = this.deletionScheduled ? this.opacity / 5 : this.opacity;

        const laserFill = makeLaserFillStyle(this.strokeColor, {
            blend: "source-over",
            glowScale: 1,
            innerLift: 0.1,
            outerLift: 0.16,
        });

        laserFill(ctx, path, this.strokeWidth, op);
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        if (!this.path) {
            return false;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return false;
        }

        return (
            ctx.isPointInStroke(this.path, x, y) ||
            ctx.isPointInPath(this.path, x, y)
        );
    }

    updateShape(x: number, y: number): void {
        this.points.push([x, y]);
    }

    getBounds(): Bounds {
        if (this.points.length < 1) {
            return { kind: "rect", x: -10, y: -10, width: 0, height: 0 };
        }

        let currentMinX = this.points[0][0];
        let currentMinY = this.points[0][1];
        let currentMaxX = this.points[0][0];
        let currentMaxY = this.points[0][1];

        for (let i = 0; i < this.points.length; i++) {
            if (currentMinX > this.points[i][0]) {
                currentMinX = this.points[i][0];
            }
            if (currentMaxX < this.points[i][0]) {
                currentMaxX = this.points[i][0];
            }
            if (currentMinY > this.points[i][1]) {
                currentMinY = this.points[i][1];
            }
            if (currentMaxY < this.points[i][1]) {
                currentMaxY = this.points[i][1];
            }
        }

        return {
            kind: "rect",
            x: currentMinX,
            y: currentMinY,
            width: currentMaxX - currentMinX,
            height: currentMaxY - currentMinY,
        };
    }
}
