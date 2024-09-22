import { Component } from "@angular/core";
import { SettingService } from "../setting.service";
import { CheatsheetComponent } from "../cheatsheet/cheatsheet.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CheatsheetComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(public setting: SettingService) {}
  ngOnInit() {}
}
