import { Modes } from "../types";
import { Shape } from "./base";

export class Typography extends Shape {
    readonly type = Modes.Typography;

    x: number;
    y: number;
    width: number = 0;
    height: number;

    text: string;
    fontSize: number;
    color: string;

    opacity: number;

    constructor(
        id: string,
        x: number,
        y: number,
        text: string,
        fontSize: number,
        color: string,
        op: number
    ) {
        super(id);

        this.x = x;
        this.y = y;
        this.height = fontSize;
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.opacity = op;
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = this.opacity;

        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = this.color;
        ctx.textBaseline = "top";
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();

        this.width = ctx.measureText(this.text).width;
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    updateShape(x: number, y: number): void {}
}
