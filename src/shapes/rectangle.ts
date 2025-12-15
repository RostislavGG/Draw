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

        ctx.beginPath();
        ctx.rect(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0);
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
    }

    hitTest(x: number, y: number, _: HTMLCanvasElement): boolean {
        return (
            x < Math.max(this.x0, this.x1) &&
            x > Math.min(this.x0, this.x1) &&
            y < Math.max(this.y0, this.y1) &&
            y > Math.min(this.y0, this.y1)
        );
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }
}
