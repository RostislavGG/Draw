import * as React from "react";
import { createPortal } from "react-dom";

import type { Transformer } from "../../utils/canvas";
import {
    cssTextAlign,
    getFontStyle,
    isTransparentLike,
    measureTextWidthPx,
} from "../../utils/typography";
import { clamp } from "../../utils/math";

import { TextData } from "../../types";

import "./index.css";

type Props = {
    instrumentsEl: React.RefObject<HTMLDivElement | null>;
    data: TextData;
    transform: Transformer;

    commit: (text: string) => void;
    cancel: () => void;
};

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

export function TextEditor(props: Props) {
    const { instrumentsEl, data, transform, commit, cancel } = props;

    const { color, bgColor, fontSize, textAlign, fontStyle, opacity } = data;

    const [value, setValue] = React.useState(data.text);
    const taRef = React.useRef<HTMLTextAreaElement | null>(null);

    const doneRef = React.useRef(false);
    const [isFocused, setIsFocused] = React.useState(false);

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

    const extraLeadingPx = Math.max(0, Math.round(lineHeightPx - fontPx));
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
        }
    };

    const wrapperVars: CssVars = {
        ["--te-x"]: `${screenX}px`,
        ["--te-y"]: `${screenY}px`,
    };

    const boxVars: CssVars = {
        ["--te-bg-w"]: `${bgW}px`,
        ["--te-bg-h"]: `${bgH}px`,
        ["--te-pad"]: `${padPx}px`,
        ["--te-radius"]: `${borderRadiusPx}px`,
        ["--te-bg"]: showBg ? bgColor : "transparent",
        ["--te-box-shadow"]: showBg
            ? "inset 0 0 0 1px rgba(0,0,0,0.15)"
            : "none",
        ["--te-opacity"]: clamp(opacity, 0, 1),
    };

    const caretVars: CssVars = {
        ["--te-caret-x"]: `${caretX}px`,
        ["--te-caret-y"]: `${caretY}px`,
        ["--te-caret-w"]: `${caretW}px`,
        ["--te-caret-h"]: `${caretH}px`,
        ["--te-caret-color"]: color,
    };

    const textareaVars: CssVars = {
        ["--te-inner-w"]: `${innerW}px`,
        ["--te-inner-h"]: `${innerH}px`,
        ["--te-font"]: font,
        ["--te-line-height"]: `${lineHeightPx}px`,
        ["--te-align"]: `${alignCss}`,
        ["--te-color"]: color,
        ["--te-baseline-nudge"]: baselineNudgeY ? `${baselineNudgeY}px` : "0px",
        ["--te-caret-color"]: value.length === 0 ? "transparent" : color,
    };

    const fontStyleObj = getFontStyle(fontStyle) as React.CSSProperties;
    const fontStyleVars: CssVars = {
        ["--te-font-style"]: (fontStyleObj.fontStyle ?? "normal") as string,
        ["--te-font-weight"]: (fontStyleObj.fontWeight ?? "normal") as
            | string
            | number,
        ["--te-text-decoration"]: (fontStyleObj.textDecoration ??
            "none") as string,
        ["--te-font-stretch"]: (fontStyleObj.fontStretch ?? "normal") as string,
    };

    const editor = (
        <div
            className='te-root'
            style={wrapperVars}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
        >
            <div className='te-box' style={boxVars}>
                {isFocused && value.length === 0 && (
                    <div className='te-caret' style={caretVars} />
                )}

                <textarea
                    ref={taRef}
                    aria-label='Text editor'
                    className='te-textarea'
                    style={{ ...textareaVars, ...fontStyleVars }}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    spellCheck={false}
                />
            </div>
        </div>
    );

    return createPortal(editor, document.body);
}
