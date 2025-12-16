export {};

declare global {
    interface Window {
        api: {
            stopDrawing(): void;
            onStartDrawing: (cb: (_, payload) => void) => void;
        };
    }
}
