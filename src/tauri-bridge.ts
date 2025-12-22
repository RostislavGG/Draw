import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export type Insets = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

export type StartDrawingPayload = {
    insets: Insets;
    cursor: { x: number; y: number };
};

export async function onStartDrawing(
    cb: (payload: StartDrawingPayload) => void
) {
    const wv = getCurrentWebviewWindow();
    const unlisten = await wv.listen<StartDrawingPayload>(
        "start-drawing",
        (event) => {
            cb(event.payload);
        }
    );
    return unlisten;
}

export async function stopDrawingUiState() {
    const win = getCurrentWindow();
    await win.setIgnoreCursorEvents(true);
    await win.setFocusable(false);
    await win.hide();
}
