type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
}

function parseColorToRgb(input: string): RGB | null {
    const s = input.trim();

    if (s[0] === "#") {
        const hex = s.slice(1);
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return { r, g, b };
        }
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { r, g, b };
        }
        return null;
    }

    const m = s.match(
        /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i
    );
    if (m) {
        const r = Math.max(0, Math.min(255, Number(m[1])));
        const g = Math.max(0, Math.min(255, Number(m[2])));
        const b = Math.max(0, Math.min(255, Number(m[3])));
        return { r, g, b };
    }

    return null;
}

function rgbCss({ r, g, b }: RGB) {
    return `rgb(${r}, ${g}, ${b})`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
    const rn = r / 255,
        gn = g / 255,
        bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        switch (max) {
            case rn:
                h = ((gn - bn) / d) % 6;
                break;
            case gn:
                h = (bn - rn) / d + 2;
                break;
            default:
                h = (rn - gn) / d + 4;
                break;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let rp = 0,
        gp = 0,
        bp = 0;

    if (0 <= h && h < 60) [rp, gp, bp] = [c, x, 0];
    else if (60 <= h && h < 120) [rp, gp, bp] = [x, c, 0];
    else if (120 <= h && h < 180) [rp, gp, bp] = [0, c, x];
    else if (180 <= h && h < 240) [rp, gp, bp] = [0, x, c];
    else if (240 <= h && h < 300) [rp, gp, bp] = [x, 0, c];
    else [rp, gp, bp] = [c, 0, x];

    const r = Math.round((rp + m) * 255);
    const g = Math.round((gp + m) * 255);
    const b = Math.round((bp + m) * 255);

    return { r, g, b };
}

function adjustHsl(rgb: RGB, dl: number, ds: number): RGB {
    const hsl = rgbToHsl(rgb);
    return hslToRgb({
        h: hsl.h,
        s: clamp01(hsl.s + ds),
        l: clamp01(hsl.l + dl),
    });
}

export type LaserOptions = {
    glowScale?: number; // default 1
    blend?: GlobalCompositeOperation; // default "source-over" (less neon)
    // how much to lift lightness for inner/outer glow (smaller = richer, less neon)
    innerLift?: number; // default 0.10
    outerLift?: number; // default 0.16
    // slight saturation tweak so glow stays “rich”
    innerSat?: number; // default +0.02
    outerSat?: number; // default +0.01
};

export function makeLaserFillStyle(baseColor: string, opts: LaserOptions = {}) {
    const glowScale = opts.glowScale ?? 1;
    const blend = opts.blend ?? "source-over";

    const innerLift = opts.innerLift ?? 0.1;
    const outerLift = opts.outerLift ?? 0.16;

    const innerSat = opts.innerSat ?? 0.02;
    const outerSat = opts.outerSat ?? 0.01;

    const base = parseColorToRgb(baseColor) ?? { r: 220, g: 0, b: 0 };

    // Glow colors: same hue, slightly lighter, barely more saturated.
    const inner = adjustHsl(base, innerLift, innerSat);
    const outer = adjustHsl(base, outerLift, outerSat);

    return function drawLaserFill(
        ctx: CanvasRenderingContext2D,
        path: Path2D,
        strokeWidth: number,
        opacity: number
    ) {
        ctx.save();
        ctx.globalAlpha = clamp01(opacity);
        ctx.globalCompositeOperation = blend;

        // Outer glow (richer + less “neon”: smaller blur than before)
        ctx.shadowColor = rgbCss(outer);
        ctx.shadowBlur = strokeWidth * 4.5 * glowScale;
        ctx.fillStyle = rgbCss(outer);
        ctx.fill(path);

        // Inner glow
        ctx.shadowColor = rgbCss(inner);
        ctx.shadowBlur = strokeWidth * 2.5 * glowScale;
        ctx.fillStyle = rgbCss(inner);
        ctx.fill(path);

        // Core (sharp)
        ctx.shadowBlur = 0;
        ctx.fillStyle = rgbCss(base);
        ctx.fill(path);

        ctx.restore();
    };
}
