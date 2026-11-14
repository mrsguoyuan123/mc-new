const fs = require('fs');
const s = fs.readFileSync('D:/项目/mc-vue2版/pages/index/caregiverOrder.vue', 'utf8').replace(/\r\n/g, '\n');
const m = s.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('NO SCRIPT'); process.exit(1); }
fs.writeFileSync('D:/项目/mc-vue2版/.tmp_script_check.mjs', m[1].replace(/^\uFEFF/, ''), 'utf8');
const tpl = s.match(/<template>([\s\S]*?)<\/template>/)[1];
const open = (tpl.match(/<view\b/g) || []).length;
const close = (tpl.match(/<\/view>/g) || []).length;
console.log('view open', open, 'close', close);
['<scroll-view', '</scroll-view>', '<image', '</image>', '<button', '</button>'].forEach(k => console.log(k, (tpl.split(k).length - 1)));
