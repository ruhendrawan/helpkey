import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Component } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Keymap } from "../../utils/keymaps";
import { empty } from "rxjs";

@Component({
  selector: "app-cheatsheet",
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: "./cheatsheet.component.html",
  styleUrl: "./cheatsheet.component.css",
})
export class CheatsheetComponent {
  list: Keymap[] = [];
  listGrouped: { [key: string]: Keymap[] } = {};
  listContexts: string[] = [];
  chunkContexts: string[][] = [];
  listFiltered: Keymap[] = [];

  textFilter = "";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Keymap[]>("keymaps/vim.json").subscribe((data) => {
      this.list = data;
      this.listFiltered = data;
      this.updateListGrouped(data);
    });
  }

  updateListGrouped(keymap: Keymap[]): void {
    this.listGrouped = keymap.reduce((groups, km) => {
      if (!groups[km.context]) {
        groups[km.context] = [];
      }
      km.motion = this.reorganizeModifiers(km.motion);
      groups[km.context].push(km);
      return groups;
    }, {});

    this.listContexts = Object.keys(this.listGrouped).sort();

    let colMax = 2;
    let chunkSize = Math.ceil(this.listContexts.length / colMax);
    console.log(chunkSize);
    this.chunkContexts = this.listContexts.reduce((acc, context, index) => {
      if (index % chunkSize === 0) {
        acc.push(this.listContexts.slice(index, index + chunkSize));
      }
      return acc;
    }, []);
  }

  reorganizeModifiers(motion: string): string {
    let motions = motion.split(" ");

    for (let m = 0; m < motions.length; m++) {
      let hotkeys = motions[m].split("+");

      let newkeys = "";
      let is_alt = false;
      let is_ctrl = false;
      let is_shift = false;
      let is_cmd = false;
      for (let i = 0; i < hotkeys.length; i++) {
        let hotkey = hotkeys[i].toLowerCase();
        if (["alt", "option", "opt"].includes(hotkey)) {
          hotkeys[i] = "";
          is_alt = true;
        } else if (
          ["cmd", "command", "win", "meta", "winkey", "windows"].includes(
            hotkey,
          )
        ) {
          is_cmd = true;
          hotkeys[i] = "";
        } else if (["ctrl", "control"].includes(hotkey)) {
          is_ctrl = true;
          hotkeys[i] = "";
        } else if (["shift"].includes(hotkey)) {
          is_shift = true;
          hotkeys[i] = "";
        }
      }

      if (is_ctrl) {
        newkeys += "C-";
      }
      if (is_alt) {
        newkeys += "A-";
      }
      if (is_shift) {
        newkeys += "S-";
      }
      if (is_cmd) {
        newkeys += "M-";
      }

      for (let i = 0; i < hotkeys.length; i++) {
        if (hotkeys[i]) {
          newkeys += hotkeys[i];
        }
      }

      motions[m] = newkeys;
    }

    return motions.join(" ");
  }

  onFilterChange(): void {
    const filter = this.textFilter.toLowerCase();

    // Split the filter text into tokens for more flexible matching
    const tokens = filter.split(" ").filter((token) => token);

    this.listFiltered = this.list.filter((keymap) => {
      const motion = keymap.motion.toLowerCase();
      const description = keymap.description.toLowerCase();

      return tokens.every(
        (token) => motion.includes(token) || description.includes(token),
      );
    });

    this.updateListGrouped(this.listFiltered);
  }
}
