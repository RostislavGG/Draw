import { Bounds, Modes } from "../types";
import { Shape } from "./base";

export class Area extends Shape {
    type: Modes.Screenshot;

    x0: number;
    y0: number;
    x1: number;
    y1: number;

    constructor(type: Modes.Screenshot, id: string, x: number, y: number) {
        super(id);
        this.type = type;

        this.x0 = x;
        this.y0 = y;
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

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.save();

        // Smoother dash than [5,5,5,5]
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = 0;

        // Build a multi-color gradient stroke (works regardless of background)
        const grad = ctx.createLinearGradient(
            this.x0,
            this.y0,
            this.x1 - this.x0,
            this.y1 - this.y0
        );
        grad.addColorStop(0.0, "rgba(255, 0, 102, 0.95)");
        grad.addColorStop(0.2, "rgba(255, 153, 0, 0.95)");
        grad.addColorStop(0.4, "rgba(255, 255, 0, 0.95)");
        grad.addColorStop(0.6, "rgba(0, 200, 255, 0.95)");
        grad.addColorStop(0.8, "rgba(140, 0, 255, 0.95)");
        grad.addColorStop(1.0, "rgba(255, 0, 200, 0.95)");

        ctx.beginPath();
        ctx.rect(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0);

        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.65)";
        ctx.stroke();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = grad;
        ctx.stroke();

        ctx.closePath();
        ctx.restore();
    }

    hitTest(x: number, y: number, _: HTMLCanvasElement): boolean {
        return false;
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }

    translate(dx: number, dy: number): void {
        this.x0 += dx;
        this.y0 += dy;
        this.x1 += dx;
        this.y1 += dy;
    }
}
