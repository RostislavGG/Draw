use tauri::PhysicalPosition;
use tauri::PhysicalSize;
use tauri::Position;
use tauri::Size;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

mod webrtc_stream;
use webrtc_stream::WebRtcState;

#[tauri::command]
fn show_overlay(app: tauri::AppHandle) {
    let win = match app.get_webview_window("main") {
        Some(w) => w,
        None => return,
    };

    // Make it interactive
    let _ = win.set_ignore_cursor_events(false);
    let _ = win.set_focusable(true);

    // Resize to current monitor
    if let Ok(Some(monitor)) = win.current_monitor() {
        let pos = monitor.position();
        let size = monitor.size();

        let _ = win.set_position(Position::Physical(PhysicalPosition { x: pos.x, y: pos.y }));

        let _ = win.set_size(Size::Physical(PhysicalSize {
            width: size.width,
            height: size.height,
        }));
    }

    let _ = win.show();
    let _ = win.set_focus();

    let _ = win.emit("start-drawing", ());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ✅ REQUIRED: manage WebRtcState so State<WebRtcState> works in commands
        .manage(WebRtcState::default())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }
                    println!("hotkey pressed");
                    show_overlay(app.clone());
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_overlay,
            webrtc_stream::webrtc_start_stream,
            webrtc_stream::webrtc_answer,
            webrtc_stream::webrtc_add_ice,
            webrtc_stream::webrtc_stop_stream,
        ])
        .setup(|app| {
            let shortcut =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::Semicolon);

            match app.handle().global_shortcut().register(shortcut) {
                Ok(_) => println!("registered hotkey Control+Alt+;"),
                Err(e) => println!("register hotkey error: {}", e),
            }

            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_always_on_top(true);
                let _ = win.set_ignore_cursor_events(true);
                let _ = win.set_focusable(false);
                let _ = win.hide();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
