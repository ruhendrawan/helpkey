import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Component } from "@angular/core";

import { CommonModule } from "@angular/common";
import { Keymap } from "../../utils/keymaps";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-cheatsheet",
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: "./cheatsheet.component.html",
  styleUrl: "./cheatsheet.component.css",
})
export class CheatsheetComponent {
  list: Keymap[] = [];
  listFiltered: Keymap[] = [];

  textFilter = "";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Keymap[]>("keymaps/vim.json").subscribe((data) => {
      this.list = data;
      this.listFiltered = data;
    });
  }

  onFilterChange(): void {
    const filter = this.textFilter.toLowerCase();
    this.listFiltered = this.list.filter((key) =>
      key.motion.toLowerCase().includes(filter),
    );
  }
}
