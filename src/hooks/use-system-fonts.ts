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

// Cached font family names
let cachedFontNames: string[] | null = null;
let loadingPromise: Promise<void> | null = null;

export interface SystemFontsData {
  fontNames: string[];
  isLoading: boolean;
  error: Error | null;
}

export function useSystemFonts(): SystemFontsData {
  const [fontNames, setFontNames] = useState<string[]>(cachedFontNames || []);
  const [isLoading, setIsLoading] = useState(!cachedFontNames);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have cached data, use it
    if (cachedFontNames) {
      setFontNames(cachedFontNames);
      setIsLoading(false);
      return;
    }

    // If already loading, wait for it
    if (loadingPromise) {
      loadingPromise
        .then(() => {
          if (cachedFontNames) {
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

        // Cache the results
        cachedFontNames = families;
        console.log("cachedFontNames", cachedFontNames);
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

  return { fontNames, isLoading, error };
}

/**
 * Get font variants with human-readable labels
 */
export interface FontVariantOption {
  label: string; // Display name (e.g., "Bold", "Condensed Bold")
  value: string; // Style name (same as label, used for selection)
  fullName: string; // PostScript name (or full name fallback) to use in CSS
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
    console.log("variantsCache", variantsCache);
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
  // Use postscript_name for CSS (more reliable) with fallback to full_name
  return cachedVariants.map((variant) => ({
    label: variant.style,
    value: variant.style,
    fullName: variant.postscript_name || variant.full_name,
  }));
}

/**
 * Get a fallback font by name (for fonts not yet loaded)
 */
export function getFontByName(
  fontNames: string[],
  name: string
): string | null {
  const font = fontNames.find((f) => f.toLowerCase() === name.toLowerCase());
  return font || null;
}
