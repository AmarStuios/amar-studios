const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx?|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}
let fail = 0;
for (const f of walk('src')) {
  try {
    parser.parse(fs.readFileSync(f, 'utf8'), {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  } catch (e) {
    fail++;
    console.log('FAIL:', f.replace(/^.*\/src/, 'src'), '-', e.message);
  }
}
console.log(fail === 0 ? 'OK: all files parse.' : `${fail} file(s) failed`);
