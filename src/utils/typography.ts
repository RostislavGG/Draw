import { FontStyle, TextAlign } from "../types";

export const cssTextAlign = (
    ta: TextAlign
): React.CSSProperties["textAlign"] => {
    if (ta === TextAlign.Center) return "center";
    if (ta === TextAlign.Right) return "right";
    return "left";
};

export const isTransparentLike = (color: string) => {
    const c = (color || "").trim().toLowerCase();
    return (
        !c ||
        c === "transparent" ||
        c === "none" ||
        c === "rgba(0,0,0,0)" ||
        c === "rgb(0 0 0 / 0)"
    );
};

export const measureTextWidthPx = (
    text: string,
    font: string,
    fontStyle: FontStyle
) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const styledFont = `${fontStyle === FontStyle.Italic ? "italic " : ""}${
        fontStyle === FontStyle.Bold ? "bold " : ""
    }${font}`;

    ctx.font = styledFont;

    const lines = text.split("\n");
    let max = 0;
    for (const line of lines) {
        const w = ctx.measureText(line.length ? line : " ").width;
        if (w > max) max = w;
    }
    return max;
};

export const getFontStyle = (fs: FontStyle) => {
    if (fs === FontStyle.Italic) {
        return {
            fontStyle: "italic",
        };
    }

    if (fs === FontStyle.Bold) {
        return {
            fontWeight: "bold",
        };
    }

    return {};
};
