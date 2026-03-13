#!/usr/bin/env python3
"""
Systematic dark/light mode update script for all delivery app screens.
Maps hardcoded u-scale colors to design tokens with dark: prefix support.
"""

import re
import os

# Color mapping rules - convert u-scale to semantic tokens with dark: support
REPLACEMENTS = [
    # Background colors
    (r'bg-u100(?![\w-])', 'bg-background dark:bg-u100'),
    (r'bg-u200(?![\w-])', 'bg-muted dark:bg-u200'),
    (r'bg-u300(?![\w-])', 'bg-card dark:bg-u300'),
    (r'bg-u400(?![\w-])', 'bg-muted dark:bg-u400'),
    (r'bg-u500(?![\w-])', 'bg-border dark:bg-u500'),
    (r'bg-u600(?![\w-])', 'bg-muted dark:bg-u600'),
    (r'bg-u700(?![\w-])', 'bg-muted dark:bg-u700'),
    (r'bg-u800(?![\w-])', 'bg-muted dark:bg-u800'),
    (r'bg-u900(?![\w-])', 'bg-foreground dark:bg-u900'),
    
    # Text colors
    (r'text-u600(?![\w-])', 'text-muted-foreground dark:text-u600'),
    (r'text-u700(?![\w-])', 'text-muted-foreground dark:text-u700'),
    (r'text-u800(?![\w-])', 'text-foreground dark:text-u800'),
    (r'text-u900(?![\w-])', 'text-foreground dark:text-u900'),
    (r'text-white(?![\w-])', 'text-foreground dark:text-white'),
    
    # Border colors
    (r'border-u500(?![\w-])', 'border-border dark:border-u500'),
    (r'border-white/10(?![\w-])', 'border-border dark:border-white/10'),
    (r'border-white/\[0\.07\](?![\w-])', 'border-border dark:border-white/[0.07]'),
    (r'border-white/20(?![\w-])', 'border-border dark:border-white/20'),
    
    # Placeholder colors
    (r'placeholder-u600(?![\w-])', 'placeholder-muted-foreground dark:placeholder-u600'),
    (r'placeholder-white(?![\w-])', 'placeholder-foreground dark:placeholder-white'),
]

def update_file(filepath):
    """Update a single TSX file with dark/light mode support."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated: {filepath}")
            return True
        else:
            print(f"- No changes: {filepath}")
            return False
    except Exception as e:
        print(f"✗ Error: {filepath} - {e}")
        return False

def main():
    """Update all screen files."""
    screens_dir = "/vercel/share/v0-project/components/screens"
    
    if not os.path.exists(screens_dir):
        print(f"Error: {screens_dir} does not exist")
        return
    
    files = [f for f in os.listdir(screens_dir) if f.endswith('.tsx')]
    updated = 0
    
    print(f"Found {len(files)} screen files\n")
    
    for filename in sorted(files):
        filepath = os.path.join(screens_dir, filename)
        if update_file(filepath):
            updated += 1
    
    print(f"\n✓ Updated {updated}/{len(files)} files")

if __name__ == "__main__":
    main()
