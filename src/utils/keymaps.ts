interface Keychord {
  key: string;
  modifiers: string[];
}

interface Keymotion {
  chords: Keychord[];
}

interface Keymap {
  context: string;
  description: string;
  motion: string | Keychord | Keymotion;
}

export async function getKeymaps(): Promise<Keymap[]> {
  // TODO: Check current context and load from JSON file
  const keymaps = [];
  return keymaps.map((cmd) => ({
    context: cmd.name || "",
    description: cmd.description || "",
    motion: cmd.motion || "",
  }));
}
