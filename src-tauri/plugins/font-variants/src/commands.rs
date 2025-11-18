use crate::models::FontVariantInfo;

/// Get just the font family names (fast)
#[tauri::command]
pub fn get_font_families() -> Result<Vec<String>, String> {
    use font_kit::source::SystemSource;

    let source = SystemSource::new();
    let mut families = source
        .all_families()
        .map_err(|e| format!("Failed to get font families: {}", e))?;

    families.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));
    Ok(families)
}

/// Get variants for a specific font family (on-demand)
#[tauri::command]
pub fn get_font_variants(family_name: String) -> Result<Vec<FontVariantInfo>, String> {
    use font_kit::source::SystemSource;
    use std::collections::HashMap;

    let source = SystemSource::new();
    let mut variants_map = HashMap::new();

    // Get all fonts in this family
    if let Ok(handles) = source.select_family_by_name(&family_name) {
        for handle in handles.fonts() {
            match handle.load() {
                Ok(font) => {
                    let postscript_name = font.postscript_name();
                    let full_name = font.full_name();

                    // Extract style name from full name
                    let style = if full_name.starts_with(&family_name) {
                        let style_part = full_name
                            .strip_prefix(&family_name)
                            .unwrap_or("")
                            .trim_start_matches(&['-', ' '][..])
                            .trim();

                        if style_part.is_empty() {
                            "Regular".to_string()
                        } else {
                            style_part.to_string()
                        }
                    } else {
                        postscript_name
                            .as_ref()
                            .and_then(|ps| {
                                ps.strip_prefix(&family_name.replace(" ", ""))
                                    .map(|s| s.trim_start_matches('-').to_string())
                            })
                            .unwrap_or_else(|| "Regular".to_string())
                    };

                    // Use style name as the key for deduplication
                    if !variants_map.contains_key(&style) {
                        variants_map.insert(
                            style.clone(),
                            FontVariantInfo {
                                family: family_name.clone(),
                                style,
                                full_name: full_name.clone(),
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


