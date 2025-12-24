import * as React from "react";
import { createPortal } from "react-dom";

import type { Transformer } from "../utils/canvas";
import {
    cssTextAlign,
    getFontStyle,
    isTransparentLike,
    measureTextWidthPx,
} from "../utils/typography";

import { FontStyle, TextAlign } from "../types";

type Anchor = { x: number; y: number; key: number };

type Props = {
    instrumentsEl: React.RefObject<HTMLDivElement | null>;
    anchor: Anchor;
    initialText: string;
    transform: Transformer;

    commit: (text: string) => void;
    cancel: () => void;

    color: string;
    bgColor: string;
    fontSize: number;
    textAlign: TextAlign;
    fontStyle: FontStyle;
    opacity: number;
};

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

export function TextEditor(props: Props) {
    const {
        instrumentsEl,
        anchor,
        initialText,
        transform,
        commit,
        cancel,
        color,
        bgColor,
        fontSize,
        textAlign,
        fontStyle,
        opacity,
    } = props;

    const [value, setValue] = React.useState(initialText);
    const taRef = React.useRef<HTMLTextAreaElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const [size, setSize] = React.useState<{ w: number; h: number }>({
        w: 24,
        h: 24,
    });

    const doneRef = React.useRef(false);

    const doCommit = React.useCallback(
        (text: string) => {
            if (doneRef.current) return;
            doneRef.current = true;
            commit(text);
        },
        [commit]
    );

    React.useEffect(() => {
        const onPointerDownCapture = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const textarea = taRef.current;
            const instruments = instrumentsEl.current;

            if (textarea && textarea.contains(target)) return;

            if (instruments && instruments.contains(target)) return;

            doCommit(value);
        };

        window.addEventListener("pointerdown", onPointerDownCapture, true);
        return () =>
            window.removeEventListener(
                "pointerdown",
                onPointerDownCapture,
                true
            );
    }, [doCommit, instrumentsEl, value]);

    const alignCss = cssTextAlign(textAlign);

    const alignShiftX =
        alignCss === "center"
            ? -size.w / 2
            : alignCss === "right"
            ? -size.w
            : 0;

    const scale = transform.scale ?? 1;
    const baseScreenX = transform.x + anchor.x * scale;
    const baseScreenY = transform.y + anchor.y * scale;

    const screenX = baseScreenX + alignShiftX;
    const screenY = baseScreenY;

    const fontPx = Math.max(1, Math.round(fontSize * scale));
    const lineHeightPx = Math.round(fontPx * 1.25);
    const padPx = Math.max(2, Math.round(4 * scale));
    const borderRadiusPx = Math.max(2, Math.round(4 * scale));

    const font = `${fontStyle === FontStyle.Italic ? "italic " : ""}${
        fontStyle === FontStyle.Bold ? "bold " : ""
    }${fontPx}px sans-serif`;

    React.useLayoutEffect(() => {
        const el = taRef.current;
        if (!el) return;

        el.style.font = font;
        el.style.lineHeight = `${lineHeightPx}px`;
        el.style.padding = `${padPx}px`;
        el.style.textAlign = String(cssTextAlign(textAlign));

        const naturalTextW = measureTextWidthPx(value, font);
        const naturalW = Math.ceil(naturalTextW + padPx * 2);

        const margin = 12;
        const maxW = Math.max(80, window.innerWidth - margin * 2);
        const minW = Math.max(24, Math.ceil(10 * scale));

        const w = clamp(naturalW, minW, maxW);

        el.style.width = `${w}px`;
        el.style.height = "0px";
        const h = Math.max(
            Math.ceil(lineHeightPx + padPx * 2),
            Math.ceil(el.scrollHeight)
        );

        el.style.height = `${h}px`;
        setSize((prev) => (prev.w !== w || prev.h !== h ? { w, h } : prev));
    }, [value, font, lineHeightPx, padPx, scale, textAlign]);

    const doCancel = React.useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        cancel();
    }, [cancel]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();

        if (e.key === "Escape") {
            e.preventDefault();
            doCancel();
            return;
        }
    };

    const showBg = !isTransparentLike(bgColor);

    const editor = (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                transform: `translate(${screenX}px, ${screenY}px)`,
                zIndex: 10_000,
                pointerEvents: "auto",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
        >
            <textarea
                ref={taRef}
                aria-label='Text editor'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                style={{
                    display: "block",
                    width: `${size.w}px`,
                    height: `${size.h}px`,
                    resize: "none",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    borderRadius: `${borderRadiusPx}px`,
                    padding: `${padPx}px`,
                    font,
                    lineHeight: `${lineHeightPx}px`,
                    color,
                    background: showBg ? bgColor : "transparent",
                    opacity: clamp(opacity, 0, 1),
                    textAlign: cssTextAlign(textAlign),
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                    ...getFontStyle(fontStyle),
                }}
            />
        </div>
    );

    return createPortal(editor, document.body);
}
