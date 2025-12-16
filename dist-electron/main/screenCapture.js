"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureNearestDisplayAsDataUrl = void 0;
const electron_1 = require("electron");
const captureNearestDisplayAsDataUrl = async () => {
    const cursor = electron_1.screen.getCursorScreenPoint();
    const display = electron_1.screen.getDisplayNearestPoint(cursor);
    const width = Math.round(display.size.width * display.scaleFactor);
    const height = Math.round(display.size.height * display.scaleFactor);
    const sources = await electron_1.desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width, height },
    });
    const src = sources.find((s) => String(s.display_id) === String(display.id)) ?? sources[0];
    return {
        dataUrl: src.thumbnail.toDataURL(),
        width,
        height,
        displayId: display.id,
        scaleFactor: display.scaleFactor,
    };
};
exports.captureNearestDisplayAsDataUrl = captureNearestDisplayAsDataUrl;
