"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    onStartDrawing: (cb) => {
        electron_1.ipcRenderer.on("start-drawing", (_, payload) => cb(payload));
    },
    stopDrawing: () => {
        electron_1.ipcRenderer.send("stop-drawing");
    },
});
