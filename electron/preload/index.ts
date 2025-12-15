import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  onStartDrawing: (cb: () => void) => {
    ipcRenderer.on("start-drawing", () => cb());
  },
  stopDrawing: () => {
    ipcRenderer.send("stop-drawing");
  },
});
