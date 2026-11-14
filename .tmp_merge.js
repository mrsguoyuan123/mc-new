const fs = require('fs');
const dir = 'D:/项目/mc-vue2版/';
const parts = ['.tmp_co_p1.txt', '.tmp_co_p2.txt', '.tmp_co_p3.txt', '.tmp_co_p4.txt'];
let out = '';
parts.forEach(name => {
  let s = fs.readFileSync(dir + name, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  out += s;
});
// 行首每 2 空格转 1 个 Tab，匹配项目 Tab 缩进
out = out.replace(/\n([ ]+)/g, (m, spaces) => '\n' + '\t'.repeat(spaces.length / 2));
if (/^[ ]+/m.test(out)) { console.error('STILL SPACES'); process.exit(1); }
fs.writeFileSync(dir + 'pages/index/caregiverOrder.vue', out.replace(/\n/g, '\r\n'), 'utf8');
console.log('written lines', out.split('\n').length);
