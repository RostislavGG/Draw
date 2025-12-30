import { clamp } from "./math";

export type RGB = { r: number; g: number; b: number };
export type HSV = { h: number; s: number; v: number };

export const isValidHexString = (str: string): boolean =>
    Boolean(str.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/));

export const hexToRgb = (hex: string): RGB | null => {
    const v = hex.trim().replace("#", "");
    if (![3, 6].includes(v.length)) return null;
    const full =
        v.length === 3
            ? v
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : v;
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

export const rgbToHex = ({ r, g, b }: RGB) =>
    `#${[r, g, b]
        .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
        .join("")}`;

export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
    const rr = r / 255,
        gg = g / 255,
        bb = b / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
        switch (max) {
            case rr:
                h = ((gg - bb) / d) % 6;
                break;
            case gg:
                h = (bb - rr) / d + 2;
                break;
            case bb:
                h = (rr - gg) / d + 4;
                break;
        }
        h *= 60;
        if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    const v = max;

    return { h, s, v };
};

export const hsvToRgb = ({ h, s, v }: HSV): RGB => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let rr = 0,
        gg = 0,
        bb = 0;
    if (h >= 0 && h < 60) [rr, gg, bb] = [c, x, 0];
    else if (h < 120) [rr, gg, bb] = [x, c, 0];
    else if (h < 180) [rr, gg, bb] = [0, c, x];
    else if (h < 240) [rr, gg, bb] = [0, x, c];
    else if (h < 300) [rr, gg, bb] = [x, 0, c];
    else [rr, gg, bb] = [c, 0, x];

    return {
        r: (rr + m) * 255,
        g: (gg + m) * 255,
        b: (bb + m) * 255,
    };
};
