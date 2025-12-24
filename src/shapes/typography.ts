import { Bounds, Modes, TextAlign, FontStyle } from "../types";

import { Shape } from "./base";

export class Typography extends Shape {
    type: Modes.Typography;

    x: number;
    y: number;
    width: number = 0;
    height: number;

    text: string;
    fontSize: number;
    textAlign: TextAlign;
    fontStyle: FontStyle;

    color: string;
    backgroundColor: string;

    opacity: number;

    constructor(
        type: Modes.Typography,
        id: string,
        x: number,
        y: number,
        text: string,
        fontSize: number,
        ta: TextAlign,
        fs: FontStyle,
        color: string,
        bg: string,
        op: number
    ) {
        super(id);

        this.type = type;
        this.x = x;
        this.y = y;
        this.height = fontSize;
        this.text = text;
        this.fontSize = fontSize;
        this.textAlign = ta;
        this.fontStyle = fs;
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
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = this.deletionScheduled
            ? this.opacity / 5
            : this.opacity;

        let font = `${this.fontSize}px sans-serif`;
        if (this.fontStyle === FontStyle.Bold) font = "bold " + font;
        else if (this.fontStyle === FontStyle.Italic) font = "italic " + font;

        ctx.font = font;
        ctx.textBaseline = "top";
        ctx.textAlign = this.getTextAlign() as CanvasTextAlign;

        const lines = this.text.split("\n");
        const lineHeight = this.fontSize * 1.25;

        // Measure max line width
        let maxW = 0;
        for (const line of lines) {
            const w = ctx.measureText(line.length ? line : " ").width;
            if (w > maxW) maxW = w;
        }

        const textH = lines.length * lineHeight;

        // Padding around background (in canvas pixels)
        const pad = Math.max(2, Math.round(this.fontSize * 0.2));
        const bgW = maxW + pad * 2;
        const bgH = textH + pad * 2;

        // Alignment-aware background X (because x is the text anchor)
        const bgX =
            this.textAlign === TextAlign.Center
                ? this.x - maxW / 2 - pad
                : this.textAlign === TextAlign.Right
                ? this.x - maxW - pad
                : this.x - pad;

        const bgY = this.y - pad;

        // Background + faint rounded border
        const hasBg =
            this.backgroundColor &&
            this.backgroundColor !== "transparent" &&
            this.backgroundColor !== "none" &&
            this.backgroundColor !== "rgba(0,0,0,0)";

        if (hasBg) {
            const r = Math.max(2, Math.round(this.fontSize * 0.25)); // faint roundness

            ctx.beginPath();
            ctx.roundRect(bgX, bgY, bgW, bgH, r);

            ctx.fillStyle = this.backgroundColor;
            ctx.fill();

            // subtle border
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Text
        ctx.fillStyle = this.color;
        for (let i = 0; i < lines.length; i++) {
            const y = this.y + i * lineHeight;
            ctx.fillText(lines[i], this.x, y);
        }

        ctx.restore();

        // Store bounds INCLUDING padding so hitTest matches background area
        this.width = bgW;
        this.height = bgH;
    }

    hitTest(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        const pad = Math.max(2, Math.round(this.fontSize * 0.2));
        const bgX =
            this.textAlign === TextAlign.Center
                ? this.x - (this.width - pad * 2) / 2 - pad
                : this.textAlign === TextAlign.Right
                ? this.x - (this.width - pad * 2) - pad
                : this.x - pad;

        const bgY = this.y - pad;

        return (
            x >= bgX &&
            x <= bgX + this.width &&
            y >= bgY &&
            y <= bgY + this.height
        );
    }

    updateShape(x: number, y: number): void {}

    getBounds(): Bounds {
        const pad = Math.max(2, Math.round(this.fontSize * 0.2));
        const bgX =
            this.textAlign === TextAlign.Center
                ? this.x - (this.width - pad * 2) / 2 - pad
                : this.textAlign === TextAlign.Right
                ? this.x - (this.width - pad * 2) - pad
                : this.x - pad;

        const bgY = this.y - pad;

        return {
            kind: "rect",
            x: bgX,
            y: bgY,
            width: this.width,
            height: this.height,
        };
    }

    translate(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}
