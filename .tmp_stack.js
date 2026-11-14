const fs = require('fs');
const s = fs.readFileSync('D:/项目/mc-vue2版/pages/index/caregiverOrder.vue', 'utf8').replace(/\r\n/g, '\n');
const start = s.indexOf('<template>');
const end = s.lastIndexOf('</template>');
const tpl = s.slice(start + 10, end);
const lines = tpl.split('\n');
const stack = [];
const tagRe = /<(\/?)(view|scroll-view|template|text|image|button)\b([^>]*)>/g;
lines.forEach((line, idx) => {
  let m;
  tagRe.lastIndex = 0;
  while ((m = tagRe.exec(line))) {
    const closing = m[1] === '/';
    const tag = m[2];
    const selfClose = /\/>\s*$/.test(m[3]);
    if (selfClose) continue;
    if (!closing) stack.push({ tag, line: idx + 1 });
    else {
      const top = stack.pop();
      if (!top || top.tag !== tag) console.log('MISMATCH close', tag, 'line', idx + 1, 'top=', top);
    }
  }
});
console.log('remaining:', JSON.stringify(stack));
