import React from "react";
import { Transformer } from "../utils/canvas";
import { TextAlign } from "../types";

type Props = {
    initialText: string;
    anchor: { x: number; y: number };
    transform: Transformer;
    color: string;
    bgColor: string;
    fontSize: number;
    textAlign: TextAlign;
    opacity: number;
    instrumentsEl: React.RefObject<HTMLDivElement | null>;
    cancel: () => void;
    commit: (text: string) => void;
};

/**
 * Excalidraw-ish textarea editor:
 * - autosizes to content (width + height)
 * - supports textAlign
 * - ESC cancels
 * - Ctrl/Cmd+Enter commits
 * - Blur commits (unless it was cancelled)
 * - uses scale from transformer
 */
export const TextEditor: React.FC<Props> = ({
    initialText,
    anchor,
    transform,
    color,
    bgColor,
    fontSize,
    textAlign,
    opacity,
    instrumentsEl,
    cancel,
    commit,
}) => {
    const [text, setText] = React.useState(initialText);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const cancelledRef = React.useRef(false);

    const doCommit = React.useCallback(() => {
        if (cancelledRef.current) return;
        commit(text);
    }, [commit, text]);

    const doCancel = React.useCallback(() => {
        cancelledRef.current = true;
        cancel();
    }, [cancel]);

    React.useEffect(() => {
        const onPointerDownCapture = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const textarea = textareaRef.current;
            const instruments = instrumentsEl.current;

            // click inside editor -> keep editing
            if (textarea && textarea.contains(target)) return;

            // click inside instruments -> keep editing (so you can change style)
            if (instruments && instruments.contains(target)) return;

            // click anywhere else -> finish editing
            doCommit();
        };

        window.addEventListener("pointerdown", onPointerDownCapture, true);
        return () => window.removeEventListener("pointerdown", onPointerDownCapture, true);
    }, [doCommit, instrumentsEl]);

    // Keep state in sync if the editor is reused with different initial text
    React.useEffect(() => {
        setText(initialText);
        cancelledRef.current = false;
    }, [initialText]);

    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.select();
        autosize(el);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        autosize(el);
    }, [text, fontSize, textAlign]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();

        if (e.key === "Escape") {
            e.preventDefault();
            doCancel();
            return;
        }

        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            doCommit();
            textareaRef.current?.blur();
            return;
        }
    };

    const style: React.CSSProperties = {
        position: "absolute",
        left: anchor.x,
        top: anchor.y,

        transform: `scale(${transform.scale})`,
        transformOrigin: "top left",

        // sizing is handled by autosize(), these are sane minimums:
        minWidth: 24,
        minHeight: Math.ceil(fontSize * 1.35),

        margin: 0,

        background: bgColor,
        color,
        fontSize,
        lineHeight: 1.35,
        fontFamily:
            // Excalidraw uses "Virgil" for the hand-drawn look; fall back gracefully
            `'Virgil', 'Cascadia Code', ui-rounded, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,

        textAlign: toCssTextAlign(textAlign),
        opacity,

        border: "1px solid rgba(0,0,0,0.25)",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.12)",

        outline: "none",
        resize: "none",
        overflow: "hidden",

        // Make it feel more like a canvas object editor
        caretColor: color,
        letterSpacing: 0,

        // Helps keep consistent look across browsers
        WebkitAppearance: "none",
    };

    return (
        <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={style}
            spellCheck={false}
            aria-label="Text editor"
        />
    );
};

// --- helpers ---

function toCssTextAlign(align: TextAlign): React.CSSProperties["textAlign"] {

    if (align === TextAlign.Center) return "center";
    if (align === TextAlign.Right) return "right";
    return "left";
}


function autosize(el: HTMLTextAreaElement) {
    el.style.height = "0px";
    const nextHeight = el.scrollHeight;
    el.style.height = `${nextHeight}px`;

    const value = el.value ?? "";
    const lines = value.length ? value.split("\n") : [""];
    const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "");

    const measurer = document.createElement("span");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "pre";
    measurer.style.fontFamily = getComputedStyle(el).fontFamily;
    measurer.style.fontSize = getComputedStyle(el).fontSize;
    measurer.style.letterSpacing = getComputedStyle(el).letterSpacing;
    measurer.textContent = longest || " ";

    document.body.appendChild(measurer);
    const measured = measurer.getBoundingClientRect().width;
    document.body.removeChild(measurer);

    const paddingX =
        px(getComputedStyle(el).paddingLeft) + px(getComputedStyle(el).paddingRight);
    const borderX =
        px(getComputedStyle(el).borderLeftWidth) +
        px(getComputedStyle(el).borderRightWidth);

    const min = 24;
    const max = 900;
    const nextWidth = clamp(Math.ceil(measured + paddingX + borderX), min, max);
    el.style.width = `${nextWidth}px`;
}

function px(v: string) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
