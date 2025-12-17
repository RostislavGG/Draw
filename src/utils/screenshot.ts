let stream: MediaStream | null = null;
let imageCapture: ImageCapture | null = null;
let currentSourceId: string | null = null;

async function ensureCapture(sourceId: string) {
    if (imageCapture && currentSourceId === sourceId) return;

    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    imageCapture = null;
    currentSourceId = null;

    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: sourceId,
            },
        } as any,
    });

    const track = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
    currentSourceId = sourceId;
}

export async function captureImage(sourceId: string) {
    await ensureCapture(sourceId);
    if (!imageCapture) throw new Error("Capture not ready");
    return await imageCapture.grabFrame();
}

export function stopCapture() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    imageCapture = null;
    currentSourceId = null;
}
