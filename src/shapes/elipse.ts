import { Bounds, Modes } from "../types";
import { Shape } from "./base";

export class Elipse extends Shape {
    readonly type = Modes.Elipse;

    x0: number;
    y0: number;
    x1: number;
    y1: number;

    strokeColor: string;
    strokeWidth: number;
    fillColor: string;

    opacity: number;

    constructor(
        id: string,
        x: number,
        y: number,
        sw: number,
        sc: string,
        fc: string,
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
        this.opacity = op;
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

        const sw = this.strokeWidth ?? 0;
        const half = sw / 2;

        ctx.save();
        ctx.globalAlpha = this.deletionScheduled
            ? this.opacity / 5
            : this.opacity;

        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = sw;

        const frx = Math.max(0, rx - half);
        const fry = Math.max(0, ry - half);

        if (frx > 0 && fry > 0) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, frx, fry, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (sw > 0 && rx > 0 && ry > 0) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
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

    getBounds(): Bounds {
        const minX = Math.min(this.x0, this.x1);
        const minY = Math.min(this.y0, this.y1);
        const maxX = Math.max(this.x0, this.x1);
        const maxY = Math.max(this.y0, this.y1);

        return {
            kind: "rect",
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    translate(dx: number, dy: number): void {
        this.x0 += dx;
        this.y0 += dy;
        this.x1 += dx;
        this.y1 += dy;
    }
}
