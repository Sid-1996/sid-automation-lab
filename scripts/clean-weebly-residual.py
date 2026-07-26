#!/usr/bin/env python3
"""Remove residual Weebly backend code from 15 HTML files (static GitHub Pages site)."""

import os
import re

ROOT = r'C:\Code play first\Sid Automation Lab'

FILES = [
    'index.html', 'about.html', 'automation-projects.html', 'contact.html',
    'other-tools.html', 'ocr-trigger-clicker.html',
    'aethergazer.html', 'aethergazersemiauto.html',
    'browndust2.html', 'browndust2-music-assist.html',
    'path-of-exile.html', 'sidrecoilscript.html',
    'sidpayfor.html', 'sidexiletoolbox.html', 'sidexilegametool.html',
]

# ── Pattern A: initCustomerAccountsModels() block ──
# Starts right after main.js </script>, ends at the next </script>
# The content includes _W.setup_rpc, _W.setup_model_rpc, event dispatch
PAT_A_START = (
    r'<script type="text/javascript">\s*\n'
    r'\s+function initCustomerAccountsModels\(\)\s*\{'
)
# Match everything up to the next </script>
PAT_A = re.compile(
    PAT_A_START + r'.*?</script>',
    re.DOTALL
)

# ── Pattern B: Store config globals (one contiguous block) ──
PAT_B = re.compile(
    r'<script type="text/javascript"> _W = _W \|\| \{\}; _W\.securePrefix=\'UNSET\'; </script>'
    r'<script>_W = _W \|\| \{\};\s*'
    r'(?:			)?_W\.customerLocale = "[^"]*";\s*'
    r'(?:			)?_W\.storeName = [^;]+;\s*'
    r'(?:			)?_W\.isCheckoutReskin = [^;]+;\s*'
    r'(?:			)?_W\.storeCountry = "[^"]*";\s*'
    r'(?:			)?_W\.storeCurrency = "[^"]*";\s*'
    r'(?:			)?_W\.storeEuPrivacyPolicyUrl = "[^"]*";\s*'
    r'(?:			)?com_currentSite = "[^"]*";\s*'
    r'(?:			)?com_userID = "[^"]*";</script>'
    r'<script type="text/javascript">_W\.configDomain = "";</script>'
    r'<script>_W\.relinquish && _W\.relinquish\(\)</script>'
)

# ── Pattern C: Second stl.js load + _W.themePlugins + _W.recaptchaUrl ──
# index.html has "defer" in stl tag, others don't
PAT_C = re.compile(
    r'<script type="text/javascript" src="files/cdn_local/js/lang/zh_TW/stl\.js\?buildTime=1234&"[^>]*></script>'
    r'<script> _W\.themePlugins = \[\];</script>'
    r'<script type="text/javascript"> _W\.recaptchaUrl = "https://www\.google\.com/recaptcha/api\.js"; </script>'
)

# ── Pattern D: var IS_ARCHIVE = 1; ──
# Can be followed by either \n\t\n or \n (depending on file)
PAT_D = re.compile(
    r'\tvar IS_ARCHIVE = 1;\n(?:\t\n)?'
)

# ── Pattern E: <div id="customer-accounts-app"></div> ──
PAT_E = re.compile(
    r'\s*<div id="customer-accounts-app"></div>\s*'
)

# ── Pattern F: GDPR script (sidpayfor.html) ──
PAT_F = re.compile(
    r'<script src="gdpr/gdprscript\.js\?buildTime=1234"></script>\n?'
)

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # A: Remove CustomerAccounts block
    content = PAT_A.sub('', content)
    
    # B: Remove store config globals
    content = PAT_B.sub('', content)
    
    # C: Remove second stl.js + themePlugins + recaptchaUrl
    content = PAT_C.sub('', content)
    
    # D: Remove var IS_ARCHIVE = 1;
    content = PAT_D.sub('', content)
    
    # E: Remove customer-accounts-app div
    content = PAT_E.sub('\n', content)
    
    # F: Remove GDPR script (only sidpayfor.html)
    content = PAT_F.sub('', content)
    
    # Clean up: remove double blank lines
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
        content = f.read()
    return b'\xef\xbf\xbd' not in content

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
            print(f'  [FFFD ERROR] {fname} contains U+FFFD!')
    
    print(f'\nDone. {modified}/{len(FILES)} files modified.')
    
    # Final FFFD sweep
    bad = [f for f in FILES if not verify_fffd(os.path.join(ROOT, f))]
    if bad:
        print(f'FFFD CORRUPTION in: {bad}')
    else:
        print('FFFD=0: ALL CLEAN')

if __name__ == '__main__':
    main()
