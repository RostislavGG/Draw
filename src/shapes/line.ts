import { Bounds, Modes, ResizeCtx } from "../types";
import { Shape } from "./base";

export class Line extends Shape {
    type: Modes.Line;

    x0: number;
    y0: number;
    x1: number;
    y1: number;
    private path: Path2D | null = null;

    strokeColor: string;
    strokeWidth: number;

    opacity: number;

    constructor(
        type: Modes.Line,
        id: string,
        x: number,
        y: number,
        sw: number,
        sc: string,
        op: number
    ) {
        super(id);
        this.type = type;

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
        ctx.globalAlpha = this.deletionScheduled
            ? this.opacity / 5
            : this.opacity;

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

    getBounds(): Bounds {
        return {
            kind: "segment",
            x0: this.x0,
            y0: this.y0,
            x1: this.x1,
            y1: this.y1,
        };
    }

    translate(dx: number, dy: number): void {
        this.x0 += dx;
        this.y0 += dy;
        this.x1 += dx;
        this.y1 += dy;
    }

    getResizeSnapshot() {
        return { x0: this.x0, y0: this.y0, x1: this.x1, y1: this.y1 };
    }

    resizeFromHandle(ctx: ResizeCtx): void {
        const snap = ctx.startSnapshot as {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        };

        if (ctx.handle === "a") {
            this.x0 = ctx.pointerWorld.x;
            this.y0 = ctx.pointerWorld.y;
            this.x1 = snap.x1;
            this.y1 = snap.y1;
        } else if (ctx.handle === "b") {
            this.x1 = ctx.pointerWorld.x;
            this.y1 = ctx.pointerWorld.y;
            this.x0 = snap.x0;
            this.y0 = snap.y0;
        }
    }
}
