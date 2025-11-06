#!/bin/bash

# Script to inspect the Tauri app's storage directory

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Storage directory path
STORAGE_DIR="$HOME/Library/Application Support/com.tauri.dev"

echo -e "${BLUE}=== Tauri Presenter Storage Inspector ===${NC}\n"

# Check if storage directory exists
if [ ! -d "$STORAGE_DIR" ]; then
    echo -e "${YELLOW}Storage directory does not exist yet.${NC}"
    echo "The directory will be created when you first run the app."
    echo -e "\nExpected location: ${STORAGE_DIR}"
    exit 0
fi

echo -e "${GREEN}Storage directory:${NC} $STORAGE_DIR\n"

# Function to list and display JSON files in a directory
list_json_files() {
    local dir=$1
    local name=$2
    
    echo -e "${GREEN}${name}:${NC}"
    
    if [ ! -d "$dir" ]; then
        echo "  Directory not created yet"
        echo ""
        return
    fi
    
    local count=$(find "$dir" -maxdepth 1 -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count" -eq 0 ]; then
        echo "  No files found"
        echo ""
        return
    fi
    
    echo "  Found $count file(s):"
    
    for file in "$dir"/*.json; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            echo "    - $filename ($size)"
            
            # Try to extract name from JSON if it exists
            if command -v jq &> /dev/null; then
                local obj_name=$(jq -r '.name // empty' "$file" 2>/dev/null)
                if [ ! -z "$obj_name" ]; then
                    echo "      Name: $obj_name"
                fi
            fi
        fi
    done
    echo ""
}

# List libraries
list_json_files "$STORAGE_DIR/libraries" "Libraries"

# List playlists
list_json_files "$STORAGE_DIR/playlists" "Playlists"

# List media metadata
list_json_files "$STORAGE_DIR/media/metadata" "Media Items"

# Media files info
echo -e "${GREEN}Media Files:${NC}"
if [ -d "$STORAGE_DIR/media/files" ]; then
    local media_count=$(find "$STORAGE_DIR/media/files" -type f 2>/dev/null | wc -l | tr -d ' ')
    local media_size=$(du -sh "$STORAGE_DIR/media/files" 2>/dev/null | cut -f1)
    echo "  $media_count file(s), Total size: $media_size"
else
    echo "  Directory not created yet"
fi
echo ""

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
echo "To open storage in Finder:"
echo "  open \"$STORAGE_DIR\""
echo ""
echo "To view a specific library:"
echo "  cat \"$STORAGE_DIR/libraries/<library-id>.json\" | jq"
echo ""

