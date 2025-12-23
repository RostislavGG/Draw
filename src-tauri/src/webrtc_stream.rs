use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex, OnceLock};

use tauri::{AppHandle, Emitter, State};

use glib::prelude::*;
use gstreamer::prelude::*;

use gstreamer as gst;
use gstreamer::bus::BusWatchGuard;
use gstreamer_sdp as gst_sdp;
use gstreamer_webrtc as gst_webrtc;

static GST_INIT: OnceLock<()> = OnceLock::new();
static GLIB_LOOP: OnceLock<()> = OnceLock::new();

fn ensure_glib_loop_running() {
    GLIB_LOOP.get_or_init(|| {
        std::thread::spawn(|| {
            // Run a GLib main loop forever. This is required for:
            // - bus.add_watch(...)
            // - gst::Promise::with_change_func(...)
            // - webrtcbin signal callbacks that dispatch via the main context
            let main_loop = glib::MainLoop::new(None, false);
            main_loop.run();
        });
    });
}

#[derive(Clone, Default)]
pub struct WebRtcState {
    pub inner: Arc<Mutex<Option<WebRtcInner>>>,
}

pub struct WebRtcInner {
    pipeline: gst::Pipeline,
    webrtcbin: gst::Element,
    _bus_watch: BusWatchGuard, // keep alive

    // ✅ Robustness: buffer ICE until remote description is set
    remote_desc_set: bool,
    pending_ice: Vec<IceFromFrontendPayload>,
}

#[derive(Debug, Serialize, Clone)]
struct SdpOfferPayload {
    #[serde(rename = "type")]
    type_field: String, // "offer"
    sdp: String,
}

#[derive(Debug, Serialize, Clone)]
struct IceToFrontendPayload {
    candidate: String,
    sdpMLineIndex: u32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct IceFromFrontendPayload {
    pub candidate: String,
    pub sdpMLineIndex: u32,
}

#[tauri::command]
pub async fn webrtc_start_stream(
    app: AppHandle,
    state: State<'_, WebRtcState>,
) -> Result<(), String> {
    let inner = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || webrtc_start_stream_blocking(app, inner))
        .await
        .map_err(|e| format!("spawn_blocking join error: {e}"))?
}

fn sanitize_sdp_for_webkit(input: &str) -> String {
    // Split on ANY newline style and also remove stray '\r' characters.
    let mut out: Vec<String> = Vec::new();

    for raw in input.split(|c| c == '\n' || c == '\r') {
        let line = raw.trim_end(); // keep leading spaces if any (rare), drop trailing
        if line.is_empty() {
            continue;
        }

        // Strip lines that can make strict parsers unhappy
        if line == "a=rtcp-mux-only" {
            continue;
        }
        if line == "a=rtcp-rsize" {
            continue;
        }

        out.push(line.to_string());
    }

    // Re-join using CRLF and ensure trailing CRLF.
    let mut s = out.join("\r\n");
    s.push_str("\r\n");
    s
}

