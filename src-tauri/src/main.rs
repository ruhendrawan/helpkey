// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#![warn(clippy::nursery, clippy::pedantic)]

mod window_info;
mod ns_panel;

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};


#[allow(unused_imports)]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};


#[tauri::command]
fn get_active_window_info() -> Result<String, String> {
    window_info::platform::get_active_window_title().map_err(|e| e.to_string())
}


fn create_system_tray() -> SystemTray {
    let show = CustomMenuItem::new("Show".to_string(), "Show");
    let settings = CustomMenuItem::new("Settings".to_string(), "Settings...");
    let quit = CustomMenuItem::new("Quit".to_string(), "Quit HelpKey");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(settings)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}


fn toggle_window_visibility(app_handle: &tauri::AppHandle) {
    let window = app_handle.get_window("main").unwrap();
    let is_visible = window.is_visible().unwrap();
    if is_visible {
        window.hide().unwrap();
    } else {
        // The JS Client (Angular) will NOT show/focus the window after getting active window title
        window.emit("OnRefreshTitle", {}).unwrap();
        window.show().unwrap();
        window.center().unwrap();
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_active_window_info,
            ns_panel::init_ns_panel,
            ns_panel::show_app,
            ns_panel::hide_app
        ])
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            let window = app.get_window("main").unwrap();
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(10.0))
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            window.hide().unwrap();
            Ok(())
        })
        .manage(ns_panel::State::default())
        .system_tray(create_system_tray())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "Show" => {
                    toggle_window_visibility(app);
                }
                "Settings" => {
                    let window = app.get_window("main").unwrap();
                    window.emit("SettingsClicked", Some("Yes")).unwrap();
                    window.show().unwrap();
                    window.center().unwrap();
                    window.set_focus().unwrap();
                }
                "Quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
