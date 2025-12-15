import React from "react";

import { drawShape } from "./utils/drawing";
import { Modes, Shape } from "./types";
import { shapeBuilder } from "./utils/shapes";

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isMouseDown = React.useRef(false);
  const currentShape = React.useRef<Shape>(null);
  const shapesList = React.useRef<Shape[]>([]);
  const currentMode = React.useRef<Modes>(Modes.Freehand);

  const [isFocused, setIsFocused] = React.useState(true);

  React.useEffect(() => {
    window.api.onStartDrawing(() => setIsFocused(true));
  }, []);

  window.onkeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      window.api.stopDrawing();
      clearBoard();
      shapesList.current = [];
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

      redraw();
    }
  };

  const handleMouseDown = () => {
    isMouseDown.current = true;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;

    if (currentShape.current === null) {
      return;
    }

    shapesList.current = [...shapesList.current, currentShape.current];
    currentShape.current = null;
    redraw();
  };

  const redraw = () => {
    if (!canvasRef.current) {
      return;
    }

    clearBoard();

    shapesList.current.forEach((shape) => drawShape(canvasRef.current!, shape));

    if (currentShape.current) {
      drawShape(canvasRef.current, currentShape.current);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown.current || !canvasRef.current || !isFocused) {
      return;
    }

    currentShape.current = shapeBuilder(
      currentShape.current,
      currentMode.current,
      event.clientX,
      event.clientY,
    );

    redraw();
  };

  const clearBoard = () => {
    if (!canvasRef.current) {
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    const bb = canvasRef.current.getBoundingClientRect();
    ctx?.clearRect(0, 0, bb.width, bb.height);
  };

  return (
    <canvas
      style={{ background: "transparent" }}
      ref={canvasRef}
      height={window.innerHeight}
      width={window.innerWidth}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
}

export default App;
