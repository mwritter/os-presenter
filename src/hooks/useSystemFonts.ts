import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface FontVariantInfo {
  family: string; // Base family name
  style: string; // Style name like "Bold", "Condensed Bold"
  full_name: string; // Full font name for CSS
  postscript_name?: string;
}

// Cache for font variants per family
const variantsCache = new Map<string, FontVariantInfo[]>();

export interface FontVariant {
  weight: number;
  style: "normal" | "italic" | "oblique";
  fontName: string;
  path: string;
}

export interface FontFamily {
  name: string;
  variants: FontVariant[];
  availableStyles: Set<"normal" | "italic" | "oblique">;
  availableWeights: Set<number>;
}

export interface SystemFontsData {
  fonts: Map<string, FontFamily>;
  fontNames: string[];
  isLoading: boolean;
  error: Error | null;
}

// Cached font data to avoid reloading
let cachedFonts: Map<string, FontFamily> | null = null;
let cachedFontNames: string[] | null = null;
let loadingPromise: Promise<void> | null = null;

export function useSystemFonts(): SystemFontsData {
  const [fonts, setFonts] = useState<Map<string, FontFamily>>(
    cachedFonts || new Map()
  );
  const [fontNames, setFontNames] = useState<string[]>(cachedFontNames || []);
  const [isLoading, setIsLoading] = useState(!cachedFonts);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have cached data, use it
    if (cachedFonts && cachedFontNames) {
      setFonts(cachedFonts);
      setFontNames(cachedFontNames);
      setIsLoading(false);
      return;
    }

    // If already loading, wait for it
    if (loadingPromise) {
      loadingPromise
        .then(() => {
          if (cachedFonts && cachedFontNames) {
            setFonts(cachedFonts);
            setFontNames(cachedFontNames);
          }
        })
        .catch((err) => setError(err))
        .finally(() => setIsLoading(false));
      return;
    }

    // Start loading - just get font family names (fast!)
    const loadSystemFonts = async () => {
      try {
        console.log("Loading font families...");
        const startTime = performance.now();

        // Only load family names, not variants (much faster!)
        const families = await invoke<string[]>("get_font_families");

        const endTime = performance.now();
        console.log(
          `Loaded ${families.length} font families in ${endTime - startTime}ms`
        );

        // Create empty font map - variants will be loaded on demand
        const fontMap = new Map<string, FontFamily>();
        families.forEach((family) => {
          fontMap.set(family, {
            name: family,
            variants: [],
            availableStyles: new Set(),
            availableWeights: new Set(),
          });
        });

        // Cache the results
        cachedFonts = fontMap;
        cachedFontNames = families;

        setFonts(fontMap);
        setFontNames(families);

        console.log("Font families loaded and cached");
      } catch (err) {
        console.error("Failed to load font families:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
        loadingPromise = null;
      }
    };

    loadingPromise = loadSystemFonts();
  }, []);

  return { fonts, fontNames, isLoading, error };
}

/**
 * Get available styles for a specific font family
 */
export function getAvailableStyles(
  fonts: Map<string, FontFamily>,
  fontFamily: string
): Array<"normal" | "italic" | "oblique"> {
  const family = fonts.get(fontFamily);
  if (!family) {
    return ["normal", "italic", "oblique"]; // fallback to all
  }
  return Array.from(family.availableStyles).sort();
}

/**
 * Get font variants with human-readable labels
 */
export interface FontVariantOption {
  label: string; // Display name (e.g., "Bold", "Condensed Bold")
  value: string; // Style name (same as label, used for selection)
  fullName: string; // Full font name to use in CSS
}

export async function loadFontVariants(
  fontFamily: string
): Promise<FontVariantInfo[]> {
  // Check cache first
  if (variantsCache.has(fontFamily)) {
    return variantsCache.get(fontFamily)!;
  }

  // Load variants from Tauri
  try {
    const variants = await invoke<FontVariantInfo[]>("get_font_variants", {
      familyName: fontFamily,
    });
    variantsCache.set(fontFamily, variants);
    return variants;
  } catch (err) {
    console.error(`Failed to load variants for ${fontFamily}:`, err);
    return [];
  }
}

export function getAvailableVariants(fontFamily: string): FontVariantOption[] {
  // Check if we have cached variants for this family
  const cachedVariants = variantsCache.get(fontFamily);

  if (!cachedVariants || cachedVariants.length === 0) {
    // Return a loading state or fallback
    return [{ label: "Regular", value: "Regular", fullName: fontFamily }];
  }

  // Convert FontVariantInfo to FontVariantOption
  return cachedVariants.map((variant) => ({
    label: variant.style,
    value: variant.style,
    fullName: variant.full_name,
  }));
}

/**
 * Get available weights for a specific font family
 */
export function getAvailableWeights(
  fonts: Map<string, FontFamily>,
  fontFamily: string
): number[] {
  const family = fonts.get(fontFamily);
  if (!family) {
    return [400, 700]; // fallback to normal and bold
  }
  return Array.from(family.availableWeights).sort((a, b) => a - b);
}
