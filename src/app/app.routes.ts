import { Routes } from "@angular/router";
import { EnableAccessibilityComponent } from "./macos/enable-accessibility/enable-accessibility.component";
import { HomeComponent } from "./home/home.component";

export const routes: Routes = [
  {
    path: "macos/enable-accessibility",
    component: EnableAccessibilityComponent,
  },
  { path: "home", component: HomeComponent },
  { path: "**", redirectTo: "home" },
];
