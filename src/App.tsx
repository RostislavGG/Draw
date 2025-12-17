import React from "react";

import { BackgroundImage } from "../electron/types";

import { createShape, createTextShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";
import { clampToBackground, screenToWorld, Transformer, ViewInsets } from "./utils/canvas";

import { ModeIdentifier } from "./components/ModeIdentifier";

import { Modes } from "./types";
import { Shape } from "./shapes/base";
import { dataUrlToBlob } from "./utils/image";
import { Instruments } from "./components/instruments";
import { TextEditor } from "./components/textEditing";

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isFocused, setIsFocused] = React.useState(false);
    const [mode, setMode] = React.useState<Modes>(Modes.Select);
    const [textEditingLocation, setTextEditingLocation] = React.useState<{ x: number, y: number, key: number } | null>(null);

    const isMouseDown = React.useRef(false);
    const rafId = React.useRef<number | null>(null)

    const tempShape = React.useRef<Shape>(null);
    const shapesList = React.useRef<Shape[]>([]);

    const hoveredShape = React.useRef<Shape | null>(null);
    const [selectedShape, setSelectedShape] = React.useState<Shape | null>(null);

    const backgroundBitmap = React.useRef<ImageBitmap | null>(null);
    const backgroundSize = React.useRef<{ width: number, height: number } | null>(null);
    const viewInsets = React.useRef<ViewInsets>({ left: 0, top: 0, right: 0, bottom: 0 });

    const viewportTransform = React.useRef<Transformer>({ scale: 1, x: 0, y: 0 })
    const panStart = React.useRef<{ x: number, y: number, camX: number, camY: number } | null>(null)

    React.useEffect(() => {
        window.api.onStartDrawing(async (payload: BackgroundImage) => {
            setIsFocused(true)

            viewInsets.current = payload.insets ?? { left: 0, top: 0, right: 0, bottom: 0 };

            const blob = dataUrlToBlob(payload.dataUrl)

            const bitmap = await createImageBitmap(blob);

            backgroundBitmap.current = bitmap;
            backgroundSize.current = { width: payload.width, height: payload.height };

            if (!canvasRef.current) {
                return;
            }

            clampViewport();
            requestRedraw();
        });
    }, []);

    React.useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => {
            if (textEditingLocation) {
                return;
            }

            if (event.key === "Escape") {
                window.api.stopDrawing();
                setIsFocused(false)
                shapesList.current = [];

                if (!canvasRef.current) {
                    return;
                }

                backgroundBitmap.current = null;
                backgroundSize.current = null;
                viewportTransform.current = { scale: 1, x: 0, y: 0 }
                setMode(Modes.Select)

                requestRedraw()
                return;
            }

            const derivedMode = deriveMode(event.key);
            if (derivedMode !== null) {
                setMode(derivedMode);
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

    const requestRedraw = () => {
        if (rafId.current != null) return;
        rafId.current = requestAnimationFrame(() => {
            rafId.current = null;
            if (!canvasRef.current) return;
            redraw(canvasRef.current, viewportTransform.current, shapesList.current, tempShape.current, backgroundBitmap.current, backgroundSize.current);
        });
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode === Modes.Typography) {
            if (textEditingLocation) {
                return;
            }
            setTextEditingLocation({ x: event.clientX, y: event.clientY, key: Math.random() });
            return;
        }

        isMouseDown.current = true;
        panStart.current = {
            x: event.clientX, y: event.clientY, camX: viewportTransform.current.x, camY: viewportTransform.current.y
        }
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;

        if (panStart.current) {
            panStart.current = null;
        }

        if (tempShape.current === null) {
            return;
        }

        shapesList.current = [...shapesList.current, tempShape.current];
        tempShape.current = null;

        if (!canvasRef.current) {
            return;
        }
        requestRedraw()
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !isFocused || mode === null) {
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
            tempShape.current = createShape(mode, x, y);
        }

        requestRedraw()
    };

    const onMouseClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || mode === Modes.Typography) {
            return;
        }

        if (mode === Modes.Select) {
            setSelectedShape(hoveredShape.current);
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
        if (text.trim().length === 0 || !textEditingLocation) {
            resetTextEditingLocation();
            return;
        }

        const textShape = createTextShape(textEditingLocation.x, textEditingLocation.y, 16, "rgba(255, 0, 234, 1)", text)
        shapesList.current = [...shapesList.current, textShape]
        requestRedraw();
        resetTextEditingLocation();
    }

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
            {isFocused && mode !== null && <ModeIdentifier mode={mode} />}
            {isFocused && <Instruments shape={selectedShape} />}
            {isFocused && textEditingLocation && <TextEditor anchor={textEditingLocation} initialText="" transform={viewportTransform.current} commit={commitText} cancel={resetTextEditingLocation} />}
        </React.Fragment>
    );
}

export default App;
