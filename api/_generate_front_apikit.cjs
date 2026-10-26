const fs = require('fs');
const path = require('path');

const root = __dirname;
const swagger = JSON.parse(fs.readFileSync(path.join(root, 'swagger.json'), 'utf8'));
let source = fs.readFileSync(path.join(root, 'frontApikit.js'), 'utf8');

const methods = ['get', 'post', 'put', 'delete', 'patch'];

const excluded = {
  get: new Set(['/me/health-manager', '/me/health-records', '/patients/{id}/health-records']),
  post: new Set(['/me/health-records', '/conversations/{id}/evaluation']),
  put: new Set(['/me/medication/reminder', '/escort/config'])
};

const publicOps = new Set([
  'POST /auth/login',
  'POST /auth/register',
  'POST /auth/sms-code',
  'POST /auth/sms-login',
  'POST /auth/wx-login',
  'POST /auth/refresh',
  'GET /auth/dev-tokens',
  'GET /app/banners',
  'GET /app/articles',
  'GET /app/informed-consents'
]);

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pascal(value) {
  return value.split(/[-_]/).filter(Boolean).map(capitalize).join('');
}

function functionName(method, routePath) {
  let name = method.toLowerCase();
  routePath.replace(/^\//, '').split('/').forEach((segment) => {
    if (segment.startsWith('{') && segment.endsWith('}')) {
      name += 'By' + pascal(segment.slice(1, -1));
    } else {
      name += pascal(segment);
    }
  });
  return name + 'Api';
}

function js(value) {
  return JSON.stringify(value);
}

function replaceFunction(text, name, nextFunction) {
  const start = text.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Missing function ' + name);
  const next = text.indexOf('\nfunction ', start + 1);
  if (next < 0) throw new Error('Missing next function after ' + name);
  return text.slice(0, start) + nextFunction + text.slice(next + 1);
}

function insertBeforeFunction(text, name, content) {
  const index = text.indexOf('function ' + name + '(');
  if (text.includes(content.trim())) return text;
  if (index < 0) throw new Error('Missing function ' + name);
  return text.slice(0, index) + content + text.slice(index);
}

function replaceOnce(text, search, replacement) {
  if (text.includes(replacement)) return text;
  if (!text.includes(search)) throw new Error('Missing search text');
  return text.replace(search, replacement);
}

function replaceRange(text, startMarker, endMarker, replacement) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error('Missing marker ' + startMarker);
  const end = text.indexOf(endMarker, start);
  if (end < 0) throw new Error('Missing marker ' + endMarker);
  return text.slice(0, start) + replacement + text.slice(end);
}

source = source.replace(/\n\s*enableHttp2:\s*true,?\n/, '\n');
source = source.replace(/\s*enableQuic:\s*true,?\n/, '\n');
source = replaceOnce(source, /data: config\.data,?/, "data: config.data === undefined ? undefined : JSON.stringify(config.data),");
source = replaceOnce(source, 'return encodeURIComponent(String(value));', 'return encodePathSegment(value);');
source = insertBeforeFunction(source, 'buildUrl', `function encodePathSegment(value) {
  return String(value).split('/').map(encodeURIComponent).join('/');
}

`);
source = replaceRange(
  source,
  "} catch (error) {\n          reject(createApiError(response.statusCode,",
  "        }\n        resolve({ statusCode: response.statusCode, body: body, headers: response.header || {} });\n",
  "} catch (error) {\n          showError('响应解析失败');\n          reject(createApiError(response.statusCode, '响应解析失败', response.data));\n          return;\n        }\n        resolve({ statusCode: response.statusCode, body: body, headers: response.header || {} });"
);
source = replaceOnce(
  source,
  "if (data.user) uni.setStorageSync(USER_INFO_KEY, data.user);",
  "const userInfo = data.userInfo || data.user || null;\n  if (userInfo) uni.setStorageSync(USER_INFO_KEY, userInfo);"
);
source = replaceOnce(
  source,
  "if (config.url === '/auth/login' || config.url === '/auth/register' ||\n        config.url === '/auth/sms-login' || config.url === '/auth/wx-login') {",
  "if (config.url === '/auth/login' || config.url === '/auth/register' ||\n        config.url === '/auth/sms-login' || config.url === '/auth/wx-login' || config.url === '/auth/refresh') {"
);

