import React from "react";

import { Insets } from "../electron/types";

import { DEFAULT_INSTRUMENTS_STATE } from "./constants/state";

import { createShape, createTextShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";
import { clampToBackground, screenToWorld, Transformer, ViewInsets } from "./utils/canvas";
import { captureImage, stopCapture } from "./utils/screenshot";

import { Instruments } from "./components/instruments";
import { TextEditor } from "./components/text-editing";

import { Shape } from "./shapes/base";

import { Modes, ShapeOptions, TrailPoint } from "./types";
import { ERASER_TRAIL_MAX, ERASER_TRAIL_MS } from "./constants/trail";

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isFocused, setIsFocused] = React.useState(false);
    const [mode, setMode] = React.useState<Modes>(Modes.Select);
    const [textEditingLocation, setTextEditingLocation] = React.useState<{ x: number, y: number, key: number } | null>(null);
    const textEditExitTime = React.useRef(Date.now())

    const isMouseDown = React.useRef(false);
    const rafId = React.useRef<number | null>(null)

    const tempShape = React.useRef<Shape>(null);
    const shapesList = React.useRef<Shape[]>([]);
    const eraserTrail = React.useRef<TrailPoint[]>([])

    const hoveredShape = React.useRef<Shape | null>(null);
    const [selectedShape, setSelectedShape] = React.useState<Shape | null>(null);

    const backgroundBitmap = React.useRef<ImageBitmap | null>(null);
    const backgroundSize = React.useRef<{ width: number, height: number } | null>(null);
    const viewInsets = React.useRef<ViewInsets>({ left: 0, top: 0, right: 0, bottom: 0 });

    const viewportTransform = React.useRef<Transformer>({ scale: 1, x: 0, y: 0 });
    const panStart = React.useRef<{ x: number, y: number, camX: number, camY: number } | null>(null);

    const [showInstruments, setShowInstruments] = React.useState(true);
    const [shapeOptions, setShapeOptions] = React.useState(DEFAULT_INSTRUMENTS_STATE);

    React.useEffect(() => {
        return window.api.onStartDrawing(async (payload: { insets: Insets, sourceId: string }) => {
            canvasRef.current!.style.cursor = "none"
            viewInsets.current = payload.insets ?? { left: 0, top: 0, right: 0, bottom: 0 };

            clampViewport();
            requestRedraw();

            const bitmap = await captureImage(payload.sourceId);
            canvasRef.current!.style.cursor = "auto"

            backgroundBitmap.current = bitmap;
            backgroundSize.current = { width: bitmap.width, height: bitmap.height };
            setIsFocused(true)
            setShowInstruments(true)
        })
    }, []);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (textEditingLocation) {
                    resetTextEditingLocation()
                    return;
                }

                stopCapture();
                window.api.stopDrawing();
                setIsFocused(false)
                shapesList.current = [];
                hoveredShape.current = null;
                eraserTrail.current = [];
                setSelectedShape(null);

                if (!canvasRef.current) {
                    return;
                }

                backgroundBitmap.current = null;
                backgroundSize.current = null;
                viewportTransform.current = { scale: 1, x: 0, y: 0 }

                changeMode(Modes.Select)

                requestRedraw()
                return;
            }

            if (event.key === " ") {
                setShowInstruments((prevValue) => !prevValue)
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
                    shapesList.current.length - 1,
                );

                requestRedraw();
            }

            if (event.key === "Backspace") {
                if (!canvasRef.current || shapesList.current.length === 0 || !selectedShape) {
                    return;
                }

                shapesList.current = shapesList.current.filter(shapes => shapes.id !== selectedShape.id);
                setSelectedShape(null);
                requestRedraw();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [textEditingLocation, mode, selectedShape, showInstruments])

    const clampViewport = () => {
        if (!canvasRef.current || !backgroundSize.current) return;
        clampToBackground(viewportTransform.current, canvasRef.current, backgroundSize.current, viewInsets.current);
    };

    const pruneTrail = (now: number) => {
        const cutoff = now - ERASER_TRAIL_MS;
        while (eraserTrail.current.length && eraserTrail.current[0].t < cutoff) {
            eraserTrail.current.shift();
        }

        if (eraserTrail.current.length > ERASER_TRAIL_MAX) {
            eraserTrail.current = eraserTrail.current.slice(-ERASER_TRAIL_MAX);
        }
    };

    const eraseAlongSegment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
        if (!canvasRef.current) return;

        const stepWorld = 4 / viewportTransform.current.scale;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);

        const steps = Math.max(1, Math.ceil(dist / stepWorld));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const sx = a.x + dx * t;
            const sy = a.y + dy * t;

            for (let j = shapesList.current.length - 1; j >= 0; j--) {
                const shape = shapesList.current[j];
                if (shape.deletionScheduled) continue;

                if (shape.hitTest(sx, sy, canvasRef.current)) {
                    shape.deletionScheduled = true;
                }
            }
        }
    };

    const changeMode = (newMode: Modes, selection: Shape | null = null) => {
        setSelectedShape(selection);
        setMode(newMode)
    }

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
            redraw(canvasRef.current, viewportTransform.current, shapesList.current, tempShape.current, backgroundBitmap.current, backgroundSize.current, eraserTrail.current, now);

            if (eraserTrail.current.length > 0) {
                requestRedraw();
            }
        });
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        isMouseDown.current = true;

        if (mode === Modes.Eraser) {
            const now = Date.now();
            eraserTrail.current = [{ x: event.clientX, y: event.clientY, t: now }]
        }

        panStart.current = {
            x: event.clientX, y: event.clientY, camX: viewportTransform.current.x, camY: viewportTransform.current.y
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        isMouseDown.current = false;

        if (!canvasRef.current) {
            return;
        }

        eraserTrail.current = [];

        if (mode === Modes.Select) {
            setSelectedShape(hoveredShape.current);
            return;
        }

        if (mode === Modes.Eraser) {
            shapesList.current = shapesList.current.filter(s => !s.deletionScheduled)
            requestRedraw()
            return;
        }

        const { x, y } = screenToWorld(viewportTransform.current, event.clientX, event.clientY);
        if (mode === Modes.Typography) {
            if (textEditingLocation || Date.now() - textEditExitTime.current < 200) {
                return;
            }
            setTextEditingLocation({ x, y, key: Math.random() });
            return;
        }

        if (panStart.current) {
            panStart.current = null;
        }

        if (tempShape.current === null) {
            return;
        }

        if (mode !== Modes.Freehand) {
            changeMode(Modes.Select, tempShape.current)
        }

        shapesList.current = [...shapesList.current, tempShape.current];
        tempShape.current = null;

        requestRedraw()
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !isFocused) {
            return;
        }

        const { x, y } = screenToWorld(viewportTransform.current, event.clientX, event.clientY);

        if (mode === Modes.Eraser && isMouseDown.current) {
            const now = Date.now();
            eraserTrail.current.push({ x: event.clientX, y: event.clientY, t: now });
            pruneTrail(now)

            if (eraserTrail.current.length > 1) {
                const p1 = eraserTrail.current[eraserTrail.current.length - 1];
                const p0 = eraserTrail.current[eraserTrail.current.length - 2];

                const a = screenToWorld(viewportTransform.current, p0.x, p0.y);
                const b = screenToWorld(viewportTransform.current, p1.x, p1.y);

                eraseAlongSegment(a, b);
            }

            requestRedraw();
            return;
        }

        canvasRef.current.style.cursor = "default"

        if (mode === Modes.Select) {
            if (isMouseDown.current && panStart.current) {
                viewportTransform.current.x = panStart.current.camX + (event.clientX - panStart.current.x)
                viewportTransform.current.y = panStart.current.camY + (event.clientY - panStart.current.y)

                clampViewport();
                requestRedraw();
            }

            for (let i = shapesList.current.length - 1; i >= 0; i--) {
                if (shapesList.current[i].hitTest(x, y, canvasRef.current)) {
                    canvasRef.current.style.cursor = "pointer"
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
            tempShape.current.updateShape(x, y)
        } else {
            tempShape.current = createShape(mode, x, y, shapeOptions);
        }

        requestRedraw()
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

        clampViewport();
        requestRedraw();
    }

    const resetTextEditingLocation = () => setTextEditingLocation(null);
    const commitText = (text: string) => {
        textEditExitTime.current = Date.now();
        if (text.trim().length === 0 || !textEditingLocation) {
            resetTextEditingLocation();
            return;
        }

        const textShape = createTextShape(textEditingLocation.x, textEditingLocation.y, text, shapeOptions)
        shapesList.current = [...shapesList.current, textShape]
        requestRedraw();
        resetTextEditingLocation();
    }

    const handleNewOpts = (newOpts: Partial<ShapeOptions>) => setShapeOptions(prevOptions => ({ ...prevOptions, ...newOpts }))

    return (
        <React.Fragment>
            <canvas
                style={{ background: "transparent" }}
                ref={canvasRef}
                height={window.innerHeight}
                width={window.innerWidth}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleMouseWheel}
            ></canvas>
            {isFocused && showInstruments && <Instruments currentMode={mode} changeMode={changeMode} shape={selectedShape} shapeOptions={shapeOptions} changeShapeOpts={handleNewOpts} requestRedraw={requestRedraw} />}
            {isFocused && textEditingLocation && <TextEditor key={textEditingLocation.key} anchor={textEditingLocation} initialText="" transform={viewportTransform.current} commit={commitText} cancel={resetTextEditingLocation} color={shapeOptions.strokeColor} bgColor={shapeOptions.fillColor} fontSize={shapeOptions.fontSize} textAlign={shapeOptions.textAlign} opacity={shapeOptions.opacity} />}
        </React.Fragment>
    );
}

export default App;
