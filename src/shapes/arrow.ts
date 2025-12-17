import { Modes } from "../types";
import { Shape } from "./base";

export class Arrow extends Shape {
    readonly type = Modes.Arrow;

    x0: number;
    y0: number;
    x1: number;
    y1: number;
    private path: Path2D | null = null;

    strokeWidth: number;
    strokeColor: string;

    constructor(id: string, x: number, y: number, sw: number, sc: string) {
        super(id);
        this.x0 = x;
        this.y0 = y;
        this.x1 = x;
        this.y1 = y;

        this.strokeWidth = sw;
        this.strokeColor = sc;
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        const arrowHeadLength = 40;

        const angle = Math.atan2(this.y1 - this.y0, this.x1 - this.x0);

        const newPath = new Path2D();

        ctx.beginPath();
        newPath.moveTo(this.x0, this.y0);
        newPath.lineTo(this.x1, this.y1);

        const firstHeadPointX =
            this.x1 - arrowHeadLength * Math.cos(angle - Math.PI / 6);
        const firstHeadPointY =
            this.y1 - arrowHeadLength * Math.sin(angle - Math.PI / 6);
        const secondtHeadPointX =
            this.x1 - arrowHeadLength * Math.cos(angle + Math.PI / 6);
        const secondHeadPointY =
            this.y1 - arrowHeadLength * Math.sin(angle + Math.PI / 6);

        newPath.moveTo(firstHeadPointX, firstHeadPointY);
        newPath.lineTo(this.x1, this.y1);
        newPath.moveTo(secondtHeadPointX, secondHeadPointY);
        newPath.lineTo(this.x1, this.y1);

        ctx.lineCap = "round";
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.strokeColor;

        ctx.stroke(newPath);
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

        return ctx.isPointInStroke(this.path, x, y);
    }

    updateShape(x: number, y: number): void {
        this.x1 = x;
        this.y1 = y;
    }
}
