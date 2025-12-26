import React from "react";

import {
    onStartDrawing,
    startDrawingUiState,
    stopDrawingUiState,
} from "./tauri-bridge";

import { DEFAULT_INSTRUMENTS_STATE } from "./constants/state";
import { ERASER_TRAIL_MAX, ERASER_TRAIL_MS } from "./constants/trail";

import { createShape, createTextShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";
import { screenToWorld, Transformer } from "./utils/canvas";
import { eraseAlongSegment } from "./utils/erasing";
import { startNativeWebRtc } from "./utils/webrtc";
import {
    cursorForRectHandle,
    getHandlesForBounds,
    hitTestHandles,
    hitTestSelectionBorder,
} from "./utils/selection";
import { getResizeAnchorWorld } from "./utils/resize";

import { Instruments } from "./components/instruments";
import { TextEditor } from "./components/text-editing";

import { Shape } from "./shapes/base";

import { Modes, SelectGesture, ShapeOptions, TrailPoint } from "./types";

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const instrumentsWrapRef = React.useRef<HTMLDivElement>(null);

    const [isFocused, setIsFocused] = React.useState(false);
    const [mode, setMode] = React.useState<Modes>(Modes.Select);
    const [textEditingData, setTextEditingData] = React.useState<{
        x: number;
        y: number;
        text: string;
        key: number;
    } | null>(null);
    const textEditExitTime = React.useRef(Date.now());

    const isMouseDown = React.useRef(false);
    const rafId = React.useRef<number | null>(null);
    const selectGesture = React.useRef<SelectGesture>({ kind: "none" });

    const tempShape = React.useRef<Shape>(null);
    const shapesList = React.useRef<Shape[]>([]);
    const eraserTrail = React.useRef<TrailPoint[]>([]);

    const hoveredShape = React.useRef<Shape | null>(null);
    const [selectedShape, setSelectedShape] = React.useState<Shape | null>(
        null
    );
    const selectedShapeRef = React.useRef<Shape>(null);

    const dprRef = React.useRef<number>(window.devicePixelRatio || 1);
    const viewportTransform = React.useRef<Transformer>({
        scale: 1,
        x: 0,
        y: 0,
    });

    const [showInstruments, setShowInstruments] = React.useState(true);
    const [shapeOptions, setShapeOptions] = React.useState(
        DEFAULT_INSTRUMENTS_STATE
    );

    const [viewport, setViewport] = React.useState({
        w: window.innerWidth,
        h: window.innerHeight,
    });

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const stopWebRtcRef = React.useRef<null | (() => Promise<void>)>(null);

    const applyBgTransform = () => {
        const v = videoRef.current;
        if (!v) return;
        const t = viewportTransform.current;
        v.style.transformOrigin = "0 0";
        v.style.transform = `matrix(${t.scale}, 0, 0, ${t.scale}, ${t.x}, ${t.y})`;
    };

    React.useEffect(() => {
        const onResize = () =>
            setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;

        canvas.width = Math.round(viewport.w * dpr);
        canvas.height = Math.round(viewport.h * dpr);

        canvas.style.width = `${viewport.w}px`;
        canvas.style.height = `${viewport.h}px`;

        requestRedraw();
    }, [viewport.w, viewport.h]);

    React.useEffect(() => {
        let unlisten: null | (() => void) = null;

        (async () => {
            unlisten = await onStartDrawing(async () => {
                await startDrawingUiState();
                setIsFocused(true);
                setShowInstruments(true);

                viewportTransform.current = { scale: 1, x: 0, y: 0 };

                if (videoRef.current && !stopWebRtcRef.current) {
                    stopWebRtcRef.current = await startNativeWebRtc(
                        videoRef.current
                    );
                }

                applyBgTransform();
                requestRedraw();
            });
        })();

        return () => {
            unlisten?.();
        };
    }, []);

    React.useEffect(() => {
        const onKeyDown = async (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (textEditingData) {
                    resetTextEditingLocation();
                    return;
                }

                setIsFocused(false);
                shapesList.current = [];
                hoveredShape.current = null;
                eraserTrail.current = [];
                changeSelectedShape(null);

                if (!canvasRef.current) {
                    return;
                }

                viewportTransform.current = { scale: 1, x: 0, y: 0 };

                changeMode(Modes.Select);

                if (stopWebRtcRef.current) {
                    await stopWebRtcRef.current();
                    stopWebRtcRef.current = null;
                }
                requestRedraw();
                await stopDrawingUiState();
                return;
            }

            if (event.key === "Tab") {
                setShowInstruments((prevValue) => !prevValue);
                return;
            }

            const derivedMode = deriveMode(event.key);
            if (derivedMode !== null) {
                changeMode(derivedMode);
                return;
            }

            if (event.key === "z" && event.ctrlKey) {
                if (!canvasRef.current || shapesList.current.length === 0) {
                    return;
                }

                shapesList.current = shapesList.current.slice(
                    0,
                    shapesList.current.length - 1
                );

                requestRedraw();
            }

            if (event.key === "Backspace") {
                if (
                    !canvasRef.current ||
                    shapesList.current.length === 0 ||
                    !selectedShape
                ) {
                    return;
                }

                shapesList.current = shapesList.current.filter(
                    (shapes) => shapes.id !== selectedShape.id
                );
                changeSelectedShape(null);
                requestRedraw();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [textEditingData, mode, selectedShape, showInstruments]);

    React.useEffect(() => {
        if (!textEditingData) {
            return;
        }

        requestAnimationFrame(() => {
            const el = document.querySelector(
                "textarea[aria-label='Text editor']"
            ) as HTMLTextAreaElement | null;
            el?.focus();
        });
    }, [shapeOptions, textEditingData]);

    const changeSelectedShape = (newShape: Shape | null) => {
        setSelectedShape(newShape);
        selectedShapeRef.current = newShape;
        requestRedraw();
    };

    const pruneTrail = (now: number) => {
        const cutoff = now - ERASER_TRAIL_MS;
        while (
            eraserTrail.current.length &&
            eraserTrail.current[0].t < cutoff
        ) {
            eraserTrail.current.shift();
        }

        if (eraserTrail.current.length > ERASER_TRAIL_MAX) {
            eraserTrail.current = eraserTrail.current.slice(-ERASER_TRAIL_MAX);
        }
    };

    const changeMode = (newMode: Modes, selection: Shape | null = null) => {
        if (newMode === mode) {
            return;
        }
        changeSelectedShape(selection);
        setMode(newMode);
    };

    const requestRedraw = () => {
        if (rafId.current != null) {
            return;
        }

        rafId.current = requestAnimationFrame(() => {
            rafId.current = null;
            if (!canvasRef.current) {
                return;
            }

            const now = Date.now();
            pruneTrail(now);
            redraw(
                canvasRef.current,
                viewportTransform.current,
                shapesList.current,
                tempShape.current,
                selectedShapeRef.current,
                eraserTrail.current,
                dprRef.current
            );

            if (eraserTrail.current.length > 0) {
                requestRedraw();
            }
        });
    };

    const handlePointerDown = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        isMouseDown.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);

        if (mode === Modes.Eraser) {
            const now = Date.now();
            eraserTrail.current = [
                { x: event.clientX, y: event.clientY, t: now },
            ];
            return;
        }

        const { x, y } = screenToWorld(
            viewportTransform.current,
            event.clientX,
            event.clientY
        );

        if (mode === Modes.Select) {
            const selected = selectedShapeRef.current;
            if (selected) {
                const bounds = selected.getBounds();
                const handles = getHandlesForBounds(
                    bounds,
                    viewportTransform.current
                );
                const hit = hitTestHandles(
                    handles,
                    event.clientX,
                    event.clientY
                );

                if (hit) {
                    const anchorWorld = getResizeAnchorWorld(bounds, hit.id);
                    selectGesture.current = {
                        kind: "resize",
                        shapeId: selected.id,
                        handle: hit.id,
                        startBounds: bounds,
                        anchorWorld,
                        startSnapshot: selected.getResizeSnapshot(),
                    };
                    return;
                }

                const borderHandle = hitTestSelectionBorder(
                    bounds,
                    viewportTransform.current,
                    event.clientX,
                    event.clientY
                );

                if (borderHandle) {
                    const anchorWorld = getResizeAnchorWorld(
                        bounds,
                        borderHandle
                    );
                    selectGesture.current = {
                        kind: "resize",
                        shapeId: selected.id,
                        handle: borderHandle,
                        startBounds: bounds,
                        anchorWorld,
                        startSnapshot: selected.getResizeSnapshot(),
                    };
                    return;
                }
            }

            if (hoveredShape.current) {
                changeSelectedShape(hoveredShape.current);
                selectGesture.current = {
                    kind: "drag-shape",
                    shapeId: hoveredShape.current.id,
                    lastWorldX: x,
                    lastWorldY: y,
                };
                return;
            } else {
                changeSelectedShape(null);
            }

            selectGesture.current = {
                kind: "pan",
                startX: event.clientX,
                startY: event.clientY,
                camX: viewportTransform.current.x,
                camY: viewportTransform.current.y,
            };
        }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
        isMouseDown.current = false;

        if (!canvasRef.current) {
            return;
        }

        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {}

        eraserTrail.current = [];

        if (mode === Modes.Select) {
            selectGesture.current = { kind: "none" };
            return;
        }

        if (mode === Modes.Eraser) {
            shapesList.current = shapesList.current.filter(
                (s) => !s.deletionScheduled
            );
            requestRedraw();
            return;
        }

        if (mode === Modes.Screenshot || mode === Modes.Video) {
            tempShape.current = null;
            requestRedraw();
            return;
        }

        const { x, y } = screenToWorld(
            viewportTransform.current,
            event.clientX,
            event.clientY
        );
        if (mode === Modes.Typography) {
            if (
                textEditingData ||
                Date.now() - textEditExitTime.current < 200
            ) {
                return;
            }
            setTextEditingData({ x, y, text: "", key: Math.random() });
            return;
        }

        if (tempShape.current === null) {
            return;
        }

        shapesList.current = [...shapesList.current, tempShape.current];
        tempShape.current = null;

        requestRedraw();
    };

    const handlePointerMove = (
        event: React.PointerEvent<HTMLCanvasElement>
    ) => {
        if (!canvasRef.current || !isFocused) {
            return;
        }

        const { x, y } = screenToWorld(
            viewportTransform.current,
            event.clientX,
            event.clientY
        );

        if (mode === Modes.Eraser && isMouseDown.current) {
            const now = Date.now();
            eraserTrail.current.push({
                x: event.clientX,
                y: event.clientY,
                t: now,
            });
            pruneTrail(now);

            if (eraserTrail.current.length > 1) {
                const p1 = eraserTrail.current[eraserTrail.current.length - 1];
                const p0 = eraserTrail.current[eraserTrail.current.length - 2];

                const a = screenToWorld(viewportTransform.current, p0.x, p0.y);
                const b = screenToWorld(viewportTransform.current, p1.x, p1.y);

                eraseAlongSegment(
                    a,
                    b,
                    canvasRef.current,
                    viewportTransform.current,
                    shapesList.current
                );
            }

            requestRedraw();
            return;
        }

        canvasRef.current.style.cursor = "default";

        const gesture = selectGesture.current;

        if (mode === Modes.Select) {
            if (!isMouseDown.current) {
                const sel = selectedShapeRef.current;
                if (sel) {
                    const b = sel.getBounds();

                    const handles = getHandlesForBounds(
                        b,
                        viewportTransform.current
                    );
                    const hitCorner = hitTestHandles(
                        handles,
                        event.clientX,
                        event.clientY
                    );
                    if (hitCorner) {
                        canvasRef.current.style.cursor = hitCorner.cursor;
                        return;
                    }

                    const borderHandle = hitTestSelectionBorder(
                        b,
                        viewportTransform.current,
                        event.clientX,
                        event.clientY
                    );
                    if (borderHandle) {
                        canvasRef.current.style.cursor =
                            cursorForRectHandle(borderHandle);
                        return;
                    }
                }
            }

            if (gesture.kind === "resize" && isMouseDown.current) {
                const { x: wx, y: wy } = screenToWorld(
                    viewportTransform.current,
                    event.clientX,
                    event.clientY
                );

                const sel = selectedShapeRef.current;
                if (sel && sel.id === gesture.shapeId) {
                    sel.resizeFromHandle({
                        handle: gesture.handle,
                        pointerWorld: { x: wx, y: wy },
                        anchorWorld: gesture.anchorWorld,
                        startBounds: gesture.startBounds,
                        startSnapshot: gesture.startSnapshot,
                    });
                    requestRedraw();
                }
                return;
            }

            if (gesture.kind === "drag-shape" && isMouseDown.current) {
                const { x, y } = screenToWorld(
                    viewportTransform.current,
                    event.clientX,
                    event.clientY
                );
                const dx = x - gesture.lastWorldX;
                const dy = y - gesture.lastWorldY;

                const sel = selectedShapeRef.current;
                if (sel && sel.id === gesture.shapeId) {
                    sel.translate(dx, dy);
                    selectGesture.current = {
                        ...gesture,
                        lastWorldX: x,
                        lastWorldY: y,
                    };
                    requestRedraw();
                }
                return;
            }

            if (gesture.kind === "pan") {
                viewportTransform.current.x =
                    gesture.camX + (event.clientX - gesture.startX);
                viewportTransform.current.y =
                    gesture.camY + (event.clientY - gesture.startY);

                applyBgTransform();
                requestRedraw();
                return;
            }

            for (let i = shapesList.current.length - 1; i >= 0; i--) {
                if (shapesList.current[i].hitTest(x, y, canvasRef.current)) {
                    canvasRef.current.style.cursor = "pointer";
                    hoveredShape.current = shapesList.current[i];
                    return;
                }
            }
            hoveredShape.current = null;
            return;
        }

        if (!isMouseDown.current) {
            return;
        }

        if (tempShape.current) {
            tempShape.current.updateShape(x, y);
        } else {
            const attemptCreateShape = createShape(mode, x, y, shapeOptions);

            if (attemptCreateShape) {
                tempShape.current = attemptCreateShape;
            }
        }

        requestRedraw();
    };

    const handleMouseWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
        if (mode !== Modes.Select) {
            return;
        }

        event.preventDefault();

        const MIN_SCALE = 1;
        const MAX_SCALE = 6;

        const zoom = Math.exp(-event.deltaY * 0.001);
        const oldScale = viewportTransform.current.scale;
        const unclamped = oldScale * zoom;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, unclamped));

        if (newScale === oldScale) return;

        const wx = (event.clientX - viewportTransform.current.x) / oldScale;
        const wy = (event.clientY - viewportTransform.current.y) / oldScale;

        viewportTransform.current.x = event.clientX - wx * newScale;
        viewportTransform.current.y = event.clientY - wy * newScale;
        viewportTransform.current.scale = newScale;

        applyBgTransform();
        requestRedraw();
    };

    const resetTextEditingLocation = () => setTextEditingData(null);
    const commitText = (text: string) => {
        textEditExitTime.current = Date.now();
        if (text.trim().length === 0 || !textEditingData) {
            resetTextEditingLocation();
            return;
        }

        const textShape = createTextShape(
            textEditingData.x,
            textEditingData.y,
            text,
            shapeOptions
        );
        shapesList.current = [...shapesList.current, textShape];
        requestRedraw();
        resetTextEditingLocation();
    };

    const handleNewOpts = (newOpts: Partial<ShapeOptions>) =>
        setShapeOptions((prevOptions) => ({ ...prevOptions, ...newOpts }));

    return (
        <React.Fragment>
            <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
                {/* <video
                    ref={videoRef}
                    muted
                    playsInline
                    autoPlay
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                /> */}
                <canvas
                    ref={canvasRef}
                    width={viewport.w}
                    height={viewport.h}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "transparent",
                        zIndex: 1,
                        touchAction: "none",
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerMove={handlePointerMove}
                    onWheel={handleMouseWheel}
                />
            </div>
            <div ref={instrumentsWrapRef}>
                <Instruments
                    isOpen={showInstruments && isFocused}
                    currentMode={mode}
                    changeMode={changeMode}
                    shape={selectedShape}
                    shapeOptions={shapeOptions}
                    changeShapeOpts={handleNewOpts}
                    requestRedraw={requestRedraw}
                />
            </div>
            {isFocused && textEditingData && (
                <TextEditor
                    key={textEditingData.key}
                    instrumentsEl={instrumentsWrapRef}
                    data={textEditingData}
                    transform={viewportTransform.current}
                    commit={commitText}
                    cancel={resetTextEditingLocation}
                    color={shapeOptions.strokeColor}
                    bgColor={shapeOptions.fillColor}
                    fontSize={shapeOptions.fontSize}
                    textAlign={shapeOptions.textAlign}
                    opacity={shapeOptions.opacity}
                    fontStyle={shapeOptions.fontStyle}
                />
            )}
        </React.Fragment>
    );
}

export default App;
