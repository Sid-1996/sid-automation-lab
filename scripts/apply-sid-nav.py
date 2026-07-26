#!/usr/bin/env python3
"""Replace Weebly main.js/custom.js/mobile.js/plugins.js with sid-nav.js in 15 HTML files."""

import re
import os

ROOT = r'C:\Code play first\Sid Automation Lab'

FILES = [
    'index.html', 'about.html', 'automation-projects.html', 'contact.html',
    'other-tools.html', 'ocr-trigger-clicker.html',
    'aethergazer.html', 'aethergazersemiauto.html',
    'browndust2.html', 'browndust2-music-assist.html',
    'path-of-exile.html', 'sidrecoilscript.html',
    'sidpayfor.html', 'sidexiletoolbox.html', 'sidexilegametool.html',
]

# Each pattern is (regex, replacement)
PATTERNS = [
    # 1. main.js script tag (with or without defer)
    (
        re.compile(
            r'<script src="files/cdn_local/js/site/main\.js\?buildtime=1234"[^>]*></script>\n?'
        ),
        ''
    ),
    # 2. mobile.js script tag
    (
        re.compile(
            r'<script src="files/theme/files/mobile\.js"></script>\n?'
        ),
        ''
    ),
    # 3. custom.js script tag
    (
        re.compile(
            r'<script src="files/theme/files/custom\.js"></script>\n?'
        ),
        ''
    ),
    # 4. plugins.js script tag
    (
        re.compile(
            r'<script src="files/theme/files/plugins\.js"></script>\n?'
        ),
        ''
    ),
    # 5. First stl.js load (with or without defer)
    (
        re.compile(
            r'<script type="text/javascript" src="files/cdn_local/js/lang/zh_TW/stl\.js\?buildTime=1234&"[^>]*></script>\n?'
        ),
        ''
    ),
    # 6. initFlyouts() block (from <script type="text/javascript"><!-- to //--></script>)
    (
        re.compile(
            r'<script type="text/javascript"><!--\s*\n\s+function initFlyouts\(\)\{.*?//-->\s*\n\s*</script>\s*\n?',
            re.DOTALL
        ),
        ''
    ),
    # 7. Add sid-nav.js before </body>
    (
        re.compile(
            r'</body>'
        ),
        '<script src="files/sid-nav.js" defer></script>\n</body>'
    ),
]

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    for pattern, replacement in PATTERNS:
        content = pattern.sub(replacement, content)
    
    # Clean up triple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content == original:
        print(f'  [NO CHANGE] {os.path.basename(filepath)}')
        return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  [MODIFIED]  {os.path.basename(filepath)}')
    return True

def verify_fffd(filepath):
    with open(filepath, 'rb') as f:
        return b'\xef\xbf\xbd' not in f.read()

def main():
    modified = 0
    for fname in FILES:
        fpath = os.path.join(ROOT, fname)
        if not os.path.exists(fpath):
            print(f'  [SKIP] {fname} (not found)')
            continue
        if clean_file(fpath):
            modified += 1
        if not verify_fffd(fpath):
            print(f'  [FFFD ERROR] {fname}')
    
    print(f'\nDone. {modified}/{len(FILES)} files modified.')
    
    bad = [f for f in FILES if not verify_fffd(os.path.join(ROOT, f))]
    if bad:
        print(f'FFFD CORRUPTION in: {bad}')
    else:
        print('FFFD=0: ALL CLEAN')

if __name__ == '__main__':
    main()
