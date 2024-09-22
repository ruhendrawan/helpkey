import { Component, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";

import { invoke } from "@tauri-apps/api/tauri";
// import { listen } from "@tauri-apps/api/event";
import { register } from "@tauri-apps/api/globalShortcut";
import { appWindow } from "@tauri-apps/api/window";
import { SettingService } from "./setting.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  updateWindowTitle(title: string) {
    this.setting.activeTitle = title;
  }

  async fetchActiveWindowTitle() {
    try {
      const title = await invoke("get_active_window_info");
      console.log(`Active window/tab title: ${title}`);
      this.updateWindowTitle(`${title}`);
      // Angular change detection is not triggered when the window is focused programmatically
      this.cdRef.detectChanges();
    } catch (error) {
      console.error("Error fetching active window/tab title:", error);
      if (error.includes("Accessibility permissions are not enabled")) {
        // Show an HTML page or a modal with instructions
        this.showPermissionInstructions();
      }
    }
  }

  showPermissionInstructions() {
    this.router.navigate(["/macos/enable-accessibility"]);
  }

  registerGlobalShortcut() {
    register("Control+Shift+Z", () => {
      console.log("Shortcut triggered");
      if (this.setting.appOnTop) {
        appWindow.hide();
        appWindow.setAlwaysOnTop(false);
        this.setting.appOnTop = false;
        return;
      } else {
        this.fetchActiveWindowTitle();
        appWindow.show();
        appWindow.setAlwaysOnTop(true);
        appWindow.setFocus();
        this.setting.appOnTop = true;
      }
    });
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private setting: SettingService,
  ) {
    this.registerGlobalShortcut();
    this.fetchActiveWindowTitle().then(() => {});
    // listen("refresh-active-window-title", () => {
    //   this.fetchActiveWindowTitle();
    // });
  }
}
