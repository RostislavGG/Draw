import { Bounds, Modes, TextAlign } from "../types";
import { Shape } from "./base";

export class Typography extends Shape {
    readonly type = Modes.Typography;

    x: number;
    y: number;
    width: number = 0;
    height: number;

    text: string;
    fontSize: number;
    textAlign: TextAlign;

    color: string;
    backgroundColor: string;

    opacity: number;

    constructor(
        id: string,
        x: number,
        y: number,
        text: string,
        fontSize: number,
        ta: TextAlign,
        color: string,
        bg: string,
        op: number
    ) {
        super(id);

        this.x = x;
        this.y = y;
        this.height = fontSize;
        this.text = text;
        this.fontSize = fontSize;
        this.textAlign = ta;
        this.color = color;
        this.backgroundColor = bg;
        this.opacity = op;
    }

    private getTextAlign(): string {
        if (this.textAlign === TextAlign.Center) {
            return "center";
        }
        if (this.textAlign === TextAlign.Right) {
            return "right";
        }

        return "left";
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

        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = this.color;
        ctx.textBaseline = "top";
        ctx.textAlign = this.getTextAlign() as CanvasTextAlign;
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

    getBounds(): Bounds {
        return {
            kind: "rect",
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }
}
