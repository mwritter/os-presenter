use crate::models::FontVariantInfo;

/// Get just the font family names (fast)
#[tauri::command]
pub fn get_font_families() -> Result<Vec<String>, String> {
    use font_kit::source::SystemSource;

    let source = SystemSource::new();
    let mut families = source
        .all_families()
        .map_err(|e| format!("Failed to get font families: {}", e))?;

    // Normalize whitespace in family names
    families = families
        .into_iter()
        .map(|f| normalize_whitespace(&f))
        .collect();

    families.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));
    Ok(families)
}

/// Normalize whitespace: replace any Unicode whitespace with regular ASCII space
/// and collapse multiple spaces into one
fn normalize_whitespace(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_whitespace() { ' ' } else { c })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
}

/// Common font style suffixes that might get duplicated
const STYLE_SUFFIXES: &[&str] = &[
    "Regular",
    "Bold",
    "Italic",
    "Light",
    "Medium",
    "Black",
    "Thin",
    "Heavy",
    "Semibold",
    "SemiBold",
    "Semi Bold",
    "Extra Bold",
    "ExtraBold",
    "Ultra Bold",
    "UltraBold",
    "Extra Light",
    "ExtraLight",
    "Ultra Light",
    "UltraLight",
    "Book",
    "Demi",
    "Oblique",
    "Condensed",
    "Expanded",
];

/// Fix duplicated style names like "Regular Regular" -> "Regular"
fn fix_duplicated_style(style: &str) -> String {
    let normalized = normalize_whitespace(style);

    // Check for exact word duplication at the end (e.g., "Regular Regular")
    let words: Vec<&str> = normalized.split_whitespace().collect();
    if words.len() >= 2 {
        let last = words[words.len() - 1];
        let second_last = words[words.len() - 2];
        if last.eq_ignore_ascii_case(second_last) {
            // Remove the duplicate last word
            return words[..words.len() - 1].join(" ");
        }
    }

    // Check for known suffix duplications
    for suffix in STYLE_SUFFIXES {
        let duplicated = format!("{} {}", suffix, suffix);
        if normalized.ends_with(&duplicated) {
            return normalized[..normalized.len() - suffix.len() - 1].to_string();
        }
    }

    normalized
}

/// Fix duplicated parts in full font name
fn fix_duplicated_full_name(full_name: &str, family_name: &str) -> String {
    let normalized_full = normalize_whitespace(full_name);
    let normalized_family = normalize_whitespace(family_name);

    // If the full name has obvious duplication, fix it
    // e.g., "Inter Regular Regular" -> "Inter Regular"

    // First, check if after removing family name we get a duplicated style
    if normalized_full.starts_with(&normalized_family) {
        let style_part = normalized_full
            .strip_prefix(&normalized_family)
            .unwrap_or("")
            .trim();

        if !style_part.is_empty() {
            let fixed_style = fix_duplicated_style(style_part);
            if fixed_style != style_part {
                // Return fixed full name
                if fixed_style == "Regular" {
                    return normalized_family;
                }
                return format!("{} {}", normalized_family, fixed_style);
            }
        }
    }

    normalized_full
}

/// Get variants for a specific font family (on-demand)
#[tauri::command]
pub fn get_font_variants(family_name: String) -> Result<Vec<FontVariantInfo>, String> {
    use font_kit::source::SystemSource;
    use std::collections::HashMap;

    let source = SystemSource::new();
    let mut variants_map = HashMap::new();

    // Normalize the input family name
    let normalized_family = normalize_whitespace(&family_name);

    // Get all fonts in this family
    if let Ok(handles) = source.select_family_by_name(&family_name) {
        for handle in handles.fonts() {
            match handle.load() {
                Ok(font) => {
                    let postscript_name = font.postscript_name();
                    let full_name = normalize_whitespace(&font.full_name());

                    // Extract style name from full name
                    let style = if full_name.starts_with(&normalized_family) {
                        let style_part = full_name
                            .strip_prefix(&normalized_family)
                            .unwrap_or("")
                            .trim();

                        if style_part.is_empty() {
                            "Regular".to_string()
                        } else {
                            // Fix any duplicated style names
                            fix_duplicated_style(style_part)
                        }
                    } else {
                        postscript_name
                            .as_ref()
                            .and_then(|ps| {
                                ps.strip_prefix(&normalized_family.replace(" ", ""))
                                    .map(|s| normalize_whitespace(s.trim_start_matches('-')))
                            })
                            .unwrap_or_else(|| "Regular".to_string())
                    };

                    // Fix the full name if it has duplications
                    let fixed_full_name = fix_duplicated_full_name(&full_name, &normalized_family);

                    // Use style name as the key for deduplication
                    if !variants_map.contains_key(&style) {
                        variants_map.insert(
                            style.clone(),
                            FontVariantInfo {
                                family: normalized_family.clone(),
                                style,
                                full_name: fixed_full_name,
                                postscript_name,
                            },
                        );
                    }
                }
                Err(_) => continue,
            }
        }
    }

    // Convert to vec and sort by style name
    let mut variants: Vec<FontVariantInfo> = variants_map.into_values().collect();
    variants.sort_by(|a, b| a.style.cmp(&b.style));
    Ok(variants)
}
