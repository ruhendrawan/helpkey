import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SettingService {
  activeTitle = "";
  appOnTop = true;
  isSettingVisible = false;

  constructor() {}
}