fn webrtc_start_stream_blocking(
    app: AppHandle,
    inner: Arc<Mutex<Option<WebRtcInner>>>,
) -> Result<(), String> {
    GST_INIT.get_or_init(|| gst::init().expect("Failed to init GStreamer"));
    ensure_glib_loop_running();

    // already running?
    if inner.lock().unwrap().is_some() {
        return Ok(());
    }

    let pipeline_str = r#"
webrtcbin name=wb bundle-policy=max-bundle stun-server=stun://stun.l.google.com:19302 latency=0

avfvideosrc capture-screen=true capture-screen-cursor=false !
  video/x-raw,format=BGRA,framerate=60/1 !
  videoconvert !
  video/x-raw,format=NV12 !
  queue leaky=downstream max-size-buffers=1 max-size-time=0 max-size-bytes=0 !
  vtenc_h264 realtime=true allow-frame-reordering=false max-keyframe-interval=60 !
  h264parse config-interval=-1 !
  video/x-h264,stream-format=byte-stream,alignment=au,profile=baseline !
  rtph264pay pt=96 mtu=1200 config-interval=-1 !
  wb.
"#;

    let element = gst::parse::launch(pipeline_str).map_err(|e| e.to_string())?;
    let pipeline = element
        .downcast::<gst::Pipeline>()
        .map_err(|_| "Parsed element is not a Pipeline".to_string())?;

    let webrtcbin = pipeline
        .by_name("wb")
        .ok_or("Failed to find webrtcbin named 'wb'")?;

    // ---- Negotiation: create offer -> set local desc -> emit offer to frontend ----
    {
        let app_outer = app.clone();
        let webrtcbin_outer = webrtcbin.clone();

        webrtcbin.connect("on-negotiation-needed", false, move |_values| {
            let app_inner = app_outer.clone();
            let webrtcbin_inner = webrtcbin_outer.clone();

            let promise = gst::Promise::with_change_func(move |reply| {
                let Ok(Some(s)) = reply else { return };

                let offer: gst_webrtc::WebRTCSessionDescription = match s.get("offer") {
                    Ok(v) => v,
                    Err(_) => return,
                };

                webrtcbin_inner
                    .emit_by_name::<()>("set-local-description", &[&offer, &None::<gst::Promise>]);

                let mut sdp_text = match offer.sdp().as_text() {
                    Ok(t) => t,
                    Err(_) => return,
                };

                sdp_text = sdp_text.replace("a=sendrecv", "a=sendonly");

                sdp_text = sanitize_sdp_for_webkit(&sdp_text);

                let payload = SdpOfferPayload {
                    type_field: "offer".to_string(),
                    sdp: sdp_text,
                };

                let _ = app_inner.emit_to("main", "webrtc-offer", payload);
            });

            webrtcbin_outer
                .emit_by_name::<()>("create-offer", &[&None::<gst::Structure>, &promise]);

            None
        });
    }

    // ---- ICE from backend -> frontend ----
    {
        let app_for_ice = app.clone();

        webrtcbin.connect("on-ice-candidate", false, move |values| {
            let mlineindex = values[1].get::<u32>().unwrap_or(0);
            let candidate = values[2].get::<String>().unwrap_or_default();

            // ✅ IMPORTANT: webrtcbin may emit an empty candidate to signal end-of-candidates
            if candidate.trim().is_empty() {
                println!("(webrtc) end-of-candidates for mline={mlineindex}");
                return None;
            }

            println!("✅ backend ICE mline={mlineindex} cand={candidate}");

            let payload = IceToFrontendPayload {
                candidate,
                sdpMLineIndex: mlineindex,
            };

            // emit to frontend
            let _ = app_for_ice.emit("webrtc-ice", payload);

            None
        });
    }

    // ---- Bus watch (keep guard alive!) ----
    let bus = pipeline.bus().ok_or("Pipeline has no bus")?;
    let app_clone = app.clone();
    let bus_watch = bus
        .add_watch(move |_bus, msg| {
            use gst::MessageView;

            match msg.view() {
                MessageView::Error(err) => {
                    let src = err
                        .src()
                        .map(|s| s.path_string())
                        .unwrap_or_else(|| "unknown".into());
                    let e = err.error();
                    let dbg = err.debug().unwrap_or_default();
                    let _ = app_clone.emit(
                        "webrtc-error",
                        format!("GStreamer error from {src}: {e} ({dbg})"),
                    );
                }
                MessageView::Warning(warn) => {
                    let src = warn
                        .src()
                        .map(|s| s.path_string())
                        .unwrap_or_else(|| "unknown".into());
                    let w = warn.error();
                    let dbg = warn.debug().unwrap_or_default();
                    let _ = app_clone.emit(
                        "webrtc-warn",
                        format!("GStreamer warning from {src}: {w} ({dbg})"),
                    );
                }
                _ => {}
            }
            glib::ControlFlow::Continue
        })
        .map_err(|e| format!("Failed to add bus watch: {e}"))?;

    // Start pipeline
    pipeline
        .set_state(gst::State::Playing)
        .map_err(|e| format!("Failed to set pipeline Playing: {e:?}"))?;

    *inner.lock().unwrap() = Some(WebRtcInner {
        pipeline,
        webrtcbin,
        _bus_watch: bus_watch,
        remote_desc_set: false,
        pending_ice: Vec::new(),
    });

    Ok(())
}

#[tauri::command]
pub async fn webrtc_answer(state: State<'_, WebRtcState>, sdp_text: String) -> Result<(), String> {
    let inner = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = inner.lock().unwrap();
        let inner = guard.as_mut().ok_or("WebRTC not started")?;

        let sdp_msg = gst_sdp::SDPMessage::parse_buffer(sdp_text.as_bytes())
            .map_err(|e| format!("Failed to parse SDP answer: {e}"))?;

        let answer =
            gst_webrtc::WebRTCSessionDescription::new(gst_webrtc::WebRTCSDPType::Answer, sdp_msg);

        inner
            .webrtcbin
            .emit_by_name::<()>("set-remote-description", &[&answer, &None::<gst::Promise>]);

        // ✅ Mark remote description set, then drain buffered ICE
        inner.remote_desc_set = true;

        for c in inner.pending_ice.drain(..) {
            inner.webrtcbin.emit_by_name::<()>(
                "add-ice-candidate",
                &[&c.sdpMLineIndex, &c.candidate.as_str()],
            );
        }

        Ok(())
    })
    .await
    .map_err(|e| format!("spawn_blocking join error: {e}"))?
}

#[tauri::command]
pub async fn webrtc_add_ice(
    state: State<'_, WebRtcState>,
    candidate: IceFromFrontendPayload,
) -> Result<(), String> {
    let inner = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = inner.lock().unwrap();
        let inner = guard.as_mut().ok_or("WebRTC not started")?;

        // ✅ Buffer ICE until remote description is set
        if !inner.remote_desc_set {
            inner.pending_ice.push(candidate);
            return Ok(());
        }

        inner.webrtcbin.emit_by_name::<()>(
            "add-ice-candidate",
            &[&candidate.sdpMLineIndex, &candidate.candidate.as_str()],
        );

        Ok(())
    })
    .await
    .map_err(|e| format!("spawn_blocking join error: {e}"))?
}

#[tauri::command]
pub async fn webrtc_stop_stream(state: State<'_, WebRtcState>) -> Result<(), String> {
    let inner = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = inner.lock().unwrap();
        let Some(inner) = guard.take() else {
            return Ok(());
        };

        let _ = inner.pipeline.set_state(gst::State::Null);
        Ok(())
    })
    .await
    .map_err(|e| format!("spawn_blocking join error: {e}"))?
}
