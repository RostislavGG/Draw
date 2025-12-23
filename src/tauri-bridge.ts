import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function startDrawingUiState() {
    const win = getCurrentWindow();
    await win.show();
    await win.setIgnoreCursorEvents(false);
    await win.setFocusable(true);
    await win.setFocus();
}

export async function onStartDrawing(cb: () => void) {
    const wv = getCurrentWebviewWindow();
    const unlisten = await wv.listen("start-drawing", () => {
        cb();
    });
    return unlisten;
}

export async function stopDrawingUiState() {
    const win = getCurrentWindow();
    await win.setIgnoreCursorEvents(true);
    await win.setFocusable(false);
    await win.hide();
}
