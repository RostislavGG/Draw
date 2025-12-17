import { contextBridge, ipcRenderer } from "electron";
import { Insets } from "../types";

type StartDrawingPayload = { insets: Insets; sourceId: string };

contextBridge.exposeInMainWorld("api", {
    onStartDrawing: (cb: (payload: StartDrawingPayload) => void) => {
        const handler = (_: unknown, payload: StartDrawingPayload) =>
            cb(payload);
        ipcRenderer.on("start-drawing", handler);
        return () => ipcRenderer.removeListener("start-drawing", handler);
    },
    stopDrawing: () => {
        ipcRenderer.send("stop-drawing");
    },
});
