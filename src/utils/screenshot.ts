import { invoke } from "@tauri-apps/api/core";

export async function captureImageAt(
    x: number,
    y: number
): Promise<ImageBitmap> {
    const bytes = await invoke<number[]>("capture_monitor_png_at", { x, y });
    const u8 = new Uint8Array(bytes);
    const blob = new Blob([u8], { type: "image/png" });
    return await createImageBitmap(blob);
}

let stream: MediaStream | null = null;
let imageCapture: ImageCapture | null = null;

async function ensureCapture() {
    if (imageCapture) return;

    stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
    });

    const track = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
}

export async function captureImage() {
    await ensureCapture();
    if (!imageCapture) throw new Error("Capture not ready");
    return await imageCapture.grabFrame();
}

export function stopCapture() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    imageCapture = null;
}
