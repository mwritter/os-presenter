import { HsvaColor } from "@uiw/react-color";

/**
 * Convert HSVA color to RGBA string
 * @param hsva - HSVA color where h: 0-360, s: 0-100, v: 0-100, a: 0-1
 */
export function hsvaToRgba(hsva: HsvaColor): string {
  const { h, s, v, a } = hsva;

  // Normalize s and v from 0-100 to 0-1 for calculation
  const sNorm = s / 100;
  const vNorm = v / 100;

  // Convert HSV to RGB
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert to 0-255 range
  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);

  return `rgba(${red}, ${green}, ${blue}, ${a})`;
}

/**
 * Convert RGBA string to HSVA color
 * Supports formats: rgba(r, g, b, a), rgb(r, g, b), hex (#RRGGBB, #RRGGBBAA)
 * @returns HSVA color where h: 0-360, s: 0-100, v: 0-100, a: 0-1
 */
export function rgbaToHsva(rgba: string): HsvaColor {
  // Default to black with full opacity
  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  // Parse rgba() or rgb() format
  if (rgba.startsWith("rgba(") || rgba.startsWith("rgb(")) {
    const values = rgba.match(/[\d.]+/g);
    if (values) {
      r = parseInt(values[0]) / 255;
      g = parseInt(values[1]) / 255;
      b = parseInt(values[2]) / 255;
      a = values[3] ? parseFloat(values[3]) : 1;
    }
  }
  // Parse hex format (#RRGGBB or #RRGGBBAA)
  else if (rgba.startsWith("#")) {
    const hex = rgba.slice(1);
    if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
      a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    } else if (hex.length === 3 || hex.length === 4) {
      // Support shorthand hex (#RGB or #RGBA)
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
      a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
    }
  }

  // Convert RGB to HSV
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  let v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    if (h < 0) {
      h += 360;
    }
  }

  // Convert s and v from 0-1 to 0-100 range for @uiw/react-color
  return { h, s: s * 100, v: v * 100, a };
}

/**
 * Convert hex to rgba string (for backward compatibility)
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const hsva = rgbaToHsva(hex);
  return hsvaToRgba({ ...hsva, a: alpha });
}

