import { clamp } from "../utils/math";
import { rectBoundsFromHandleDrag } from "../utils/resize";

import { Bounds, Modes, TextAlign, FontStyle, ResizeHandle } from "../types";

import { Shape } from "./base";

type ResizeSnapshot = {
    x: number;
    y: number;
    fontSize: number;
    textAlign: TextAlign;
    fontStyle: FontStyle;
    text: string;
};

type Measure = {
    lines: string[];
    lineHeight: number;
    maxW: number;
    textH: number;
    pad: number;
    bgW: number;
    bgH: number;
};

export class Typography extends Shape {
    type: Modes.Typography;

    x: number;
    y: number;

    width: number = 0;
    height: number = 0;

    text: string;
    fontSize: number;
    textAlign: TextAlign;
    fontStyle: FontStyle;

    color: string;
    backgroundColor: string;

    opacity: number;

    private static _measureCanvas: HTMLCanvasElement | null = null;

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
        this.text = text;

        this.fontSize = fontSize;
        this.textAlign = ta;
        this.fontStyle = fs;

        this.color = color;
        this.backgroundColor = bg;
        this.opacity = op;

        this._syncBoundsFromMeasure();
    }

    private getTextAlignCanvas(): CanvasTextAlign {
        if (this.textAlign === TextAlign.Center) return "center";
        if (this.textAlign === TextAlign.Right) return "right";
        return "left";
    }

    private _fontString(fontPx: number) {
        let font = `${fontPx}px sans-serif`;
        if (this.fontStyle === FontStyle.Bold) font = "bold " + font;
        else if (this.fontStyle === FontStyle.Italic) font = "italic " + font;
        return font;
    }

    private _getMeasureCtx(): CanvasRenderingContext2D | null {
        if (!Typography._measureCanvas) {
            Typography._measureCanvas = document.createElement("canvas");
            Typography._measureCanvas.width = 10;
            Typography._measureCanvas.height = 10;
        }
        return Typography._measureCanvas.getContext("2d");
    }

    private _measure(fontSize = this.fontSize): Measure {
        const ctx = this._getMeasureCtx();
        const safeFontSize = Math.max(1, Math.round(fontSize));

        const lines = (this.text ?? "").split("\n");
        const lineHeight = safeFontSize * 1.25;

        const pad = Math.max(2, Math.round(safeFontSize * 0.2));

        if (!ctx) {
            const textH = Math.max(1, lines.length) * lineHeight;
            const bgW = pad * 2;
            const bgH = textH + pad * 2;
            return { lines, lineHeight, maxW: 0, textH, pad, bgW, bgH };
        }

        ctx.save();
        ctx.font = this._fontString(safeFontSize);
        ctx.textBaseline = "top";
        ctx.textAlign = this.getTextAlignCanvas();

        let maxW = 0;
        for (const line of lines) {
            const w = ctx.measureText(line.length ? line : " ").width;
            if (w > maxW) maxW = w;
        }
        ctx.restore();

        const textH = Math.max(1, lines.length) * lineHeight;
        const bgW = maxW + pad * 2;
        const bgH = textH + pad * 2;

        return { lines, lineHeight, maxW, textH, pad, bgW, bgH };
    }

    private _syncBoundsFromMeasure() {
        const m = this._measure();
        this.width = m.bgW;
        this.height = m.bgH;
    }

    private _bgRectFromState() {
        const m = this._measure();
        const bgW = m.bgW;
        const bgH = m.bgH;

        const bgX =
            this.textAlign === TextAlign.Center
                ? this.x - (bgW - m.pad * 2) / 2 - m.pad
                : this.textAlign === TextAlign.Right
                ? this.x - (bgW - m.pad * 2) - m.pad
                : this.x - m.pad;

        const bgY = this.y - m.pad;

        this.width = bgW;
        this.height = bgH;

        return { bgX, bgY, ...m };
    }

    private _setFromBgRect(bgX: number, bgY: number, m: Measure) {
        this.y = bgY + m.pad;

        if (this.textAlign === TextAlign.Left) {
            this.x = bgX + m.pad;
        } else if (this.textAlign === TextAlign.Right) {
            this.x = bgX + m.pad + m.maxW;
        } else {
            this.x = bgX + m.pad + m.maxW / 2;
        }

        this.width = m.bgW;
        this.height = m.bgH;
    }

    getResizeSnapshot(): ResizeSnapshot {
        return {
            x: this.x,
            y: this.y,
            fontSize: this.fontSize,
            textAlign: this.textAlign,
            fontStyle: this.fontStyle,
            text: this.text,
        };
    }

    resizeFromHandle(args: {
        handle: ResizeHandle;
        pointerWorld: { x: number; y: number };
        anchorWorld: { x: number; y: number };
        startBounds: Bounds;
        startSnapshot: unknown;
    }): void {
        if (args.startBounds.kind !== "rect") return;

        const snap = args.startSnapshot as ResizeSnapshot;
        const startW = Math.max(1, args.startBounds.width);
        const startH = Math.max(1, args.startBounds.height);

        const dragged = rectBoundsFromHandleDrag(
            args.startBounds,
            args.handle,
            args.anchorWorld,
            args.pointerWorld
        );

        const sx = Math.abs(dragged.width) / startW;
        const sy = Math.abs(dragged.height) / startH;

        let s = 1;
        if (args.handle === "e" || args.handle === "w") s = sx;
        else if (args.handle === "n" || args.handle === "s") s = sy;
        else s = Math.max(sx, sy);

        const MIN_FONT = 4;
        const MAX_FONT = 512;

        const nextFont = clamp(
            Math.round(snap.fontSize * s),
            MIN_FONT,
            MAX_FONT
        );
        if (!Number.isFinite(nextFont) || nextFont <= 0) return;

        this.fontSize = nextFont;

        this.textAlign = snap.textAlign;
        this.fontStyle = snap.fontStyle;
        this.text = snap.text;

        const m = this._measure(this.fontSize);

        const a = args.anchorWorld;
        let bgX = 0;
        let bgY = 0;

        switch (args.handle) {
            case "nw":
                bgX = a.x - m.bgW;
                bgY = a.y - m.bgH;
                break;
            case "n":
                bgX = a.x - m.bgW / 2;
                bgY = a.y - m.bgH;
                break;
            case "ne":
                bgX = a.x;
                bgY = a.y - m.bgH;
                break;
            case "e":
                bgX = a.x;
                bgY = a.y - m.bgH / 2;
                break;
            case "se":
                bgX = a.x;
                bgY = a.y;
                break;
            case "s":
                bgX = a.x - m.bgW / 2;
                bgY = a.y;
                break;
            case "sw":
                bgX = a.x - m.bgW;
                bgY = a.y;
                break;
            case "w":
                bgX = a.x - m.bgW;
                bgY = a.y - m.bgH / 2;
                break;
            default:
                bgX = a.x;
                bgY = a.y;
                break;
        }

        this._setFromBgRect(bgX, bgY, m);
    }

    draw(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { bgX, bgY, lines, lineHeight, pad, bgW, bgH } =
            this._bgRectFromState();

        ctx.save();
        ctx.globalAlpha = this.deletionScheduled
            ? this.opacity / 5
            : this.opacity;

        ctx.font = this._fontString(this.fontSize);
        ctx.textBaseline = "top";
        ctx.textAlign = this.getTextAlignCanvas();

        const hasBg =
            this.backgroundColor &&
            this.backgroundColor !== "transparent" &&
            this.backgroundColor !== "none" &&
            this.backgroundColor !== "rgba(0,0,0,0)";

        if (hasBg) {
            const r = Math.max(2, Math.round(this.fontSize * 0.25));

            ctx.beginPath();
            ctx.roundRect(bgX, bgY, bgW, bgH, r);

            ctx.fillStyle = this.backgroundColor;
            ctx.fill();

            ctx.strokeStyle = "rgba(0,0,0,0)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.fillStyle = this.color;
        for (let i = 0; i < lines.length; i++) {
            const y = this.y + i * lineHeight;
            ctx.fillText(lines[i], this.x, y);
        }

        ctx.restore();
    }

    hitTest(x: number, y: number, _canvas: HTMLCanvasElement): boolean {
        const { bgX, bgY, bgW, bgH } = this._bgRectFromState();
        return x >= bgX && x <= bgX + bgW && y >= bgY && y <= bgY + bgH;
    }

    updateShape(_x: number, _y: number): void {
        // Text shape is created/edited differently; no-op here.
    }

    getBounds(): Bounds {
        const { bgX, bgY, bgW, bgH } = this._bgRectFromState();
        return { kind: "rect", x: bgX, y: bgY, width: bgW, height: bgH };
    }

    translate(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;

        this._syncBoundsFromMeasure();
    }
}
