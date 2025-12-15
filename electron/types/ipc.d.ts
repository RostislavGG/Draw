export {};

declare global {
  interface Window {
    api: {
      stopDrawing(): void;
      onStartDrawing: (cb: () => void) => void;
    };
  }
}