source = replaceFunction(source, 'buildPublicFileUrl', `function buildPublicFileUrl(params) {
  params = params || {};
  const dir = params.dir;
  const filename = params.filename;
  if (dir === undefined || dir === null || dir === '' || filename === undefined || filename === null || filename === '') {
    throw createApiError(400, '文件路径不完整');
  }
  const dirPath = Array.isArray(dir)
    ? dir.map(function(item) { return encodePathSegment(item); }).join('/')
    : encodePathSegment(dir);
  return BASE_URL + '/files/' + dirPath + '/' + encodeURIComponent(filename);
}
`);

source = replaceFunction(source, 'refreshAccessToken', `function refreshAccessToken() {
  if (refreshTokenPromise) return refreshTokenPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    redirectToLogin();
    return Promise.reject(createApiError(402, '登录已过期，请重新登录'));
  }

  const promise = rawRequest({
    url: '/auth/refresh',
    method: 'POST',
    params: { refreshToken: refreshToken },
    auth: false
  }).then(function(response) {
    const body = response.body || {};
    if (body.code === 0 && body.data) {
      saveAuthPayload(body.data);
      return body.data;
    }

    const message = body.message || '登录状态刷新失败';
    if (body.code === 402) {
      clearAuth();
      redirectToLogin();
    } else {
      showError(message);
    }
    throw createApiError(body.code, message, body.data);
  });

  refreshTokenPromise = promise;
  promise.then(function() { refreshTokenPromise = null; }, function() { refreshTokenPromise = null; });
  return promise;
}
`);

const uploadHelpers = `function omit(source, keys) {
  const result = {};
  Object.keys(source || {}).forEach(function(key) {
    if (keys.indexOf(key) === -1) result[key] = source[key];
  });
  return result;
}

function callApi(method, routePath, params, options) {
  params = params || {};
  options = options || {};
  const pathNames = options.pathNames || [];
  const queryNames = options.queryNames || [];
  const pathParams = {};
  const queryParams = {};
  let data;

  pathNames.forEach(function(name) {
    if (Object.prototype.hasOwnProperty.call(params, name)) pathParams[name] = params[name];
  });

  if (method === 'GET') {
    Object.keys(params).forEach(function(name) {
      if (pathNames.indexOf(name) === -1) queryParams[name] = params[name];
    });
  } else {
    queryNames.forEach(function(name) {
      if (Object.prototype.hasOwnProperty.call(params, name)) queryParams[name] = params[name];
    });

    if (Object.prototype.hasOwnProperty.call(params, 'data')) {
      data = params.data;
    } else if (Object.prototype.hasOwnProperty.call(params, 'body')) {
      data = params.body;
    } else if (options.hasBody) {
      data = omit(params, pathNames.concat(queryNames));
    }
  }

  return requestApi({
    url: routePath,
    method: method,
    pathParams: pathParams,
    params: queryParams,
    data: data,
    auth: options.auth !== false
  }).then(function(result) {
    if (options.clearAuth) clearAuth();
    return result;
  });
}

function sendUploadFile(config) {
  return new Promise(function(resolve, reject) {
    const formData = Object.assign({}, config.formData || {});
    if (config.dir !== undefined && config.dir !== null && config.dir !== '') {
      formData.dir = config.dir;
    }

    uni.uploadFile({
      url: buildUrl(config),
      filePath: config.filePath,
      name: config.name || 'file',
      formData: formData,
      timeout: config.timeout || 60000,
      header: buildHeaders(config, true),
      success: function(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          showError('上传失败，请稍后重试');
          reject(createApiError(response.statusCode, '上传失败，请稍后重试', response.data));
          return;
        }

        let body;
        try {
          body = parseResponse(response.data);
        } catch (error) {
          showError('响应解析失败');
          reject(createApiError(response.statusCode, '响应解析失败', response.data));
          return;
        }

        if (typeof body === 'string') {
          resolve(body);
          return;
        }
        if (!isPlainObject(body) || body.code === undefined) {
          resolve(body);
          return;
        }
        if (body.code === 0) {
          resolve(body.data);
          return;
        }
        if (body.code === 401 && !config.retried) {
          refreshAccessToken().then(function() {
            sendUploadFile(Object.assign({}, config, { retried: true })).then(resolve, reject);
          }, reject);
          return;
        }
        if (body.code === 402 || (body.code === 401 && config.retried)) {
          clearAuth();
          redirectToLogin();
          reject(createApiError(402, body.message || '登录已过期，请重新登录', body.data));
          return;
        }
        if (body.code === 403) {
          showError(body.message || '无权限');
          reject(createApiError(403, body.message || '无权限', body.data));
          return;
        }

        showError(body.message || '上传失败，请稍后重试');
        reject(createApiError(body.code, body.message || '上传失败，请稍后重试', body.data));
      },
      fail: function(error) {
        showError('上传失败，请稍后重试');
        reject(createApiError(-1, (error && error.errMsg) || '上传失败，请稍后重试'));
      }
    });
  });
}

function uploadSingleFile(params) {
  params = params || {};
  return sendUploadFile({
    url: '/files/upload',
    filePath: params.filePath,
    name: params.name || 'file',
    dir: params.dir,
    formData: params.formData,
    timeout: params.timeout,
    headers: params.headers,
    auth: true
  });
}

function uploadMultipleFiles(params) {
  params = params || {};
  const files = params.files || [];
  if (!Array.isArray(files) || !files.length) {
    return Promise.reject(createApiError(400, '请选择要上传的文件'));
  }

  return Promise.all(files.map(function(file) {
    const item = typeof file === 'string' ? { filePath: file } : file;
    return sendUploadFile({
      url: '/files/uploads',
      filePath: item.filePath,
      name: item.name || 'files',
      dir: item.dir !== undefined ? item.dir : params.dir,
      formData: Object.assign({}, params.formData || {}, item.formData || {}),
      timeout: item.timeout || params.timeout,
      headers: item.headers || params.headers,
      auth: true
    });
  }));
}

`;

