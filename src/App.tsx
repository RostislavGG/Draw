import React from "react";

import { createShape } from "./utils/shapes";
import { deriveMode } from "./utils/mode";
import { redraw } from "./utils/drawing";

import { ModeIdentifier } from "./components/ModeIdentifier";

import { Modes } from "./types";
import { Shape } from "./shapes/base";

function App() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [isFocused, setIsFocused] = React.useState(true);
    const [mode, setMode] = React.useState<Modes>(Modes.Freehand);

    const isMouseDown = React.useRef(false);

    const tempShape = React.useRef<Shape>(null);
    const shapesList = React.useRef<Shape[]>([]);
    const hoveredShape = React.useRef<Shape | null>(null);

    React.useEffect(() => {
        window.api.onStartDrawing(() => setIsFocused(true));
    }, []);

    window.onkeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            window.api.stopDrawing();
            shapesList.current = [];

            if (!canvasRef.current) {
                return;
            }

            redraw(canvasRef.current, shapesList.current, tempShape.current);
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

            redraw(canvasRef.current, shapesList.current, tempShape.current);
        }
    };

    const handleMouseDown = () => {
        isMouseDown.current = true;
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;

        if (tempShape.current === null) {
            return;
        }

        shapesList.current = [...shapesList.current, tempShape.current];
        tempShape.current = null;

        if (!canvasRef.current) {
            return;
        }
        redraw(canvasRef.current, shapesList.current, tempShape.current);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !isFocused) {
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
            // hoveredShape.current = shapesList.current.reverse().find(s => s.hitTest(event.clientX, event.clientY, canvasRef.current!)) ?? null;
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

        redraw(canvasRef.current, shapesList.current, tempShape.current);
    };

    const onMouseClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) {
            return;
        }


        console.log(123, hoveredShape.current)
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
            <ModeIdentifier mode={mode} />
        </React.Fragment>
    );
}

export default App;
