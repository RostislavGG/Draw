import React from "react";

import { BackgroundImage } from "../electron/types";

import { createShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";
import { Transformer } from "./utils/canvas";

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

    const viewportTransform = React.useRef<Transformer>({ scale: 1, x: 0, y: 0 })
    const panStart = React.useRef<{ x: number, y: number, camX: number, camY: number } | null>(null)

    React.useEffect(() => {
        window.api.onStartDrawing(async (payload: BackgroundImage) => {
            setIsFocused(true)

            const blob = dataUrlToBlob(payload.dataUrl)
            const bitmap = await createImageBitmap(blob);

            backgroundBitmap.current = bitmap;
            backgroundSize.current = { width: payload.width, height: payload.height };

            if (!canvasRef.current) {
                return;
            }

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

    const requestRedraw = () => {
        if (rafId.current != null) return;
        rafId.current = requestAnimationFrame(() => {
            rafId.current = null;
            if (!canvasRef.current) return;
            redraw(canvasRef.current, shapesList.current, tempShape.current, backgroundBitmap.current, backgroundSize.current);
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

        if (mode === Modes.Select) {


            for (let i = shapesList.current.length - 1; i >= 0; i--) {
                if (shapesList.current[i].hitTest(event.clientX, event.clientY, canvasRef.current)) {
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
            tempShape.current.updateShape(event.clientX, event.clientY)
        } else {
            tempShape.current = createShape(mode, event.clientX, event.clientY);
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
            ></canvas>
            {mode !== null && <ModeIdentifier mode={mode} />}
        </React.Fragment>
    );
}

export default App;
