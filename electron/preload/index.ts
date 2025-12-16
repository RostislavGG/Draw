import { contextBridge, ipcRenderer } from "electron";

import { BackgroundImage } from "../types";

contextBridge.exposeInMainWorld("api", {
    onStartDrawing: (cb: (payload: BackgroundImage) => void) => {
        ipcRenderer.on("start-drawing", (_, payload) => cb(payload));
    },
    stopDrawing: () => {
        ipcRenderer.send("stop-drawing");
    },
});
