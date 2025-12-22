use serde::Serialize;
use tauri::{Emitter, Manager, PhysicalPosition, PhysicalSize, Position, Size};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Serialize, Clone)]
struct Insets {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[derive(Serialize, Clone)]
struct CursorPoint {
    x: i32,
    y: i32,
}

#[derive(Serialize, Clone)]
struct StartDrawingPayload {
    insets: Insets,
    cursor: CursorPoint,
}

#[tauri::command]
fn capture_monitor_png_at(x: i32, y: i32) -> Result<Vec<u8>, String> {
    let monitor = xcap::Monitor::from_point(x, y).map_err(|e| e.to_string())?;
    let img = monitor.capture_image().map_err(|e| e.to_string())?;

    let mut out: Vec<u8> = Vec::new();
    let dyn_img = image::DynamicImage::ImageRgba8(img);
    dyn_img
        .write_to(&mut std::io::Cursor::new(&mut out), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;

    Ok(out)
}

fn pick_monitor(app: &tauri::AppHandle, x: f64, y: f64) -> Option<tauri::Monitor> {
    match app.monitor_from_point(x, y) {
        Ok(Some(m)) => {
            println!("pick_monitor: monitor_from_point ok");
            return Some(m);
        }
        Ok(None) => {
            println!("pick_monitor: monitor_from_point returned None");
        }
        Err(e) => {
            println!("pick_monitor: monitor_from_point error: {}", e);
        }
    }

    match app.primary_monitor() {
        Ok(Some(m)) => {
            println!("pick_monitor: primary_monitor ok");
            return Some(m);
        }
        Ok(None) => {
            println!("pick_monitor: primary_monitor returned None");
        }
        Err(e) => {
            println!("pick_monitor: primary_monitor error: {}", e);
        }
    }

    match app.available_monitors() {
        Ok(list) => {
            if list.is_empty() {
                println!("pick_monitor: available_monitors empty");
                None
            } else {
                println!("pick_monitor: available_monitors fallback to first");
                Some(list[0].clone())
            }
        }
        Err(e) => {
            println!("pick_monitor: available_monitors error: {}", e);
            None
        }
    }
}

fn show_overlay_and_emit(app: &tauri::AppHandle) {
    let win = match app.get_webview_window("main") {
        Some(w) => w,
        None => {
            println!("show_overlay_and_emit: missing main window");
            return;
        }
    };

    let cursor = match app.cursor_position() {
        Ok(p) => p,
        Err(e) => {
            println!("cursor_position error: {}", e);
            return;
        }
    };

    let cx_f64 = cursor.x;
    let cy_f64 = cursor.y;

    println!("cursor_position: x={} y={}", cx_f64, cy_f64);

    let mon = match pick_monitor(app, cx_f64, cy_f64) {
        Some(m) => m,
        None => {
            println!("pick_monitor failed: no monitor available");
            return;
        }
    };

    let bounds_pos = mon.position();
    let bounds_size = mon.size();

    let work = mon.work_area();
    let work_pos = work.position;
    let work_size = work.size;

    let bounds_w_i32 = bounds_size.width as i32;
    let bounds_h_i32 = bounds_size.height as i32;
    let work_w_i32 = work_size.width as i32;
    let work_h_i32 = work_size.height as i32;

    let insets = Insets {
        left: work_pos.x - bounds_pos.x,
        top: work_pos.y - bounds_pos.y,
        right: (bounds_pos.x + bounds_w_i32) - (work_pos.x + work_w_i32),
        bottom: (bounds_pos.y + bounds_h_i32) - (work_pos.y + work_h_i32),
    };

    println!(
        "chosen monitor bounds: pos=({}, {}) size=({}, {}) work=pos({}, {}) size({}, {})",
        bounds_pos.x,
        bounds_pos.y,
        bounds_size.width,
        bounds_size.height,
        work_pos.x,
        work_pos.y,
        work_size.width,
        work_size.height
    );

    let _ = win.set_always_on_top(true);

    let _ = win.set_position(Position::Physical(PhysicalPosition::new(
        bounds_pos.x,
        bounds_pos.y,
    )));

    let _ = win.set_size(Size::Physical(PhysicalSize::new(
        bounds_size.width,
        bounds_size.height,
    )));

    let _ = win.set_ignore_cursor_events(false);
    let _ = win.set_focusable(true);
    let _ = win.show();
    let _ = win.set_focus();

    let payload = StartDrawingPayload {
        insets,
        cursor: CursorPoint {
            x: cx_f64.round() as i32,
            y: cy_f64.round() as i32,
        },
    };

    match win.emit("start-drawing", payload) {
        Ok(_) => println!("emitted start-drawing"),
        Err(e) => println!("emit start-drawing error: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }
                    println!("hotkey pressed");
                    show_overlay_and_emit(app);
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![capture_monitor_png_at])
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
