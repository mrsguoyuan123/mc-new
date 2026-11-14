const fs = require('fs');
const p = 'D:/项目/mc-vue2版/pages/index/caregiverOrder.vue';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const reps = [
  ['\t\t<scroll-view scroll-y class="page-scroll">', '\t\t<view class="page-scroll">'],
  ['\t\t</scroll-view>', '\t\t</view>'],
  [`  .page-scroll {
    height: calc(100vh - 180rpx);
    box-sizing: border-box;
  }`, `  .page-scroll {
    box-sizing: border-box;
    padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
  }`]
];
reps.forEach((r, i) => {
  if (!s.includes(r[0])) { console.error('MISS ' + i); process.exit(1); }
  s = s.replace(r[0], r[1]);
});
fs.writeFileSync(p, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('scroll-view replaced OK');
