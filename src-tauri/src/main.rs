// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod window_info;

// use tauri::{Manager};

#[tauri::command]
fn get_active_window_info() -> Result<String, String> {
    window_info::platform::get_active_window_title().map_err(|e| e.to_string())
}


// fn toggle_window_visibility(app_handle: &tauri::AppHandle) {
//     let window = app_handle.get_window("main").unwrap();
//     let is_visible = window.is_visible().unwrap();
//     if is_visible {
//         window.hide().unwrap();
//     } else {
//         window.show().unwrap();
//         window.set_focus().unwrap();
//         window.emit("refresh-active-window-title", {}).unwrap();
//     }
// }

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_active_window_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
