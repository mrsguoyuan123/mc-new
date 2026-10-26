const fs = require('fs');
const vm = require('vm');

let source = fs.readFileSync(__dirname + '/frontApikit.js', 'utf8');
source = source.replace(/export async function/g, 'async function ');
source += '\nthis.api = { getPatientsByIdApi, postDictHospitalsApi, postAuthLoginApi, getFilesByDirByFilenameApi };';

const store = { token: 'abc' };
const requests = [];
const queue = [
  { statusCode: 200, data: '{"code":0,"data":{"id":9000000000000000001}}' }
];

const uni = {
  getStorageSync(key) { return store[key] || ''; },
  setStorageSync(key, value) { store[key] = value; },
  removeStorageSync(key) { delete store[key]; },
  request(config) {
    requests.push(config);
    setImmediate(function() { config.success(queue.shift()); });
    return {};
  },
  showToast() {},
  reLaunch() {}
};

const context = {
  uni,
  console,
  Promise,
  JSON,
  Object,
  Array,
  Number,
  String,
  Error,
  WeakSet,
  Math,
  setTimeout,
  encodeURIComponent
};

vm.createContext(context);
vm.runInContext(source, context);

(async function() {
  const result = await context.api.getPatientsByIdApi({ id: 'a/b', page: 2 });
  if (result.id !== '9000000000000000001') throw new Error('snowflake conversion failed');
  if (!requests[0].url.endsWith('/patients/a%2Fb?page=2')) throw new Error(requests[0].url);
  if (requests[0].header.Authorization !== 'Bearer abc') throw new Error('authorization failed');

  await context.api.postDictHospitalsApi({ name: 'x' });
  if (requests[1].data !== JSON.stringify({ name: 'x' })) throw new Error('body failed');

  await context.api.postAuthLoginApi({ username: 'u' });
  if (requests[2].header.Authorization) throw new Error('public endpoint carried token');

  const url = await context.api.getFilesByDirByFilenameApi({ dir: 'a/b', filename: 'x y.png' });
  if (url !== 'http://followup.ijunyuan.cn/api/v1/files/a/b/x%20y.png') throw new Error(url);

  console.log('ok');
})().catch(function(error) {
  console.error(error);
  process.exit(1);
});
