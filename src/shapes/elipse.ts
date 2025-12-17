import { Modes } from "../types";
import { Shape } from "./base";

export class Elipse extends Shape {
    readonly type = Modes.Elipse;

    x0: number;
    y0: number;
    x1: number;
    y1: number;

    strokeColor: string;
    strokeWidth: number;

    constructor(id: string, x: number, y: number, sw: number, sc: string) {
        super(id);
        this.x0 = x;
        this.y0 = y;
        this.x1 = x;
        this.y1 = y;
        this.strokeColor = sc;
        this.strokeWidth = sw;
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        const left = Math.min(this.x0, this.x1);
        const right = Math.max(this.x0, this.x1);
        const top = Math.min(this.y0, this.y1);
        const bottom = Math.max(this.y0, this.y1);

        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        const rx = (right - left) / 2;
        const ry = (bottom - top) / 2;

        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        const left = Math.min(this.x0, this.x1);
        const right = Math.max(this.x0, this.x1);
        const top = Math.min(this.y0, this.y1);
        const bottom = Math.max(this.y0, this.y1);

        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        const rx = (right - left) / 2;
        const ry = (bottom - top) / 2;

        if (rx === 0 || ry === 0) return false;

        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;

        return dx * dx + dy * dy <= 1;
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }
}
