import { desktopCapturer, screen } from "electron";

export const captureNearestDisplayAsDataUrl = async () => {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor);

    const width = Math.round(display.size.width * display.scaleFactor);
    const height = Math.round(display.size.height * display.scaleFactor);

    const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width, height },
    });

    const src =
        sources.find(
            (s: any) => String((s as any).display_id) === String(display.id)
        ) ?? sources[0];

    return {
        dataUrl: src.thumbnail.toDataURL(),
        width,
        height,
        displayId: display.id,
        scaleFactor: display.scaleFactor,
    };
};
