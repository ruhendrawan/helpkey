import { Component } from "@angular/core";
import { SettingService } from "../setting.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(public setting: SettingService) {}
  ngOnInit() {}
}
