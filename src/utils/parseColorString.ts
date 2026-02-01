/**
 * Parse a color string to RGB values
 * Supports: #RGB, #RRGGBB, rgb(r,g,b), rgba(r,g,b,a), and common CSS color names
 */
export function parseColorString(color: string): { r: number; g: number; b: number } {
    // Handle hex colors
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      
      // Expand short hex (#RGB -> #RRGGBB)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Check for NaN (invalid hex)
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return { r, g, b };
      }
    }
    
    // Handle rgba() or rgb() format - matches "rgba(255, 128, 64, 1)" or "rgb(255, 128, 64)"
    const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1], 10),
        g: parseInt(rgbaMatch[2], 10),
        b: parseInt(rgbaMatch[3], 10),
      };
    }
    
    // Fallback to black
    console.warn(`Could not parse color: ${color}, falling back to black`);
    return { r: 0, g: 0, b: 0 };
  }