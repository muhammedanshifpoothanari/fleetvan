#!/usr/bin/env python3
"""
Script to systematically fix dark-only screens to support light/dark mode.
Run: python scripts/fix-dark-mode.py
"""

import os
import re
from pathlib import Path

# Color replacement mapping
REPLACEMENTS = [
    # General backgrounds
    ('className="bg-u100"', 'className="bg-background dark:bg-u100"'),
    ('className="bg-u200"', 'className="bg-muted dark:bg-u200"'),
    ('className="bg-u300"', 'className="bg-card dark:bg-u300"'),
    ('className="bg-u500"', 'className="bg-muted dark:bg-u500"'),
    
    # Text colors
    ('className="text-white"', 'className="text-foreground dark:text-white"'),
    ('className="text-u600"', 'className="text-muted-foreground dark:text-u600"'),
    ('className="text-u700"', 'className="text-muted-foreground dark:text-u700"'),
    ('className="text-u800"', 'className="text-foreground dark:text-u800"'),
    ('className="text-u500"', 'className="text-muted-foreground dark:text-u500"'),
    
    # Borders
    ('border-white/\\[0\\.07\\]', 'border-border dark:border-white/[0.07]'),
    ('border-white/10', 'border-border dark:border-white/10'),
    ('border-white/\\[0\\.05\\]', 'border-border dark:border-white/[0.05]'),
    
    # Specific components
    ('bg-white/5', 'bg-muted dark:bg-white/5'),
    ('bg-white/\\[0\\.07\\]', 'bg-muted dark:bg-white/[0.07]'),
    ('bg-white/10', 'bg-muted dark:bg-white/10'),
    ('text-white/70', 'text-foreground/70 dark:text-white/70'),
    
    # Green colors
    ('text-\\[#06c167\\](?!-)', 'text-ugreen dark:text-[#06c167]'),
    ('bg-\\[#06c167\\]/10', 'bg-ugreen/10 dark:bg-[#06c167]/10'),
    ('bg-\\[#06c167\\]/15', 'bg-ugreen/15 dark:bg-[#06c167]/15'),
    ('border-\\[#06c167\\]', 'border-ugreen dark:border-[#06c167]'),
    ('border-\\[#06c167\\]/30', 'border-ugreen/30 dark:border-[#06c167]/30'),
]

def fix_file(filepath):
    """Apply replacements to a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Apply replacements
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        
        # Only write if content changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Fix all screen files."""
    screens_dir = Path('/vercel/share/v0-project/components/screens')
    
    if not screens_dir.exists():
        print(f"Screens directory not found: {screens_dir}")
        return
    
    fixed_count = 0
    total_count = 0
    
    for tsx_file in screens_dir.glob('*.tsx'):
        total_count += 1
        if fix_file(tsx_file):
            fixed_count += 1
            print(f"✓ Fixed: {tsx_file.name}")
        else:
            print(f"  Skipped: {tsx_file.name}")
    
    print(f"\nCompleted: {fixed_count}/{total_count} files updated")

if __name__ == '__main__':
    main()
