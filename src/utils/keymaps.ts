interface Keychord {
  key: string;
  modifiers: string[];
}

interface Keymotion {
  chords: Keychord[];
}

export interface Keymap {
  context: string;
  description: string;
  data: Keymap | Keymotion | null;
  motion: string;
}

export async function getKeymaps(): Promise<Keymap[]> {
  // TODO: Check current context and load from JSON file
  const keymaps = [];
  return keymaps.map((cmd) => ({
    context: cmd.name || "",
    description: cmd.description || "",
    data: null,
    motion: cmd.motion || "",
  }));
}
