import React from "react";

import { BackgroundImage } from "../electron/types";

import { createShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";
import { clampToBackground, screenToWorld, Transformer, ViewInsets } from "./utils/canvas";

import { ModeIdentifier } from "./components/ModeIdentifier";

import { Modes } from "./types";
import { Shape } from "./shapes/base";
import { dataUrlToBlob } from "./utils/image";

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isFocused, setIsFocused] = React.useState(true);
    const [mode, setMode] = React.useState<Modes | null>(null);

    const isMouseDown = React.useRef(false);
    const rafId = React.useRef<number | null>(null)

    const tempShape = React.useRef<Shape>(null);
    const shapesList = React.useRef<Shape[]>([]);
    const hoveredShape = React.useRef<Shape | null>(null);

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
            requestRedraw()
        });
    }, []);

    window.onkeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            window.api.stopDrawing();
            shapesList.current = [];

            if (!canvasRef.current) {
                return;
            }

            backgroundBitmap.current = null;
            backgroundSize.current = null;
            viewportTransform.current = { scale: 1, x: 0, y: 0 }
            setMode(null)

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
        if (!canvasRef.current) {
            return;
        }

        // if (mode === Modes.Freehand) {
        //     shapesList.current = [...shapesList.current, createShape(mode, event.clientX, event.clientY)]
        //     requestRedraw();
        // }
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
            {mode !== null && <ModeIdentifier mode={mode} />}
        </React.Fragment>
    );
}

export default App;
