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

import { Modes, ShapeOptions } from "./types";

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

    const hoveredShape = React.useRef<Shape | null>(null);
    const [selectedShape, setSelectedShape] = React.useState<Shape | null>(null);

    const backgroundBitmap = React.useRef<ImageBitmap | null>(null);
    const backgroundSize = React.useRef<{ width: number, height: number } | null>(null);
    const viewInsets = React.useRef<ViewInsets>({ left: 0, top: 0, right: 0, bottom: 0 });

    const viewportTransform = React.useRef<Transformer>({ scale: 1, x: 0, y: 0 });
    const panStart = React.useRef<{ x: number, y: number, camX: number, camY: number } | null>(null);

    const [showInstruments, setShowInstruments] = React.useState(true);
    const [shapeOptions, setShapeOptions] = React.useState(DEFAULT_INSTRUMENTS_STATE)

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
        window.onkeydown = (event: KeyboardEvent) => {
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
            }

            const derivedMode = deriveMode(event.key);
            if (derivedMode !== null) {
                changeMode(derivedMode);
                return;
            }

            if (event.key === "z" && event.ctrlKey) {
                if (shapesList.current.length === 0) {
                    return;
                }

                if (!canvasRef.current) {
                    return;
                }

                shapesList.current = shapesList.current.slice(
                    0,
                    shapesList.current.length - 1,
                );

                requestRedraw();
            }
        };
    }, [textEditingLocation, mode])

    const clampViewport = () => {
        if (!canvasRef.current || !backgroundSize.current) return;
        clampToBackground(viewportTransform.current, canvasRef.current, backgroundSize.current, viewInsets.current);
    };

    const changeMode = (newMode: Modes, selection: Shape | null = null) => {
        setSelectedShape(selection);
        setMode(newMode)
    }

    const requestRedraw = () => {
        if (rafId.current != null) return;
        rafId.current = requestAnimationFrame(() => {
            rafId.current = null;
            if (!canvasRef.current) return;
            redraw(canvasRef.current, viewportTransform.current, shapesList.current, tempShape.current, backgroundBitmap.current, backgroundSize.current);
        });
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        isMouseDown.current = true;
        panStart.current = {
            x: event.clientX, y: event.clientY, camX: viewportTransform.current.x, camY: viewportTransform.current.y
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        isMouseDown.current = false;

        if (!canvasRef.current) {
            return;
        }

        if (mode === Modes.Select) {
            setSelectedShape(hoveredShape.current);
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

        canvasRef.current.style.cursor = "default"

        const { x, y } = screenToWorld(viewportTransform.current, event.clientX, event.clientY);

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

    const onMouseClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) {
            return;
        }


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

        const textShape = createTextShape(textEditingLocation.x, textEditingLocation.y, 16, "rgba(255, 0, 234, 1)", text)
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
                onClick={onMouseClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleMouseWheel}
            ></canvas>
            {isFocused && showInstruments && <Instruments currentMode={mode} changeMode={changeMode} shape={selectedShape} shapeOptions={shapeOptions} changeShapeOpts={handleNewOpts} requestRedraw={requestRedraw} />}
            {isFocused && textEditingLocation && <TextEditor key={textEditingLocation.key} anchor={textEditingLocation} initialText="" transform={viewportTransform.current} commit={commitText} cancel={resetTextEditingLocation} />}
        </React.Fragment>
    );
}

export default App;
