import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import * as path from "node:path";

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;
let isDrawing = false;

const FULL_SCREEN_OPTIONS = {
  width: 800,
  height: 600,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  hasShadow: false,
  resizable: false,
  fullscreen: true, // if you want full-screen overlay
  backgroundColor: "#00000000",
};

const NORMAL_OPTIONS = {
  width: 1200,
  height: 1000,
  fullscreen: true,
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      ...NORMAL_OPTIONS,
      preload: path.join(__dirname, "..", "preload", "index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173/");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  }

  mainWindow.on("close", () => (mainWindow = null));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // globalShortcut.register("CommandOrControl+Alt+D", () => {
  //   if (!mainWindow) {
  //     return;
  //   }
  //
  //   if (isDrawing) {
  //     return;
  //   }
  //
  //   console.log("Start Drawing");
  //   mainWindow.focus();
  //
  //   isDrawing = true;
  //   mainWindow.setIgnoreMouseEvents(false);
  //   mainWindow.webContents.send("start-drawing");
  // });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ipcMain.on("stop-drawing", () => {
//   if (!mainWindow) return;
//   console.log("Stop Drawing");
//
//   isDrawing = false;
//
//   mainWindow.setIgnoreMouseEvents(true, { forward: true });
// });
