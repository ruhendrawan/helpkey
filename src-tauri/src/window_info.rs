
// src-tauri/src/window_info.rs

#[cfg(target_os = "windows")]
pub mod platform {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use winapi::um::winuser::{GetForegroundWindow, GetWindowTextW};

    pub fn get_active_window_title() -> Option<String> {
        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd.is_null() {
                return None;
            }
            let mut buffer = [0u16; 512];
            let length = GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32);
            if length > 0 {
                let os_string = OsString::from_wide(&buffer[..length as usize]);
                Some(os_string.to_string_lossy().into_owned())
            } else {
                None
            }
        }
    }
}



#[cfg(target_os = "macos")]
pub mod platform {
    use cocoa::base::{id, nil};
    use objc::runtime::Class;
    use objc::{msg_send, sel, sel_impl};
    use libc::pid_t;
    use std::error::Error;
    use std::ffi::CStr;
    use std::os::raw::c_void;
    use std::ptr;

    use core_foundation::base::{CFRelease, CFTypeRef, TCFType};
    use core_foundation::boolean::CFBoolean;
    use core_foundation::dictionary::{CFDictionary, CFDictionaryRef};
    use core_foundation::string::{CFString, CFStringRef};

    use core_foundation_sys::base::Boolean;

    // Type definitions
    type AXUIElementRef = *const c_void;
    type AXError = i32;

    // Constants
    const KAX_ERROR_SUCCESS: i32 = 0;

    extern "C" {
        fn AXUIElementCreateApplication(pid: pid_t) -> AXUIElementRef;
        fn AXUIElementCopyAttributeValue(
            element: AXUIElementRef,
            attribute: CFStringRef,
            value: *mut CFTypeRef,
        ) -> AXError;

        fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> Boolean;
    }

    pub fn get_active_window_title() -> Result<String, Box<dyn Error>> {
        unsafe {
            // Check if the app is trusted
            if !is_process_trusted() {
                return Err("Accessibility permissions are not enabled".into());
            }

            // Get NSWorkspace and the frontmost application
            let workspace_class = Class::get("NSWorkspace").ok_or("Failed to get NSWorkspace class")?;
            let workspace: id = msg_send![workspace_class, sharedWorkspace];
            let active_app: id = msg_send![workspace, frontmostApplication];
            if active_app == nil {
                return Err("No active application".into());
            }

            // Get the application's PID
            let pid: pid_t = msg_send![active_app, processIdentifier];

            // Get the application name
            let app_name_obj: id = msg_send![active_app, localizedName];
            if app_name_obj == nil {
                return Err("Failed to get application name".into());
            }
            let app_name_ptr: *const std::os::raw::c_char = msg_send![app_name_obj, UTF8String];
            if app_name_ptr.is_null() {
                return Err("Failed to get application name string".into());
            }
            let app_name_cstr = CStr::from_ptr(app_name_ptr);
            let app_name = app_name_cstr.to_string_lossy().into_owned();

            // Create an AXUIElement for the application
            let app_element = AXUIElementCreateApplication(pid);
            if app_element.is_null() {
                return Err("Failed to create AXUIElement for application".into());
            }

            // Get the focused window
            let mut window_ref: CFTypeRef = ptr::null_mut();
            let error = AXUIElementCopyAttributeValue(
                app_element,
                CFString::new("AXFocusedWindow").as_concrete_TypeRef(),
                &mut window_ref,
            );

            if error != KAX_ERROR_SUCCESS || window_ref.is_null() {
                // Release resources if necessary
                if !app_element.is_null() {
                    CFRelease(app_element);
                }
                return Err("Failed to get focused window".into());
            }

            // Get the title of the window
            let mut title_ref: CFTypeRef = ptr::null_mut();
            let error = AXUIElementCopyAttributeValue(
                window_ref as AXUIElementRef,
                CFString::new("AXTitle").as_concrete_TypeRef(),
                &mut title_ref,
            );

            if error != KAX_ERROR_SUCCESS || title_ref.is_null() {
                // Release resources if necessary
                if !window_ref.is_null() {
                    CFRelease(window_ref);
                }
                if !app_element.is_null() {
                    CFRelease(app_element);
                }
                return Err("Failed to get window title".into());
            }

            // Convert CFStringRef to Rust String
            let title_cfstring = CFString::wrap_under_create_rule(title_ref as CFStringRef);
            let window_title = title_cfstring.to_string();

            // Combine app name and window title
            let full_title = format!("{};{}", app_name, window_title);

            if !window_ref.is_null() {
                CFRelease(window_ref);
            }
            if !app_element.is_null() {
                CFRelease(app_element);
            }

            Ok(full_title)
        }
    }

    fn is_process_trusted() -> bool {
        unsafe {
            // Create a dictionary with the kAXTrustedCheckOptionPrompt key set to true
            let prompt_key = CFString::new("AXTrustedCheckOptionPrompt");
            let prompt_value = CFBoolean::true_value();

            let options = CFDictionary::from_CFType_pairs(&[(
                prompt_key.as_CFType(),
                prompt_value.as_CFType(),
            )]);

            let trusted = AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef());

            trusted != 0
        }
    }
}



#[cfg(target_os = "linux")]
pub mod platform {
    use std::process::Command;

    pub fn get_active_window_title() -> Option<String> {
        let output = Command::new("xdotool")
            .args(&["getwindowfocus", "getwindowname"])
            .output()
            .ok()?;
        let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if title.is_empty() {
            None
        } else {
            Some(title)
        }
    }
}
