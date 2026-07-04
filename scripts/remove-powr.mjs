// Robust powr-hit-counter remover using positional string search.
// Find the opening  <div id="N">  +  <style>  block before powr-hit-counter,
// then remove until the matching closing  </div></div></div>  AFTER the
// final </script>  belonging to setupElement...()  / runtime-script block.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function findPowrRange(html) {
  // Locate the powr-hit-counter element
  const counterRe = /<div class='powr-hit-counter'[^>]*><\/div>/g;
  let m;
  while ((m = counterRe.exec(html))) {
    const counterEnd = counterRe.lastIndex;
    // Look backward for the nearest <style ...></style> sibling
    const before = html.slice(Math.max(0, m.index - 2000), m.index);
    const styleOpen = before.lastIndexOf('<style');
    const styleClose = before.lastIndexOf('</style>');
    if (styleOpen === -1 || styleClose === -1 || styleClose < styleOpen) continue;
    const blockStart = Math.max(0, m.index - 2000) + styleOpen;
    // After counter, find follow-up  <script ...> element-script setup then </script>
    // then runtime-script and final </div></div></div>
    const after = html.slice(counterEnd);
    // Find FIRST </script></div></div></div> cluster following element-script
    const scriptClose = after.indexOf('</script>');
    if (scriptClose === -1) continue;
    const afterScript = after.slice(scriptClose + '</script>'.length);
    const runtimeRe = /<script type="text\/javascript" class="runtime-script">[\s\S]*?<\/script>/;
    const rm = runtimeRe.exec(afterScript);
    let regionEnd = counterEnd + scriptClose + '</script>'.length;
    if (rm) {
      regionEnd = counterEnd + scriptClose + '</script>'.length + rm.index + rm[0].length;
      const tail = html.slice(regionEnd);
      const closeTriple = tail.indexOf('</div>\n\t\t\t</div>\n\t\t</div>');
      if (closeTriple !== -1) {
        regionEnd += closeTriple + '</div>\n\t\t\t</div>\n\t\t</div>'.length;
      } else {
        // fallback: skip to next big closing
        regionEnd += tail.indexOf('</div>') + '</div>'.length;
      }
    }
    return [blockStart, regionEnd];
  }
  return null;
}

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    if (!raw.includes('powr-hit-counter')) continue;
    let out = raw;
    let safety = 0;
    while (out.includes('powr-hit-counter') && safety++ < 5) {
      const range = findPowrRange(out);
      if (!range) break;
      out = out.slice(0, range[0]) + out.slice(range[1]);
    }
    if (out !== raw) {
      await fs.writeFile(fp, out, 'utf8');
      touched++;
      console.log('cleaned ' + ent.name);
    }
  }
  console.log('done: ' + touched + ' file(s) cleaned');
}

run().catch(e => { console.error(e); process.exit(1); });
