# tauri-plugin-font-variants

A Tauri plugin for enumerating system fonts with **full variant support**, including proper handling of TrueType Collection (TTC) files.

## Features

- ✅ **Full TTC Support** - Properly enumerates all fonts inside TrueType Collection files
- ✅ **Human-Readable Style Names** - Returns "Bold", "Italic", etc. instead of raw weight numbers
- ✅ **On-Demand Loading** - Fast initial load, load variants only when needed
- ✅ **Cross-Platform** - Works on macOS, Windows, and Linux
- ✅ **Smart Deduplication** - Automatically removes duplicate font entries
- ✅ **PostScript Names** - Includes PostScript font names for advanced use cases

## Why This Plugin?

Unlike `tauri-plugin-system-fonts`, this plugin properly handles TTC files, which are commonly used on macOS to store multiple font variants in a single file. This means:

- **Helvetica Neue**: 14 variants ✅ (vs 1 with other plugins ❌)
- **SF Pro**: All variants ✅ (vs limited support ❌)
- All font weights and styles properly detected

## Installation

Since this is a local plugin, it's already integrated into your app via a path dependency.

## API

### `get_font_families()`

Returns a list of all font family names available on the system.

**Returns:** `Result<Vec<String>, String>`

```typescript
import { invoke } from "@tauri-apps/api/core";

const families = await invoke<string[]>("get_font_families");
// ["Arial", "Helvetica Neue", "Times New Roman", ...]
```

### `get_font_variants(familyName: string)`

Returns detailed information about all variants of a specific font family.

**Parameters:**
- `familyName` - The font family name (e.g., "Helvetica Neue")

**Returns:** `Result<Vec<FontVariantInfo>, String>`

```typescript
interface FontVariantInfo {
  family: string;         // "Helvetica Neue"
  style: string;          // "Bold", "Light", "Regular", etc.
  full_name: string;      // "Helvetica Neue Bold"
  postscript_name?: string; // "HelveticaNeue-Bold"
}

const variants = await invoke<FontVariantInfo[]>("get_font_variants", {
  familyName: "Helvetica Neue"
});
```

## Usage Example

See `src/hooks/useSystemFonts.ts` for a complete React hook implementation with caching.

## Technical Details

- Built on [`font-kit`](https://github.com/servo/font-kit) for robust cross-platform font enumeration
- Uses platform-specific backends:
  - **macOS**: Core Text
  - **Windows**: DirectWrite
  - **Linux**: Fontconfig + FreeType
- Smart style name extraction from full font names
- Automatic sorting by family/style names

## Future Plans

This plugin is designed to eventually be extracted into a standalone npm/crates.io package for the Tauri community.

## License

MIT



