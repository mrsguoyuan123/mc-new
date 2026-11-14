const fs = require('fs');
const p = 'D:/项目/mc-vue2版/pages.json';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const find = `		{
			"path": "pages/index/caregiverOrder",
			"style": {
			    "navigationBarTitleText": "服务详情",
			    "navigationBarBackgroundColor": "#ffffff"
			  }
		},`;
if (!s.includes(find)) { console.error('MISS pages block'); process.exit(1); }
const repl = `		{
			"path": "pages/index/caregiverOrder",
			"style": {
			    "navigationStyle": "custom",
			    "navigationBarTitleText": "陪诊服务详情",
			    "navigationBarBackgroundColor": "#ffffff"
			  }
		},`;
s = s.replace(find, repl);
fs.writeFileSync(p, s.replace(/\n/g, '\r\n'), 'utf8');
console.log('pages.json updated');
