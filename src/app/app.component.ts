import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
} from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";

import { appWindow } from "@tauri-apps/api/window";
import { register } from "@tauri-apps/api/globalShortcut";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { SettingService } from "./setting.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements AfterViewInit {
  updateWindowTitle(title: string) {
    this.setting.activeTitle = title;
  }

  @HostListener("document:keydown", ["$event"])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      appWindow.hide();
    } else if (event.metaKey && event.key === ",") {
      this.setting.isSettingVisible = true;
    }
  }

  @HostListener("window:blur")
  onBlur() {
    appWindow.hide();
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
        this.showPermissionInstructions();
      }
    }
  }

  showPermissionInstructions() {
    this.router.navigate(["/macos/enable-accessibility"]);
  }

  refreshTitleAndFocus() {
    this.fetchActiveWindowTitle();
    // DO NOT SET FOCUS HERE, IT WILL BREAK THE NSPANEL
    // USER WILL HAVE TO CLICK ON THE WINDOW OF PRIOR APP TO FOCUS IT
    // ---------------------
    // appWindow.show();
    // appWindow.center();
    // appWindow.setFocus();
  }

  registerGlobalShortcut() {
    // Shortcut binding in Angular should be the same as the one
    // in that invoke ns_panel function
    register("Control+Shift+Z", () => {
      if (document.hasFocus()) {
        appWindow.hide();
      } else {
        this.refreshTitleAndFocus();
      }
    });
  }

  get isTauri(): boolean {
    return !!(window && window.__TAURI__);
  }

  async initNsPanel() {
    try {
      // if (!this.isTauri) {
      // Initialize NSPanel along with the global shortcut binding
      // JS shortcut binding will be overridden by the Rust binding
      await invoke("init_ns_panel", { shortcut: "Control+Shift+Z" });
      // }
    } catch (error) {
      console.error("Error initializing NSPanel:", error);
    }
  }

  ngAfterViewInit() {
    (async () => {
      await this.initNsPanel();
      await this.fetchActiveWindowTitle();
    })();
    listen("OnRefreshTitle", () => {
      this.refreshTitleAndFocus();
    });
    this.registerGlobalShortcut();
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private setting: SettingService,
  ) {}
}
