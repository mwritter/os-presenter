use serde::{Deserialize, Serialize};

/// Information about a specific font variant
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FontVariantInfo {
    pub family: String,    // Base family name (e.g., "American Typewriter")
    pub style: String,     // The style name like "Bold", "Condensed Bold", etc.
    pub full_name: String, // Full font name to use in CSS (e.g., "American Typewriter Bold")
    pub postscript_name: Option<String>,
}



