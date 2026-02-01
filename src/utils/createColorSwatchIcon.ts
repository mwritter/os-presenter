import { Image } from "@tauri-apps/api/image";
import { parseColorString } from "./parseColorString";

/**
 * Create a color swatch image for menu icons
 * Creates a small solid color square (12x12 pixels)
 */
export async function createColorSwatchIcon(colorString: string): Promise<Image> {
    const size = 12;
    const { r, g, b } = parseColorString(colorString);
    
    // Create RGBA pixel data (12x12 = 144 pixels, 4 bytes each)
    const pixels = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      pixels[i * 4] = r;     // Red
      pixels[i * 4 + 1] = g; // Green
      pixels[i * 4 + 2] = b; // Blue
      pixels[i * 4 + 3] = 255; // Alpha (fully opaque)
    }
    
    return Image.new(pixels, size, size);
}