const firstExport = source.search(/^export\s+async\s+function\s+/m);
if (firstExport < 0) throw new Error('No exported API function found');
let prefix = source.slice(0, firstExport);
const uploadStart = prefix.indexOf('function handleUploadResponse(');
const generatedMarker = prefix.indexOf('function omit(');
if (uploadStart >= 0) {
  prefix = prefix.slice(0, uploadStart) + uploadHelpers;
} else if (generatedMarker < 0) {
  prefix += uploadHelpers;
}

const lines = [];
let operationCount = 0;

Object.keys(swagger.paths).forEach((routePath) => {
  const route = swagger.paths[routePath];
  methods.forEach((method) => {
    const op = route[method];
    if (!op) return;
    if (excluded[method] && excluded[method].has(routePath)) return;
    if (routePath === '/files/upload' || routePath === '/files/uploads' || routePath === '/files/{dir}/{filename}') return;

    const parameters = op.parameters || [];
    const pathNames = parameters.filter((item) => item.in === 'path').map((item) => item.name);
    const queryNames = parameters.filter((item) => item.in === 'query').map((item) => item.name);
    const hasBody = parameters.some((item) => item.in === 'body');
    const auth = !publicOps.has(method.toUpperCase() + ' ' + routePath);
    const clearAuth = routePath === '/auth/logout';
    const name = functionName(method, routePath);
    const options = { pathNames, queryNames, hasBody, auth, clearAuth };

    lines.push(
      'export async function ' + name + '(params = {}) { return callApi(' +
      js(method.toUpperCase()) + ', ' + js(routePath) + ', params, ' + js(options) + '); }'
    );
    operationCount += 1;
  });
});

lines.push('export async function postFilesUploadApi(params = {}) { return uploadSingleFile(params); }');
lines.push('export async function postFilesUploadsApi(params = {}) { return uploadMultipleFiles(params); }');
lines.push('export async function getFilesByDirByFilenameApi(params = {}) { return Promise.resolve(buildPublicFileUrl(params)); }');

const output = prefix + lines.join('\n') + '\n';
fs.writeFileSync(path.join(root, 'frontApikit.js'), output, 'utf8');
console.log(JSON.stringify({ operations: operationCount, exports: operationCount + 3 }));
