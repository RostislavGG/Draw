import {
    app,
    BrowserWindow,
    desktopCapturer,
    globalShortcut,
    ipcMain,
    screen,
} from "electron";
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
    fullscreen: true,
    backgroundColor: "#00000000",
};

const NORMAL_OPTIONS = {
    width: 1200,
    height: 1000,
    fullscreen: true,
};

const createWindow = () => {
    mainWindow = new BrowserWindow({
        ...FULL_SCREEN_OPTIONS,
        webPreferences: {
            preload: path.join(__dirname, "..", "preload", "index.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.maximize();

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173/");
        //mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(
            path.join(__dirname, "..", "..", "dist", "index.html")
        );
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

    globalShortcut.register("CommandOrControl+Alt+D", async () => {
        if (!mainWindow) {
            return;
        }

        if (isDrawing) {
            return;
        }

        const display = screen.getDisplayNearestPoint(
            screen.getCursorScreenPoint()
        );
        const { bounds, workArea } = display;

        const insets = {
            left: workArea.x - bounds.x,
            top: workArea.y - bounds.y,
            right: bounds.x + bounds.width - (workArea.x + workArea.width),
            bottom: bounds.y + bounds.height - (workArea.y + workArea.height),
        };

        isDrawing = true;

        const sources = await desktopCapturer.getSources({
            types: ["screen"],
            thumbnailSize: { width: 0, height: 0 },
        });

        const source =
            sources.find((s) => s.display_id === String(display.id)) ??
            sources[0];

        mainWindow.setFocusable(true);
        mainWindow.setIgnoreMouseEvents(false);
        mainWindow.show();
        mainWindow.focus();

        mainWindow.webContents.send("start-drawing", {
            insets,
            sourceId: source.id,
        });
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.on("stop-drawing", () => {
    if (!mainWindow) return;

    isDrawing = false;
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setFocusable(false);
    mainWindow.blur();
});
