import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type OfferPayload = { type: "offer"; sdp: string };
type IcePayload = { candidate: string; sdpMLineIndex: number };
type IceToBackendPayload = { candidate: string; sdpMLineIndex: number };

let activeStop: null | (() => Promise<void>) = null;

function normalizeSdp(s: string) {
    const lines = s
        .split(/\r\n|\n|\r/)
        .map((l) => l.replace(/\s+$/g, "")) // trim end only
        .filter((l) => l.length > 0)
        .filter((l) => l !== "a=rtcp-mux-only")
        .filter((l) => l !== "a=rtcp-rsize");

    return lines.join("\r\n") + "\r\n";
}

export async function startNativeWebRtc(videoEl: HTMLVideoElement) {
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.playsInline = true;

    // ✅ If something is already running (HMR / double start), stop it first.
    if (activeStop) {
        await activeStop();
        activeStop = null;
    }

    const pc = new RTCPeerConnection({
        // ✅ Recommended: STUN
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onconnectionstatechange = () =>
        console.log("pc.connectionState =", pc.connectionState);

    pc.oniceconnectionstatechange = () =>
        console.log("pc.iceConnectionState =", pc.iceConnectionState);

    pc.onsignalingstatechange = () =>
        console.log("pc.signalingState =", pc.signalingState);

    pc.onicegatheringstatechange = () =>
        console.log("pc.iceGatheringState =", pc.iceGatheringState);

    // ✅ KEY: force receive-only so WebKit doesn't try to configure a sender
    pc.addTransceiver("video", { direction: "recvonly" });

    // ---- ICE buffering: backend -> frontend ----
    let remoteDescSet = false;
    const pendingRemoteIce: IcePayload[] = [];

    async function addIceSafely(c: IcePayload) {
        // WebKit is often happier with an RTCIceCandidate instance
        const ice = new RTCIceCandidate({
            candidate: c.candidate,
            sdpMLineIndex: c.sdpMLineIndex,
            // Helps on WebKit when there is only one m-line
            sdpMid: "video0",
        });
        await pc.addIceCandidate(ice);
    }

    // ---- ICE buffering: frontend -> backend ----
    let answerSent = false;
    const pendingLocalIce: IceToBackendPayload[] = [];

    pc.ontrack = (ev) => {
        const stream = ev.streams[0] ?? new MediaStream([ev.track]);
        videoEl.srcObject = stream;

        console.log("track settings", ev.track.getSettings?.());
        console.log("video readyState initially", videoEl.readyState);

        videoEl.onloadedmetadata = () => {
            console.log(
                "loadedmetadata",
                videoEl.videoWidth,
                videoEl.videoHeight
            );
        };
        videoEl.onplaying = () => console.log("video playing");
        videoEl.onwaiting = () => console.log("video waiting");
        videoEl.onerror = () => console.log("video error", videoEl.error);

        videoEl.play().catch((e) => console.error("video.play failed", e));
    };

    pc.onicecandidate = (ev) => {
        if (!ev.candidate) return;

        const c = ev.candidate.toJSON();
        const payload: IceToBackendPayload = {
            candidate: c.candidate ?? "",
            sdpMLineIndex: c.sdpMLineIndex ?? 0,
        };

        // ✅ If we haven’t finished applying/sending answer yet, buffer.
        if (!answerSent) {
            pendingLocalIce.push(payload);
            return;
        }

        invoke("webrtc_add_ice", { candidate: payload }).catch(console.error);
    };

    const unOffer = await listen<OfferPayload>("webrtc-offer", async (e) => {
        console.log("✅ got offer");
        console.log(e.payload.sdp);

        try {
            const sdp = normalizeSdp(e.payload.sdp);

            // Helpful once: see hidden chars
            console.log("SDP JSON:", JSON.stringify(sdp));

            await pc.setRemoteDescription({ type: "offer", sdp });
            remoteDescSet = true;

            // ✅ Drain ICE that may have arrived before remote description was set
            while (pendingRemoteIce.length) {
                const cand = pendingRemoteIce.shift()!;
                try {
                    await addIceSafely(cand);
                } catch (err) {
                    console.error("addIceCandidate (drain) failed", err);
                }
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await invoke("webrtc_answer", { sdpText: answer.sdp });
            answerSent = true;
            console.log("✅ sent answer");

            // ✅ Now flush any local ICE we buffered before answer went out
            while (pendingLocalIce.length) {
                const cand = pendingLocalIce.shift()!;
                invoke("webrtc_add_ice", { candidate: cand }).catch(
                    console.error
                );
            }
        } catch (err) {
            console.error("⛔ offer handling failed:", err);
        }
    });

    const unIce = await listen<IcePayload>("webrtc-ice", async (e) => {
        const cand = (e.payload.candidate ?? "").trim();
        if (!cand) return; // ✅ ignore end-of-candidates / bad payloads

        if (!remoteDescSet) {
            pendingRemoteIce.push({ ...e.payload, candidate: cand });
            return;
        }

        try {
            await pc.addIceCandidate(
                new RTCIceCandidate({
                    candidate: cand,
                    sdpMLineIndex: e.payload.sdpMLineIndex,
                    // ✅ don’t force sdpMid; WebKit can be picky. mLineIndex is enough.
                    // sdpMid: "video0",
                })
            );
        } catch (err) {
            console.error("addIceCandidate failed", err, e.payload);
        }
    });

    const unErr = await listen<string>("webrtc-error", (e) =>
        console.error("GStreamer:", e.payload)
    );
    const unWarn = await listen<string>("webrtc-warn", (e) =>
        console.warn("GStreamer:", e.payload)
    );

    await invoke("webrtc_start_stream");

    const stop = async () => {
        unOffer();
        unIce();
        unErr();
        unWarn();
        pc.close();
        await invoke("webrtc_stop_stream");
    };

    activeStop = stop;
    return stop;
}
