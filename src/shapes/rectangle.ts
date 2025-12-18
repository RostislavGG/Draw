import { Modes } from "../types";
import { Shape } from "./base";

export class Rectangle extends Shape {
    readonly type = Modes.Rectangle;

    x0: number;
    y0: number;
    x1: number;
    y1: number;
    strokeColor: string;
    strokeWidth: number;
    fillColor: string;
    roundEdges: boolean;
    opacity: number;

    constructor(
        id: string,
        x: number,
        y: number,
        sw: number,
        sc: string,
        fc: string,
        re: boolean,
        op: number
    ) {
        super(id);
        this.x0 = x;
        this.y0 = y;
        this.x1 = x;
        this.y1 = y;
        this.strokeColor = sc;
        this.strokeWidth = sw;
        this.fillColor = fc;
        this.roundEdges = re;
        this.opacity = op;
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const x = Math.min(this.x0, this.x1);
        const y = Math.min(this.y0, this.y1);
        const w = Math.abs(this.x1 - this.x0);
        const h = Math.abs(this.y1 - this.y0);

        const r = Math.min(w, h) * 0.15;
        const rClamped = Math.min(r, w / 2, h / 2);

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();

        if (this.roundEdges) {
            ctx.roundRect(x, y, w, h, rClamped);
        } else {
            ctx.rect(x, y, w, h);
        }

        ctx.fillStyle = this.fillColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.strokeColor;

        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    hitTest(x: number, y: number, _: HTMLCanvasElement): boolean {
        return (
            x < Math.max(this.x0, this.x1) + this.strokeWidth / 2 &&
            x > Math.min(this.x0, this.x1) - this.strokeWidth / 2 &&
            y < Math.max(this.y0, this.y1) + this.strokeWidth / 2 &&
            y > Math.min(this.y0, this.y1) - this.strokeWidth / 2
        );
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }
}
