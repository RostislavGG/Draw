import { Modes } from "../types";
import { Shape } from "./base";

export class Line extends Shape {
    readonly type = Modes.Line;

    x0: number;
    y0: number;
    x1: number;
    y1: number;
    private path: Path2D | null = null;

    strokeColor: string;
    strokeWidth: number;

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
        this.x0 = x;
        this.y0 = y;
        this.x1 = x;
        this.y1 = y;

        this.strokeColor = sc;
        this.strokeWidth = sw;
        this.opacity = op;
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.opacity;

        ctx.beginPath();
        const newPath = new Path2D();
        newPath.moveTo(this.x0, this.y0);
        newPath.lineTo(this.x1, this.y1);

        ctx.lineCap = "round";
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.strokeColor;

        ctx.stroke(newPath);
        ctx.restore();
        this.path = newPath;
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        if (!this.path) {
            return false;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return false;
        }

        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = "round";

        return (
            ctx.isPointInPath(this.path, x, y) ||
            ctx.isPointInStroke(this.path, x, y)
        );
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }
}
