import React from "react";

import {
    hexToRgb,
    HSV,
    hsvToRgb,
    isValidHexString,
    rgbToHex,
    rgbToHsv,
} from "../../../utils/colors";
import { clamp } from "../../../utils/math";

import "./styles.css";

type ColorPickerProps = {
    currentColor: string;
    closePicker: () => void;
    onColorChange: (newColor: string) => void;
};

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const svRef = React.useRef<HTMLCanvasElement>(null);
    const hueRef = React.useRef<HTMLCanvasElement>(null);
    const lastEmittedHexRef = React.useRef<string | null>(null);

    const [hsv, setHsv] = React.useState<HSV>(() => {
        const rgb = hexToRgb(props.currentColor) ?? { r: 255, g: 0, b: 0 };
        return rgbToHsv(rgb);
    });
    const [hexString, setHexString] = React.useState(
        isValidHexString(props.currentColor) ? props.currentColor : "#ffffff"
    );

    React.useEffect(() => {
        setHexString(
            isValidHexString(props.currentColor)
                ? props.currentColor
                : "#ffffff"
        );

        if (props.currentColor === lastEmittedHexRef.current) return;

        const rgb = hexToRgb(props.currentColor);
        if (!rgb) return;
        setHsv(rgbToHsv(rgb));
    }, [props.currentColor]);

    React.useEffect(() => {
        const mouseDownHandler = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                props.closePicker();
            }
        };
        window.addEventListener("mousedown", mouseDownHandler);
        return () => {
            window.removeEventListener("mousedown", mouseDownHandler);
        };
    }, []);

    React.useLayoutEffect(() => {
        const instrumentsElement = document.querySelector("#instruments");
        if (!instrumentsElement || !containerRef.current) return;

        const rect = instrumentsElement.getBoundingClientRect();
        containerRef.current.style.position = "absolute";
        containerRef.current.style.left = `${rect.left + rect.width}px`;
        containerRef.current.style.top = `${rect.top}px`;
    }, []);

    const emitColor = React.useCallback(
        (next: HSV) => {
            const rgb = hsvToRgb(next);
            const hex = rgbToHex(rgb);
            lastEmittedHexRef.current = hex;
            props.onColorChange(hex);
        },
        [props.onColorChange]
    );

    const draw = React.useCallback((next: HSV) => {
        const dpr = window.devicePixelRatio || 1;

        const sv = svRef.current;
        if (sv) {
            const cssW = 180,
                cssH = 180;
            sv.style.width = `${cssW}px`;
            sv.style.height = `${cssH}px`;
            sv.width = Math.round(cssW * dpr);
            sv.height = Math.round(cssH * dpr);

            const ctx = sv.getContext("2d");
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, cssW, cssH);

                const hueRgb = hsvToRgb({ h: next.h, s: 1, v: 1 });
                ctx.fillStyle = `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})`;
                ctx.fillRect(0, 0, cssW, cssH);

                const whiteGrad = ctx.createLinearGradient(0, 0, cssW, 0);
                whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
                whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = whiteGrad;
                ctx.fillRect(0, 0, cssW, cssH);

                const blackGrad = ctx.createLinearGradient(0, 0, 0, cssH);
                blackGrad.addColorStop(0, "rgba(0,0,0,0)");
                blackGrad.addColorStop(1, "rgba(0,0,0,1)");
                ctx.fillStyle = blackGrad;
                ctx.fillRect(0, 0, cssW, cssH);

                const x = next.s * cssW;
                const y = (1 - next.v) * cssH;

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(255,255,255,0.95)";
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y, 7.5, 0, Math.PI * 2);
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(0,0,0,0.6)";
                ctx.stroke();
            }
        }

        const hue = hueRef.current;
        if (hue) {
            const cssW = 180,
                cssH = 18;
            hue.style.width = `${cssW}px`;
            hue.style.height = `${cssH}px`;
            hue.width = Math.round(cssW * dpr);
            hue.height = Math.round(cssH * dpr);

            const ctx = hue.getContext("2d");
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, cssW, cssH);

                const g = ctx.createLinearGradient(0, 0, cssW, 0);
                g.addColorStop(0 / 6, "#ff0000");
                g.addColorStop(1 / 6, "#ffff00");
                g.addColorStop(2 / 6, "#00ff00");
                g.addColorStop(3 / 6, "#00ffff");
                g.addColorStop(4 / 6, "#0000ff");
                g.addColorStop(5 / 6, "#ff00ff");
                g.addColorStop(6 / 6, "#ff0000");

                ctx.fillStyle = g;
                ctx.fillRect(0, 0, cssW, cssH);

                const x = (next.h / 360) * cssW;
                ctx.beginPath();
                ctx.rect(x - 1, 0, 2, cssH);
                ctx.fillStyle = "rgba(255,255,255,0.95)";
                ctx.fill();

                ctx.beginPath();
                ctx.rect(x - 2, 0, 4, cssH);
                ctx.strokeStyle = "rgba(0,0,0,0.6)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }, []);

    React.useEffect(() => {
        draw(hsv);
    }, [hsv, draw]);

    const setSVFromPointer = React.useCallback(
        (clientX: number, clientY: number) => {
            const c = svRef.current;
            if (!c) return;

            const rect = c.getBoundingClientRect();
            const x = clamp(clientX - rect.left, 0, rect.width);
            const y = clamp(clientY - rect.top, 0, rect.height);

            const s = rect.width === 0 ? 0 : x / rect.width;
            const v = rect.height === 0 ? 0 : 1 - y / rect.height;

            setHsv((prev) => {
                const next = { ...prev, s, v };
                emitColor(next);
                return next;
            });
        },
        [emitColor]
    );

    const setHueFromPointer = React.useCallback(
        (clientX: number) => {
            const c = hueRef.current;
            if (!c) return;

            const rect = c.getBoundingClientRect();
            const x = clamp(clientX - rect.left, 0, rect.width);
            const h = (rect.width === 0 ? 0 : (x / rect.width) * 360) % 360;

            setHsv((prev) => {
                const next = { ...prev, h };
                emitColor(next);
                return next;
            });
        },
        [emitColor]
    );

    const onSVPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setSVFromPointer(e.clientX, e.clientY);
    };

    const onSVPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        if (e.buttons === 0) return;
        setSVFromPointer(e.clientX, e.clientY);
    };

    const onHuePointerDown: React.PointerEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setHueFromPointer(e.clientX);
    };

    const onHuePointerMove: React.PointerEventHandler<HTMLCanvasElement> = (
        e
    ) => {
        if (e.buttons === 0) return;
        setHueFromPointer(e.clientX);
    };

    const onHexStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.currentTarget.value;

        setHexString(newVal);

        if (isValidHexString(newVal)) {
            const rgb = hexToRgb(newVal);
            if (!rgb) {
                return;
            }
            const hsv = rgbToHsv(rgb);
            setHsv(hsv);
            emitColor(hsv);
        }
    };

    const stopKeyBubbling: React.KeyboardEventHandler<HTMLInputElement> = (
        e
    ) => {
        if (e.key === " ") {
            return;
        }
        e.stopPropagation();
    };

    const stopPasteBubbling: React.ClipboardEventHandler<HTMLInputElement> = (
        e
    ) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                background: "white",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: 10,
                zIndex: 20000,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                userSelect: "none",
            }}
        >
            <canvas
                ref={svRef}
                onPointerDown={onSVPointerDown}
                onPointerMove={onSVPointerMove}
                style={{
                    display: "block",
                    borderRadius: 6,
                    touchAction: "none",
                    cursor: "crosshair",
                }}
            />
            <div style={{ height: 8 }} />
            <canvas
                ref={hueRef}
                onPointerDown={onHuePointerDown}
                onPointerMove={onHuePointerMove}
                style={{
                    display: "block",
                    borderRadius: 6,
                    touchAction: "none",
                    cursor: "pointer",
                }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                }}
            >
                <div
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: hexString,
                    }}
                />
                <input
                    type='text'
                    value={hexString}
                    onChange={onHexStringChange}
                    onKeyDownCapture={stopKeyBubbling}
                    onKeyUpCapture={stopKeyBubbling}
                    onPasteCapture={stopPasteBubbling}
                    maxLength={7}
                    style={{
                        fontSize: 12,
                        opacity: 0.7,
                        maxWidth: 80,
                        borderWidth: 1,
                        borderColor: isValidHexString(hexString)
                            ? "transparent"
                            : "red",
                    }}
                />

                <div style={{ flex: 1 }} />
                <button type='button' onClick={props.closePicker}>
                    Close
                </button>
            </div>
        </div>
    );
};
