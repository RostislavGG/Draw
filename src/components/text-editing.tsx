import * as React from "react";
import { createPortal } from "react-dom";

import type { Transformer } from "../utils/canvas";
import {
    cssTextAlign,
    getFontStyle,
    isTransparentLike,
    measureTextWidthPx,
} from "../utils/typography";

import { FontStyle, TextData } from "../types";

type Props = {
    instrumentsEl: React.RefObject<HTMLDivElement | null>;
    data: TextData;
    transform: Transformer;

    commit: (text: string) => void;
    cancel: () => void;
};

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

export function TextEditor(props: Props) {
    const { instrumentsEl, data, transform, commit, cancel } = props;

    const { color, bgColor, fontSize, textAlign, fontStyle, opacity } = data;

    const [value, setValue] = React.useState(data.text);
    const taRef = React.useRef<HTMLTextAreaElement | null>(null);

    const doneRef = React.useRef(false);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        const id = "te-caret-style";
        if (document.getElementById(id)) return;

        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
      @keyframes teBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
    `;
        document.head.appendChild(style);
    }, []);

    const doCommit = React.useCallback(
        (text: string) => {
            if (doneRef.current) return;
            doneRef.current = true;
            commit(text);
        },
        [commit]
    );

    const doCancel = React.useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        cancel();
    }, [cancel]);

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

    const scale = transform.scale ?? 1;

    const fontPx = Math.max(1, Math.round(fontSize * scale));
    const lineHeightPx = Math.round(fontPx * 1.25);
    const padPx = Math.max(2, Math.round(fontPx * 0.2));
    const borderRadiusPx = Math.max(2, Math.round(fontPx * 0.25));

    const font = `${fontPx}px sans-serif`;

    const alignCss = cssTextAlign(textAlign);

    const lines = value.split("\n");
    const lineCount = Math.max(1, lines.length);

    const maxLineW = Math.max(
        0,
        ...lines.map((l) =>
            measureTextWidthPx(l.length ? l : " ", font, fontStyle)
        )
    );

    const margin = 12;
    const maxW = Math.max(80, window.innerWidth - margin * 2);
    const minW = Math.max(24, Math.ceil(10 * scale));

    const bgW = clamp(Math.ceil(maxLineW + padPx * 2), minW, maxW);
    const textH = Math.ceil(lineCount * lineHeightPx);
    const bgH = Math.ceil(textH + padPx * 2);

    const innerW = Math.max(1, bgW - padPx * 2);
    const innerH = Math.max(1, bgH - padPx * 2);

    const baseScreenX = transform.x + data.x * scale;
    const baseScreenY = transform.y + data.y * scale;

    const alignShiftX =
        alignCss === "center" ? -bgW / 2 : alignCss === "right" ? -bgW : 0;

    const padCompX =
        alignCss === "left" ? -padPx : alignCss === "right" ? +padPx : 0;

    const screenX = baseScreenX + alignShiftX + padCompX;
    const screenY = baseScreenY - padPx;

    const showBg = !isTransparentLike(bgColor);

    const extraLeadingPx = Math.max(0, lineHeightPx - fontPx);
    const baselineNudgeY = Math.round(extraLeadingPx * 0.2);

    const caretW = Math.max(1, Math.round(1 * scale));
    const caretH = lineHeightPx;

    const caretInContentX =
        alignCss === "center" ? innerW / 2 : alignCss === "right" ? innerW : 0;

    const caretX = padPx + caretInContentX;
    const caretY = padPx - baselineNudgeY;

    React.useLayoutEffect(() => {
        requestAnimationFrame(() => {
            taRef.current?.focus();
            taRef.current?.setSelectionRange(value.length, value.length);
        });
    }, []);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();

        if (e.key === "Escape") {
            e.preventDefault();
            doCancel();
            return;
        }
    };

    const editor = (
        <div
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
            <div
                style={{
                    position: "relative",
                    width: `${bgW}px`,
                    height: `${bgH}px`,
                    padding: `${padPx}px`,
                    boxSizing: "border-box",
                    borderRadius: `${borderRadiusPx}px`,
                    background: showBg ? bgColor : "transparent",

                    boxShadow: showBg
                        ? "inset 0 0 0 1px rgba(0,0,0,0.15)"
                        : "none",

                    opacity: clamp(opacity, 0, 1),
                }}
            >
                {isFocused && value.length === 0 && (
                    <div
                        style={{
                            position: "absolute",
                            left: `${caretX}px`,
                            top: `${caretY}px`,
                            width: `${caretW}px`,
                            height: `${caretH}px`,
                            background: color,
                            animation: "teBlink 1s steps(1, end) infinite",
                            pointerEvents: "none",
                        }}
                    />
                )}

                <textarea
                    ref={taRef}
                    aria-label='Text editor'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    spellCheck={false}
                    style={{
                        display: "block",
                        width: `${innerW}px`,
                        height: `${innerH}px`,
                        resize: "none",
                        overflow: "hidden",
                        outline: "none",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        boxSizing: "content-box",

                        font,
                        lineHeight: `${lineHeightPx}px`,
                        textAlign: alignCss,
                        color,

                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",

                        transform: baselineNudgeY
                            ? `translateY(-${baselineNudgeY}px)`
                            : undefined,

                        caretColor: value.length === 0 ? "transparent" : color,

                        ...getFontStyle(fontStyle),
                    }}
                />
            </div>
        </div>
    );

    return createPortal(editor, document.body);
}
