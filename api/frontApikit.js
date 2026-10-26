const BASE_URL = 'http://followup.ijunyuan.cn/api/v1';
const LOGIN_PAGE_URL = '/pages/index/login';
const ACCESS_TOKEN_KEY = 'accessToken';
const LEGACY_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

let refreshTokenPromise = null;
let redirecting = false;

function getAccessToken() {
  return uni.getStorageSync(ACCESS_TOKEN_KEY) || uni.getStorageSync(LEGACY_TOKEN_KEY) || '';
}

function getRefreshToken() {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || '';
}

function saveAuthPayload(data) {
  if (!data) return;
  const accessToken = data.accessToken || data.token || '';
  const refreshToken = data.refreshToken || '';
  if (accessToken) {
    uni.setStorageSync(ACCESS_TOKEN_KEY, accessToken);
    uni.setStorageSync(LEGACY_TOKEN_KEY, accessToken);
  }
  if (refreshToken) uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken);
  const userInfo = data.userInfo || data.user || null;
  if (userInfo) uni.setStorageSync(USER_INFO_KEY, userInfo);
}

function clearAuth() {
  uni.removeStorageSync(ACCESS_TOKEN_KEY);
  uni.removeStorageSync(LEGACY_TOKEN_KEY);
  uni.removeStorageSync(REFRESH_TOKEN_KEY);
  uni.removeStorageSync(USER_INFO_KEY);
}

function redirectToLogin() {
  if (redirecting) return;
  redirecting = true;
  uni.reLaunch({
    url: LOGIN_PAGE_URL,
    complete: function() {
      setTimeout(function() {
        redirecting = false;
      }, 300);
    }
  });
}

function showError(message) {
  uni.showToast({
    title: message || '服务异常，请稍后重试',
    icon: 'none',
    duration: 2500
  });
}

function createApiError(code, message, data) {
  const error = new Error(message || '请求失败');
  error.isApiError = true;
  error.code = code;
  error.data = data;
  return error;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function stringifyLongIds(value, seen) {
  seen = seen || new WeakSet();
  if (Array.isArray(value)) {
    value.forEach(function(item, index) {
      value[index] = stringifyLongIds(item, seen);
    });
    return value;
  }
  if (isPlainObject(value)) {
    if (seen.has(value)) return value;
    seen.add(value);
    Object.keys(value).forEach(function(key) {
      value[key] = stringifyLongIds(value[key], seen);
    });
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    return String(value);
  }
  return value;
}

function quoteRawLongNumbers(text) {
  let output = '';
  let token = '';
  let inString = false;
  let escaped = false;
  let lastChar = '';

  function flushNumber() {
    if (/^-?\d{16,}$/.test(token) && !Number.isSafeInteger(Number(token))) {
      output += '"' + token + '"';
    } else {
      output += token;
    }
    token = '';
  }

  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charAt(i);

    if (inString) {
      output += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      flushNumber();
      inString = true;
      output += ch;
      lastChar = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      flushNumber();
      output += ch;
      continue;
    }

    if (ch === '-' || /[0-9]/.test(ch)) {
      if (!token && (!lastChar || lastChar === ':' || lastChar === '[' || lastChar === ',')) {
        token = ch;
      } else if (token) {
        token += ch;
      } else {
        output += ch;
      }
      lastChar = ch;
      continue;
    }

    if (token && (ch === '.' || ch === 'e' || ch === 'E' || ch === '+')) {
      token += ch;
      lastChar = ch;
      continue;
    }

    flushNumber();
    output += ch;
    lastChar = ch;
  }

  flushNumber();
  return output;
}

function parseResponse(rawData) {
  if (rawData === undefined || rawData === null || rawData === '') return null;
  if (typeof rawData === 'object') return stringifyLongIds(rawData);
  if (typeof rawData !== 'string') return rawData;
  return stringifyLongIds(JSON.parse(quoteRawLongNumbers(rawData)));
}

function appendQueryValue(parts, key, value) {
  if (value === undefined || value === null || value === '') return;
  if (Array.isArray(value)) {
    value.forEach(function(item) {
      appendQueryValue(parts, key, item);
    });
    return;
  }
  if (isPlainObject(value)) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(value)));
    return;
  }
  parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
}

function encodePathSegment(value) {
  return String(value).split('/').map(encodeURIComponent).join('/');
}

function buildUrl(config) {
  let url = BASE_URL + config.url;
  const pathParams = config.pathParams || {};
  url = url.replace(/\{([^}]+)\}/g, function(_, key) {
    const value = pathParams[key];
    if (value === undefined || value === null || value === '') {
      throw createApiError(400, '缺少路径参数：' + key);
    }
    return encodeURIComponent(String(value));
  });

  const query = config.params || {};
  const parts = [];
  Object.keys(query).forEach(function(key) {
    if (Object.prototype.hasOwnProperty.call(pathParams, key)) return;
    appendQueryValue(parts, key, query[key]);
  });

  if (parts.length) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
  }
  return url;
}

function buildHeaders(config, isUpload) {
  const headers = Object.assign({}, config.headers || {});
  if (config.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = 'Bearer ' + token;
  }
  if (!isUpload && config.data && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

function buildPublicFileUrl(params) {
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
function rawRequest(config) {
  return new Promise(function(resolve, reject) {
    let requestTask;
    requestTask = uni.request({
      url: buildUrl(config),
      method: (config.method || 'GET').toUpperCase(),
      data: config.data === undefined ? undefined : JSON.stringify(config.data),
      timeout: config.timeout || 30000,
      header: buildHeaders(config, false),
      dataType: 'text',
      success: function(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          showError('网络请求失败');
          reject(createApiError(response.statusCode, '网络请求失败', response.data));
          return;
        }
        let body = null;
        try {
          body = parseResponse(response.data);
        } catch (error) {
          showError('响应解析失败');
          reject(createApiError(response.statusCode, '响应解析失败', response.data));
          return;
        }
        resolve({ statusCode: response.statusCode, body: body, headers: response.header || {} });
      },
      fail: function(error) {
        showError('网络异常，请稍后重试');
        reject(createApiError(-1, (error && error.errMsg) || '网络异常'));
      }
    });
    return requestTask;
  });
}

function refreshAccessToken() {
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
function requestApi(config) {
  return rawRequest(config).then(function(response) {
    const body = response.body || {};
    const code = body.code;

    if (code === 0) {
      if (config.url === '/auth/login' || config.url === '/auth/register' ||
        config.url === '/auth/sms-login' || config.url === '/auth/wx-login' || config.url === '/auth/refresh') {
        saveAuthPayload(body.data);
      }
      return body.data;
    }

    if (code === 401 && !config.retried) {
      return refreshAccessToken().then(function() {
        return requestApi(Object.assign({}, config, { retried: true }));
      });
    }

    if (code === 402 || (code === 401 && config.retried)) {
      clearAuth();
      redirectToLogin();
      throw createApiError(402, body.message || '登录已过期，请重新登录', body.data);
    }

    if (code === 403) {
      showError(body.message || '无权限');
      throw createApiError(403, body.message || '无权限', body.data);
    }

    if (code === 400 || code === 500) {
      const message = body.message || (code === 400 ? '请求参数错误' : '服务异常，请稍后重试');
      showError(message);
      throw createApiError(code, message, body.data);
    }

    showError(body.message || '请求失败');
    throw createApiError(code, body.message || '请求失败', body.data);
  });
}

function omit(source, keys) {
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

/**
 * @name 员工账号密码登录（PC后台/手机端客服陪诊师医生医院管理）
 * @method POST
 * @url /auth/login
 * @desc 返回 access token(2h) + refresh token(7d)。允许多设备登录。
 * @param {Object} params 请求参数
 */
export async function postAuthLoginApi(params = {}) { return callApi("POST", "/auth/login", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":false,"clearAuth":false}); }
/**
 * @name 患者注册（手机号验证码，仅患者可自助注册）
 * @method POST
 * @url /auth/register
 * @desc 手术名称/主治医生为服务层必填校验；身份证选填。
 * @param {Object} params 请求参数
 */
export async function postAuthRegisterApi(params = {}) { return callApi("POST", "/auth/register", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":false,"clearAuth":false}); }
/**
 * @name 发送短信验证码（60秒限频）
 * @method POST
 * @url /auth/sms-code
 * @desc 入参仅 phone（代码未实现 scene 字段）。
 * @param {Object} params 请求参数
 */
export async function postAuthSmsCodeApi(params = {}) { return callApi("POST", "/auth/sms-code", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":false,"clearAuth":false}); }
/**
 * @name 患者手机号验证码登录
 * @method POST
 * @url /auth/sms-login
 * @desc 患者手机号验证码登录
 * @param {Object} params 请求参数
 */
export async function postAuthSmsLoginApi(params = {}) { return callApi("POST", "/auth/sms-login", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":false,"clearAuth":false}); }
/**
 * @name 微信一键登录（患者）
 * @method POST
 * @url /auth/wx-login
 * @desc 服务端 code2session 换 openid：已绑定患者直接返回 token；新用户返回 needRegister=true + bindToken，注册时把 bindToken 带回 /auth/register 完成 openid 绑定（30 分钟有效，一次性）。
 * @param {Object} params 请求参数
 */
export async function postAuthWxLoginApi(params = {}) { return callApi("POST", "/auth/wx-login", params, {"pathNames":[],"queryNames":["code"],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 刷新令牌
 * @method POST
 * @url /auth/refresh
 * @desc 刷新令牌
 * @param {Object} params 请求参数
 */
export async function postAuthRefreshApi(params = {}) { return callApi("POST", "/auth/refresh", params, {"pathNames":[],"queryNames":["refreshToken"],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 登出（注销 refresh token；需携带 access token）
 * @method POST
 * @url /auth/logout
 * @desc SecurityConfig 未将 /auth/logout 列入公开白名单，调用需有效 access token。
 * @param {Object} params 请求参数
 */
export async function postAuthLogoutApi(params = {}) { return callApi("POST", "/auth/logout", params, {"pathNames":[],"queryNames":["refreshToken"],"hasBody":false,"auth":true,"clearAuth":true}); }
/**
 * @name 当前登录用户（角色/数据范围）
 * @method GET
 * @url /auth/me
 * @desc 当前登录用户（角色/数据范围）
 * @param {Object} params 请求参数
 */
export async function getAuthMeApi(params = {}) { return callApi("GET", "/auth/me", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name dev 免登静态 token（仅 dev profile 生效，生产 404）
 * @method GET
 * @url /auth/dev-tokens
 * @desc key 为 admin/hospital/cs/station/doctor/patient（station 为历史 key，角色已是 CAREGIVER）。直接放 Authorization: Bearer 使用；WebSocket 同样可用。userId 910001~910006，数据范围联调需配合种子数据。
 * @param {Object} params 请求参数
 */
export async function getAuthDevTokensApi(params = {}) { return callApi("GET", "/auth/dev-tokens", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 修改自己的密码（员工/患者共用）
 * @method PUT
 * @url /auth/password
 * @desc 已有密码时必须校验原密码；患者首次设置账密可省略 oldPassword。
 * @param {Object} params 请求参数
 */
export async function putAuthPasswordApi(params = {}) { return callApi("PUT", "/auth/password", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 系统设定（骨架占位）
 * @method GET
 * @url /me/settings
 * @desc 系统设定（骨架占位）
 * @param {Object} params 请求参数
 */
export async function getMeSettingsApi(params = {}) { return callApi("GET", "/me/settings", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 更新系统设定（骨架占位）
 * @method PUT
 * @url /me/settings
 * @desc 更新系统设定（骨架占位）
 * @param {Object} params 请求参数
 */
export async function putMeSettingsApi(params = {}) { return callApi("PUT", "/me/settings", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 登录日志（公司管理）
 * @method GET
 * @url /accounts/login-logs
 * @desc 登录日志（公司管理）
 * @param {Object} params 请求参数
 */
export async function getAccountsLoginLogsApi(params = {}) { return callApi("GET", "/accounts/login-logs", params, {"pathNames":[],"queryNames":["page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 操作日志（公司管理）
 * @method GET
 * @url /accounts/operation-logs
 * @desc 操作日志（公司管理）
 * @param {Object} params 请求参数
 */
export async function getAccountsOperationLogsApi(params = {}) { return callApi("GET", "/accounts/operation-logs", params, {"pathNames":[],"queryNames":["page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 安全选项（骨架占位）
 * @method PUT
 * @url /accounts/security
 * @desc 安全选项（骨架占位）
 * @param {Object} params 请求参数
 */
export async function putAccountsSecurityApi(params = {}) { return callApi("PUT", "/accounts/security", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 医院字典列表
 * @method GET
 * @url /dict/hospitals
 * @desc 医院字典列表
 * @param {Object} params 请求参数
 */
export async function getDictHospitalsApi(params = {}) { return callApi("GET", "/dict/hospitals", params, {"pathNames":[],"queryNames":["keyword","level","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增医院（公司管理）
 * @method POST
 * @url /dict/hospitals
 * @desc 新增医院（公司管理）
 * @param {Object} params 请求参数
 */
export async function postDictHospitalsApi(params = {}) { return callApi("POST", "/dict/hospitals", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改医院（公司管理）
 * @method PUT
 * @url /dict/hospitals/{id}
 * @desc 修改医院（公司管理）
 * @param {Object} params 请求参数
 */
export async function putDictHospitalsByIdApi(params = {}) { return callApi("PUT", "/dict/hospitals/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除医院（公司管理）
 * @method DELETE
 * @url /dict/hospitals/{id}
 * @desc 删除医院（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteDictHospitalsByIdApi(params = {}) { return callApi("DELETE", "/dict/hospitals/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 院区列表
 * @method GET
 * @url /dict/areas
 * @desc 院区列表
 * @param {Object} params 请求参数
 */
export async function getDictAreasApi(params = {}) { return callApi("GET", "/dict/areas", params, {"pathNames":[],"queryNames":["hospitalId"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增院区（公司管理）
 * @method POST
 * @url /dict/areas
 * @desc 新增院区（公司管理）
 * @param {Object} params 请求参数
 */
export async function postDictAreasApi(params = {}) { return callApi("POST", "/dict/areas", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改院区（公司管理）
 * @method PUT
 * @url /dict/areas/{id}
 * @desc 修改院区（公司管理）
 * @param {Object} params 请求参数
 */
export async function putDictAreasByIdApi(params = {}) { return callApi("PUT", "/dict/areas/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除院区（公司管理）
 * @method DELETE
 * @url /dict/areas/{id}
 * @desc 删除院区（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteDictAreasByIdApi(params = {}) { return callApi("DELETE", "/dict/areas/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 科室列表
 * @method GET
 * @url /dict/departments
 * @desc 科室列表
 * @param {Object} params 请求参数
 */
export async function getDictDepartmentsApi(params = {}) { return callApi("GET", "/dict/departments", params, {"pathNames":[],"queryNames":["hospitalId","areaId"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增科室（公司管理）
 * @method POST
 * @url /dict/departments
 * @desc 新增科室（公司管理）
 * @param {Object} params 请求参数
 */
export async function postDictDepartmentsApi(params = {}) { return callApi("POST", "/dict/departments", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改科室（公司管理）
 * @method PUT
 * @url /dict/departments/{id}
 * @desc 修改科室（公司管理）
 * @param {Object} params 请求参数
 */
export async function putDictDepartmentsByIdApi(params = {}) { return callApi("PUT", "/dict/departments/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除科室（公司管理）
 * @method DELETE
 * @url /dict/departments/{id}
 * @desc 删除科室（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteDictDepartmentsByIdApi(params = {}) { return callApi("DELETE", "/dict/departments/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 医生库列表（字典，无账号）
 * @method GET
 * @url /dict/doctors
 * @desc 医生库列表（字典，无账号）
 * @param {Object} params 请求参数
 */
export async function getDictDoctorsApi(params = {}) { return callApi("GET", "/dict/doctors", params, {"pathNames":[],"queryNames":["hospitalId","departmentId","keyword","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增医生（公司管理）
 * @method POST
 * @url /dict/doctors
 * @desc 新增医生（公司管理）
 * @param {Object} params 请求参数
 */
export async function postDictDoctorsApi(params = {}) { return callApi("POST", "/dict/doctors", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改医生（公司管理）
 * @method PUT
 * @url /dict/doctors/{id}
 * @desc 修改医生（公司管理）
 * @param {Object} params 请求参数
 */
export async function putDictDoctorsByIdApi(params = {}) { return callApi("PUT", "/dict/doctors/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除医生（公司管理）
 * @method DELETE
 * @url /dict/doctors/{id}
 * @desc 删除医生（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteDictDoctorsByIdApi(params = {}) { return callApi("DELETE", "/dict/doctors/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者标签列表（动态枚举）
 * @method GET
 * @url /dict/tags
 * @desc 患者标签列表（动态枚举）
 * @param {Object} params 请求参数
 */
export async function getDictTagsApi(params = {}) { return callApi("GET", "/dict/tags", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增标签（公司管理）
 * @method POST
 * @url /dict/tags
 * @desc 新增标签（公司管理）
 * @param {Object} params 请求参数
 */
export async function postDictTagsApi(params = {}) { return callApi("POST", "/dict/tags", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改标签（公司管理）
 * @method PUT
 * @url /dict/tags/{id}
 * @desc 修改标签（公司管理）
 * @param {Object} params 请求参数
 */
export async function putDictTagsByIdApi(params = {}) { return callApi("PUT", "/dict/tags/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除标签（公司管理）
 * @method DELETE
 * @url /dict/tags/{id}
 * @desc 删除标签（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteDictTagsByIdApi(params = {}) { return callApi("DELETE", "/dict/tags/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 级联下拉包（医院/院区/科室/医生/标签一次性拉取）
 * @method GET
 * @url /dict/options
 * @desc 级联下拉包（医院/院区/科室/医生/标签一次性拉取）
 * @param {Object} params 请求参数
 */
export async function getDictOptionsApi(params = {}) { return callApi("GET", "/dict/options", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者列表（时间倒序+姓名/手机号搜索；按数据范围过滤）
 * @method GET
 * @url /patients
 * @desc 医院管理=医院/科室权限；客服/陪诊师=数据范围患者；医生=本人主治/主管患者。
 * @param {Object} params 请求参数
 */
export async function getPatientsApi(params = {}) { return callApi("GET", "/patients", params, {"pathNames":[],"queryNames":["keyword","hospitalId","departmentId","healthStatus","tag","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增患者（公司管理）
 * @method POST
 * @url /patients
 * @desc 新增患者（公司管理）
 * @param {Object} params 请求参数
 */
export async function postPatientsApi(params = {}) { return callApi("POST", "/patients", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者详情
 * @method GET
 * @url /patients/{id}
 * @desc 患者详情
 * @param {Object} params 请求参数
 */
export async function getPatientsByIdApi(params = {}) { return callApi("GET", "/patients/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 修改患者（公司管理）
 * @method PUT
 * @url /patients/{id}
 * @desc 修改患者（公司管理）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdApi(params = {}) { return callApi("PUT", "/patients/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除患者（公司管理）
 * @method DELETE
 * @url /patients/{id}
 * @desc 删除患者（公司管理）
 * @param {Object} params 请求参数
 */
export async function deletePatientsByIdApi(params = {}) { return callApi("DELETE", "/patients/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者病历（附件1样表结构）
 * @method GET
 * @url /patients/{id}/medical-record
 * @desc 患者病历（附件1样表结构）
 * @param {Object} params 请求参数
 */
export async function getPatientsByIdMedicalRecordApi(params = {}) { return callApi("GET", "/patients/{id}/medical-record", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 维护病历（公司管理/医院管理）
 * @method PUT
 * @url /patients/{id}/medical-record
 * @desc 维护病历（公司管理/医院管理）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdMedicalRecordApi(params = {}) { return callApi("PUT", "/patients/{id}/medical-record", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 匹配客服/陪诊师（PC端配置）
 * @method PUT
 * @url /patients/{id}/match
 * @desc 匹配客服/陪诊师（PC端配置）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdMatchApi(params = {}) { return callApi("PUT", "/patients/{id}/match", params, {"pathNames":["id"],"queryNames":["csId","stationId"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者标签（动态枚举，前端维护）
 * @method PUT
 * @url /patients/{id}/tags
 * @desc 患者标签（动态枚举，前端维护）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdTagsApi(params = {}) { return callApi("PUT", "/patients/{id}/tags", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 陪诊次数配置 0-999（PC配置）
 * @method PUT
 * @url /patients/{id}/escort-quota
 * @desc 陪诊次数配置 0-999（PC配置）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdEscortQuotaApi(params = {}) { return callApi("PUT", "/patients/{id}/escort-quota", params, {"pathNames":["id"],"queryNames":["quota"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）
 * @method GET
 * @url /me/home
 * @desc 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）
 * @param {Object} params 请求参数
 */
export async function getMeHomeApi(params = {}) { return callApi("GET", "/me/home", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的告知书列表（按术式匹配，含已确认标记）
 * @method GET
 * @url /me/informed-consent
 * @desc 我的告知书列表（按术式匹配，含已确认标记）
 * @param {Object} params 请求参数
 */
export async function getMeInformedConsentApi(params = {}) { return callApi("GET", "/me/informed-consent", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 确认告知书（幂等）
 * @method POST
 * @url /me/informed-consent/{id}/confirm
 * @desc 确认告知书（幂等）
 * @param {Object} params 请求参数
 */
export async function postMeInformedConsentByIdConfirmApi(params = {}) { return callApi("POST", "/me/informed-consent/{id}/confirm", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的个人基本信息
 * @method GET
 * @url /me/profile
 * @desc 我的个人基本信息
 * @param {Object} params 请求参数
 */
export async function getMeProfileApi(params = {}) { return callApi("GET", "/me/profile", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 编辑我的信息（白名单字段+手机号验证码）
 * @method PUT
 * @url /me/profile
 * @desc 编辑我的信息（白名单字段+手机号验证码）
 * @param {Object} params 请求参数
 */
export async function putMeProfileApi(params = {}) { return callApi("PUT", "/me/profile", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 我的病历
 * @method GET
 * @url /me/medical-record
 * @desc 我的病历
 * @param {Object} params 请求参数
 */
export async function getMeMedicalRecordApi(params = {}) { return callApi("GET", "/me/medical-record", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 扫一扫添加：病历照片→OCR识别（附件1样表结构化）
 * @method POST
 * @url /me/medical-record/scan
 * @desc Mock OCR 直接返回成功；再次识别=部分更新，未识别字段空出。
 * @param {Object} params 请求参数
 */
export async function postMeMedicalRecordScanApi(params = {}) { return callApi("POST", "/me/medical-record/scan", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name OCR 识别结果（样表字段+置信度）
 * @method GET
 * @url /me/medical-record/scan/{taskId}
 * @desc OCR 识别结果（样表字段+置信度）
 * @param {Object} params 请求参数
 */
export async function getMeMedicalRecordScanByTaskIdApi(params = {}) { return callApi("GET", "/me/medical-record/scan/{taskId}", params, {"pathNames":["taskId"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 确认 OCR 结果回填病历/检验指标（部分更新）
 * @method POST
 * @url /me/medical-record/confirm
 * @desc basicInfoPatch 部分更新病历；labModule+indicators 另写一条检验 health_record（同 taskId+module 10 分钟幂等）；都不传时兼容旧客户端，整个 body 视为病历字段。
 * @param {Object} params 请求参数
 */
export async function postMeMedicalRecordConfirmApi(params = {}) { return callApi("POST", "/me/medical-record/confirm", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者健康记录（后台）
 * @method GET
 * @url /patients/{id}/health-records
 * @desc 患者健康记录（后台）
 * @param {Object} params 请求参数
 */
export async function getPatientsByIdHealthRecordsApi(params = {}) { return callApi("GET", "/patients/{id}/health-records", params, {"pathNames":["id"],"queryNames":["type"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 后台代录健康数据（公司管理/客服）
 * @method POST
 * @url /patients/{id}/health-records
 * @desc 后台代录健康数据（公司管理/客服）
 * @param {Object} params 请求参数
 */
export async function postPatientsByIdHealthRecordsApi(params = {}) { return callApi("POST", "/patients/{id}/health-records", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 健康记录写建议（客服/后台）
 * @method PUT
 * @url /health-records/{id}/advice
 * @desc 健康记录写建议（客服/后台）
 * @param {Object} params 请求参数
 */
export async function putHealthRecordsByIdAdviceApi(params = {}) { return callApi("PUT", "/health-records/{id}/advice", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者看板（骨架：最近20条+趋势占位）
 * @method GET
 * @url /patients/{id}/health-dashboard
 * @desc 患者看板（骨架：最近20条+趋势占位）
 * @param {Object} params 请求参数
 */
export async function getPatientsByIdHealthDashboardApi(params = {}) { return callApi("GET", "/patients/{id}/health-dashboard", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的健康看板（骨架）
 * @method GET
 * @url /me/health-dashboard
 * @desc 我的健康看板（骨架）
 * @param {Object} params 请求参数
 */
export async function getMeHealthDashboardApi(params = {}) { return callApi("GET", "/me/health-dashboard", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 拍照→AI 营养分析（失败降级 mock；每日 30 次）
 * @method POST
 * @url /me/nutrition/analyze
 * @desc 拍照→AI 营养分析（失败降级 mock；每日 30 次）
 * @param {Object} params 请求参数
 */
export async function postMeNutritionAnalyzeApi(params = {}) { return callApi("POST", "/me/nutrition/analyze", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 我的健康档案（基本信息+肿瘤标志物/血常规/肝功能 records+historyTrend）
 * @method GET
 * @url /me/health-archive
 * @desc 我的健康档案（基本信息+肿瘤标志物/血常规/肝功能 records+historyTrend）
 * @param {Object} params 请求参数
 */
export async function getMeHealthArchiveApi(params = {}) { return callApi("GET", "/me/health-archive", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name PSQI 睡眠评估题目（近1个月，18题）
 * @method GET
 * @url /me/scales/psqi
 * @desc PSQI 睡眠评估题目（近1个月，18题）
 * @param {Object} params 请求参数
 */
export async function getMeScalesPsqiApi(params = {}) { return callApi("GET", "/me/scales/psqi", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name PSQI 评估状态（UNASSESSED/IN_PROGRESS/COMPLETED/EXPIRED）
 * @method GET
 * @url /me/scales/psqi/status
 * @desc PSQI 评估状态（UNASSESSED/IN_PROGRESS/COMPLETED/EXPIRED）
 * @param {Object} params 请求参数
 */
export async function getMeScalesPsqiStatusApi(params = {}) { return callApi("GET", "/me/scales/psqi/status", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name PSQI 断点暂存（upsert 唯一草稿）
 * @method POST
 * @url /me/scales/psqi/draft
 * @desc PSQI 断点暂存（upsert 唯一草稿）
 * @param {Object} params 请求参数
 */
export async function postMeScalesPsqiDraftApi(params = {}) { return callApi("POST", "/me/scales/psqi/draft", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name PSQI 历史记录
 * @method GET
 * @url /me/scales/psqi/submissions
 * @desc PSQI 历史记录
 * @param {Object} params 请求参数
 */
export async function getMeScalesPsqiSubmissionsApi(params = {}) { return callApi("GET", "/me/scales/psqi/submissions", params, {"pathNames":[],"queryNames":["page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 提交 PSQI 作答→服务端计分（0-21+7维度）
 * @method POST
 * @url /me/scales/psqi/submissions
 * @desc 漏答无效不生成结果；计分规则见 measurement.docx。
 * @param {Object} params 请求参数
 */
export async function postMeScalesPsqiSubmissionsApi(params = {}) { return callApi("POST", "/me/scales/psqi/submissions", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者 PSQI 结果（后台查看）
 * @method GET
 * @url /patients/{id}/scales
 * @desc 患者 PSQI 结果（后台查看）
 * @param {Object} params 请求参数
 */
export async function getPatientsByIdScalesApi(params = {}) { return callApi("GET", "/patients/{id}/scales", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的运动康复方案（动作+本周统计；每日重置昨日完成项）
 * @method GET
 * @url /me/exercise/plan
 * @desc 我的运动康复方案（动作+本周统计；每日重置昨日完成项）
 * @param {Object} params 请求参数
 */
export async function getMeExercisePlanApi(params = {}) { return callApi("GET", "/me/exercise/plan", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 完成一组（达到目标组数→NEED_EVAL）
 * @method POST
 * @url /me/exercise/items/{id}/complete-set
 * @desc 完成一组（达到目标组数→NEED_EVAL）
 * @param {Object} params 请求参数
 */
export async function postMeExerciseItemsByIdCompleteSetApi(params = {}) { return callApi("POST", "/me/exercise/items/{id}/complete-set", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 提前结束动作（→NEED_EVAL）
 * @method POST
 * @url /me/exercise/items/{id}/finish
 * @desc 提前结束动作（→NEED_EVAL）
 * @param {Object} params 请求参数
 */
export async function postMeExerciseItemsByIdFinishApi(params = {}) { return callApi("POST", "/me/exercise/items/{id}/finish", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 暂停动作（异常，无自动恢复）
 * @method POST
 * @url /me/exercise/items/{id}/pause
 * @desc 暂停动作（异常，无自动恢复）
 * @param {Object} params 请求参数
 */
export async function postMeExerciseItemsByIdPauseApi(params = {}) { return callApi("POST", "/me/exercise/items/{id}/pause", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 训练后评估（动态表单；异常→PAUSED）
 * @method POST
 * @url /me/exercise/items/{id}/evaluation
 * @desc 训练后评估（动态表单；异常→PAUSED）
 * @param {Object} params 请求参数
 */
export async function postMeExerciseItemsByIdEvaluationApi(params = {}) { return callApi("POST", "/me/exercise/items/{id}/evaluation", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 评估表单配置（PC 可维护；配置缺失失败关闭 400）
 * @method GET
 * @url /me/exercise/eval-config
 * @desc 评估表单配置（PC 可维护；配置缺失失败关闭 400）
 * @param {Object} params 请求参数
 */
export async function getMeExerciseEvalConfigApi(params = {}) { return callApi("GET", "/me/exercise/eval-config", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 人工解锁动作项（客服/医生/公司管理）
 * @method PUT
 * @url /patients/{id}/exercise/items/{itemId}/unlock
 * @desc 人工解锁动作项（客服/医生/公司管理）
 * @param {Object} params 请求参数
 */
export async function putPatientsByIdExerciseItemsByItemIdUnlockApi(params = {}) { return callApi("PUT", "/patients/{id}/exercise/items/{itemId}/unlock", params, {"pathNames":["id","itemId"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 体重记录列表（range=7d|30d，默认 7d；最近 200 条）
 * @method GET
 * @url /me/weight/records
 * @desc 体重记录列表（range=7d|30d，默认 7d；最近 200 条）
 * @param {Object} params 请求参数
 */
export async function getMeWeightRecordsApi(params = {}) { return callApi("GET", "/me/weight/records", params, {"pathNames":[],"queryNames":["range"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增体重记录（record_date=今天）
 * @method POST
 * @url /me/weight/records
 * @desc 新增体重记录（record_date=今天）
 * @param {Object} params 请求参数
 */
export async function postMeWeightRecordsApi(params = {}) { return callApi("POST", "/me/weight/records", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除本人未删除的体重记录
 * @method DELETE
 * @url /me/weight/records/{id}
 * @desc 删除本人未删除的体重记录
 * @param {Object} params 请求参数
 */
export async function deleteMeWeightRecordsByIdApi(params = {}) { return callApi("DELETE", "/me/weight/records/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 本人已绑定设备列表
 * @method GET
 * @url /me/devices
 * @desc 本人已绑定设备列表
 * @param {Object} params 请求参数
 */
export async function getMeDevicesApi(params = {}) { return callApi("GET", "/me/devices", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 绑定 BLE 设备（同用户同 MAC 不可重复）
 * @method POST
 * @url /me/devices
 * @desc 绑定 BLE 设备（同用户同 MAC 不可重复）
 * @param {Object} params 请求参数
 */
export async function postMeDevicesApi(params = {}) { return callApi("POST", "/me/devices", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 解绑本人设备
 * @method DELETE
 * @url /me/devices/{id}
 * @desc 解绑本人设备
 * @param {Object} params 请求参数
 */
export async function deleteMeDevicesByIdApi(params = {}) { return callApi("DELETE", "/me/devices/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 同步设备：体脂秤必传 weightKg 并 upsert 当日 SCALE 记录；睡眠仪仅更新时间/电量
 * @method POST
 * @url /me/devices/{id}/sync
 * @desc 同步设备：体脂秤必传 weightKg 并 upsert 当日 SCALE 记录；睡眠仪仅更新时间/电量
 * @param {Object} params 请求参数
 */
export async function postMeDevicesByIdSyncApi(params = {}) { return callApi("POST", "/me/devices/{id}/sync", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 今日用药列表（status 由当日打卡推导）
 * @method GET
 * @url /me/medication/today
 * @desc 今日用药列表（status 由当日打卡推导）
 * @param {Object} params 请求参数
 */
export async function getMeMedicationTodayApi(params = {}) { return callApi("GET", "/me/medication/today", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 添加用药（药名+每日次数 1-3；v3 不再设置提醒时间）
 * @method POST
 * @url /me/medication
 * @desc 添加用药（药名+每日次数 1-3；v3 不再设置提醒时间）
 * @param {Object} params 请求参数
 */
export async function postMeMedicationApi(params = {}) { return callApi("POST", "/me/medication", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 用药打卡（当日幂等）
 * @method POST
 * @url /me/medication/{id}/take
 * @desc 用药打卡（当日幂等）
 * @param {Object} params 请求参数
 */
export async function postMeMedicationByIdTakeApi(params = {}) { return callApi("POST", "/me/medication/{id}/take", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 删除本人用药提醒
 * @method DELETE
 * @url /me/medication/{id}
 * @desc 删除本人用药提醒
 * @param {Object} params 请求参数
 */
export async function deleteMeMedicationByIdApi(params = {}) { return callApi("DELETE", "/me/medication/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 会话列表（客服工作台）
 * @method GET
 * @url /conversations
 * @desc 会话列表（客服工作台）
 * @param {Object} params 请求参数
 */
export async function getConversationsApi(params = {}) { return callApi("GET", "/conversations", params, {"pathNames":[],"queryNames":["status","priority","keyword","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 会话详情（患者信息+成员）
 * @method GET
 * @url /conversations/{id}
 * @desc 会话详情（患者信息+成员）
 * @param {Object} params 请求参数
 */
export async function getConversationsByIdApi(params = {}) { return callApi("GET", "/conversations/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 解决/重新打开会话（客服）
 * @method PUT
 * @url /conversations/{id}/status
 * @desc 解决/重新打开会话（客服）
 * @param {Object} params 请求参数
 */
export async function putConversationsByIdStatusApi(params = {}) { return callApi("PUT", "/conversations/{id}/status", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 紧急标记（客服；注意是 PUT）
 * @method PUT
 * @url /conversations/{id}/priority
 * @desc 紧急标记（客服；注意是 PUT）
 * @param {Object} params 请求参数
 */
export async function putConversationsByIdPriorityApi(params = {}) { return callApi("PUT", "/conversations/{id}/priority", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 历史消息（beforeId 游标，size 默认 30）
 * @method GET
 * @url /conversations/{id}/messages
 * @desc 代码返回 List<Message>，无 {list,nextCursor,hasMore} 包装；客户端用返回最小 id 作为下一次 beforeId。
 * @param {Object} params 请求参数
 */
export async function getConversationsByIdMessagesApi(params = {}) { return callApi("GET", "/conversations/{id}/messages", params, {"pathNames":["id"],"queryNames":["beforeId","size"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 发送消息（患者/客服/陪诊师；文本/图片/健康卡片）
 * @method POST
 * @url /conversations/{id}/messages
 * @desc content 不全局必填：TEXT 需 content、IMAGE 需 imageUrl、HEALTH_CARD 需 healthType 或 content。实时推送 WebSocket：/api/v1/ws?token=xxx，事件 message.new
 * @param {Object} params 请求参数
 */
export async function postConversationsByIdMessagesApi(params = {}) { return callApi("POST", "/conversations/{id}/messages", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 编辑消息（仅作者本人；AI/SYSTEM 锁定）
 * @method PUT
 * @url /conversations/{id}/messages/{messageId}
 * @desc 首次编辑把旧内容写入 originalText，后续编辑不覆盖。
 * @param {Object} params 请求参数
 */
export async function putConversationsByIdMessagesByMessageIdApi(params = {}) { return callApi("PUT", "/conversations/{id}/messages/{messageId}", params, {"pathNames":["id","messageId"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 显式访问审计（陪诊师/客服/公司管理）
 * @method POST
 * @url /conversations/{id}/audit
 * @desc 显式访问审计（陪诊师/客服/公司管理）
 * @param {Object} params 请求参数
 */
export async function postConversationsByIdAuditApi(params = {}) { return callApi("POST", "/conversations/{id}/audit", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 标记已读
 * @method POST
 * @url /conversations/{id}/read
 * @desc 标记已读
 * @param {Object} params 请求参数
 */
export async function postConversationsByIdReadApi(params = {}) { return callApi("POST", "/conversations/{id}/read", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 客服统计卡（总会话/ACTIVE 会话/紧急/答复率占位）
 * @method GET
 * @url /conversations/stats
 * @desc pendingReply 在此接口=ACTIVE 会话数；按未读消息口径的待回复数见 GET /cs/stats。
 * @param {Object} params 请求参数
 */
export async function getConversationsStatsApi(params = {}) { return callApi("GET", "/conversations/stats", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的会话（两段式：会话入口+站内通知）
 * @method GET
 * @url /me/conversations
 * @desc 患者=私人健康顾问单会话；客服/陪诊师=数据范围内患者会话；医生不授权本路由。
 * @param {Object} params 请求参数
 */
export async function getMeConversationsApi(params = {}) { return callApi("GET", "/me/conversations", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者发消息（/me 路径别名）
 * @method POST
 * @url /me/conversations/{id}/messages
 * @desc 患者发消息（/me 路径别名）
 * @param {Object} params 请求参数
 */
export async function postMeConversationsByIdMessagesApi(params = {}) { return callApi("POST", "/me/conversations/{id}/messages", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者评价客服（星级+标签+评论）
 * @method POST
 * @url /me/conversations/{id}/evaluation
 * @desc 患者评价客服（星级+标签+评论）
 * @param {Object} params 请求参数
 */
export async function postMeConversationsByIdEvaluationApi(params = {}) { return callApi("POST", "/me/conversations/{id}/evaluation", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 患者点「人工服务」（/me 路径别名）
 * @method POST
 * @url /me/conversations/{id}/manual-service
 * @desc 患者点「人工服务」（/me 路径别名）
 * @param {Object} params 请求参数
 */
export async function postMeConversationsByIdManualServiceApi(params = {}) { return callApi("POST", "/me/conversations/{id}/manual-service", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者点「人工服务」（转人工唯一触发方式）→PC提醒
 * @method POST
 * @url /conversations/{id}/manual-service
 * @desc 患者点「人工服务」（转人工唯一触发方式）→PC提醒
 * @param {Object} params 请求参数
 */
export async function postConversationsByIdManualServiceApi(params = {}) { return callApi("POST", "/conversations/{id}/manual-service", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 待响应人工服务请求列表（PC客服）
 * @method GET
 * @url /manual-service-requests
 * @desc 待响应人工服务请求列表（PC客服）
 * @param {Object} params 请求参数
 */
export async function getManualServiceRequestsApi(params = {}) { return callApi("GET", "/manual-service-requests", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 受理人工服务请求（PC客服）
 * @method PUT
 * @url /manual-service-requests/{id}
 * @desc 受理人工服务请求（PC客服）
 * @param {Object} params 请求参数
 */
export async function putManualServiceRequestsByIdApi(params = {}) { return callApi("PUT", "/manual-service-requests/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 群沟通反馈模板（常见问题回复）
 * @method GET
 * @url /reply-templates
 * @desc 群沟通反馈模板（常见问题回复）
 * @param {Object} params 请求参数
 */
export async function getReplyTemplatesApi(params = {}) { return callApi("GET", "/reply-templates", params, {"pathNames":[],"queryNames":["type","surgeryType"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 知识库问答列表（客服共享）
 * @method GET
 * @url /kb/entries
 * @desc 知识库问答列表（客服共享）
 * @param {Object} params 请求参数
 */
export async function getKbEntriesApi(params = {}) { return callApi("GET", "/kb/entries", params, {"pathNames":[],"queryNames":["keyword","category","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增知识条目（人工客服）
 * @method POST
 * @url /kb/entries
 * @desc 新增知识条目（人工客服）
 * @param {Object} params 请求参数
 */
export async function postKbEntriesApi(params = {}) { return callApi("POST", "/kb/entries", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改知识条目（人工客服）
 * @method PUT
 * @url /kb/entries/{id}
 * @desc 修改知识条目（人工客服）
 * @param {Object} params 请求参数
 */
export async function putKbEntriesByIdApi(params = {}) { return callApi("PUT", "/kb/entries/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除知识条目（人工客服）
 * @method DELETE
 * @url /kb/entries/{id}
 * @desc 删除知识条目（人工客服）
 * @param {Object} params 请求参数
 */
export async function deleteKbEntriesByIdApi(params = {}) { return callApi("DELETE", "/kb/entries/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 启用/停用（人工客服）
 * @method PUT
 * @url /kb/entries/{id}/status
 * @desc 启用/停用（人工客服）
 * @param {Object} params 请求参数
 */
export async function putKbEntriesByIdStatusApi(params = {}) { return callApi("PUT", "/kb/entries/{id}/status", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 随访任务列表（PC工作流+手机端同源）
 * @method GET
 * @url /follow-up/tasks
 * @desc keyword 参数在 Controller 中声明但未参与查询（文档与实现差异，见报告）。
 * @param {Object} params 请求参数
 */
export async function getFollowUpTasksApi(params = {}) { return callApi("GET", "/follow-up/tasks", params, {"pathNames":[],"queryNames":["status","assigneeId","priority","keyword","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 创建随访任务
 * @method POST
 * @url /follow-up/tasks
 * @desc 创建随访任务
 * @param {Object} params 请求参数
 */
export async function postFollowUpTasksApi(params = {}) { return callApi("POST", "/follow-up/tasks", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 更新任务（分配/改期/状态流转）
 * @method PUT
 * @url /follow-up/tasks/{id}
 * @desc 更新任务（分配/改期/状态流转）
 * @param {Object} params 请求参数
 */
export async function putFollowUpTasksByIdApi(params = {}) { return callApi("PUT", "/follow-up/tasks/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 历史通话记录
 * @method GET
 * @url /follow-up/tasks/{id}/calls
 * @desc 历史通话记录
 * @param {Object} params 请求参数
 */
export async function getFollowUpTasksByIdCallsApi(params = {}) { return callApi("GET", "/follow-up/tasks/{id}/calls", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 提交电话随访记录（PC 4步表单）
 * @method POST
 * @url /follow-up/tasks/{id}/calls
 * @desc pushToGroup=1 时同步到沟通群（CALL_RECORD 卡片）；提交后任务 PENDING→FOLLOWED。
 * @param {Object} params 请求参数
 */
export async function postFollowUpTasksByIdCallsApi(params = {}) { return callApi("POST", "/follow-up/tasks/{id}/calls", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 电话按钮状态（未拨打=绿/已拨打=蓝）
 * @method GET
 * @url /follow-up/tasks/{id}/phone-status
 * @desc 电话按钮状态（未拨打=绿/已拨打=蓝）
 * @param {Object} params 请求参数
 */
export async function getFollowUpTasksByIdPhoneStatusApi(params = {}) { return callApi("GET", "/follow-up/tasks/{id}/phone-status", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 随访统计（待沟通/待跟进/今日随访）
 * @method GET
 * @url /follow-up/summary
 * @desc 随访统计（待沟通/待跟进/今日随访）
 * @param {Object} params 请求参数
 */
export async function getFollowUpSummaryApi(params = {}) { return callApi("GET", "/follow-up/summary", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 客服患者列表（CS 仅本人匹配；ADMIN 全量）
 * @method GET
 * @url /cs/patients
 * @desc 客服患者列表（CS 仅本人匹配；ADMIN 全量）
 * @param {Object} params 请求参数
 */
export async function getCsPatientsApi(params = {}) { return callApi("GET", "/cs/patients", params, {"pathNames":[],"queryNames":["keyword","communicateStatus","purchaseIntent","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 客服工作台统计（高意向/待沟通/待回复）
 * @method GET
 * @url /cs/stats
 * @desc pendingReply：只看每个会话最后一条消息，来自患者且 read_json 不含当前客服 userId（解析失败按未读）。
 * @param {Object} params 请求参数
 */
export async function getCsStatsApi(params = {}) { return callApi("GET", "/cs/stats", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者详情（手术档案+AI摘要缓存+时间线）
 * @method GET
 * @url /cs/patients/{id}
 * @desc 患者详情（手术档案+AI摘要缓存+时间线）
 * @param {Object} params 请求参数
 */
export async function getCsPatientsByIdApi(params = {}) { return callApi("GET", "/cs/patients/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name AI 沟通关键点总结（30 分钟缓存，失败降级 mock）
 * @method GET
 * @url /cs/patients/{id}/ai-summary
 * @desc AI 沟通关键点总结（30 分钟缓存，失败降级 mock）
 * @param {Object} params 请求参数
 */
export async function getCsPatientsByIdAiSummaryApi(params = {}) { return callApi("GET", "/cs/patients/{id}/ai-summary", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name AI 沟通初步预判（30 分钟缓存，失败降级 mock）
 * @method GET
 * @url /cs/patients/{id}/ai-prediction
 * @desc AI 沟通初步预判（30 分钟缓存，失败降级 mock）
 * @param {Object} params 请求参数
 */
export async function getCsPatientsByIdAiPredictionApi(params = {}) { return callApi("GET", "/cs/patients/{id}/ai-prediction", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 电话按钮状态（未拨打=绿/已拨打=蓝）
 * @method GET
 * @url /cs/patients/{id}/phone-status
 * @desc 电话按钮状态（未拨打=绿/已拨打=蓝）
 * @param {Object} params 请求参数
 */
export async function getCsPatientsByIdPhoneStatusApi(params = {}) { return callApi("GET", "/cs/patients/{id}/phone-status", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 客服 FAQ（启用知识库，按术式+关键词）
 * @method GET
 * @url /cs/faq
 * @desc 客服 FAQ（启用知识库，按术式+关键词）
 * @param {Object} params 请求参数
 */
export async function getCsFaqApi(params = {}) { return callApi("GET", "/cs/faq", params, {"pathNames":[],"queryNames":["keyword","surgeryType"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 提交通话记录（表单超集；pushToGroup 同步群卡片）
 * @method POST
 * @url /cs/patients/{id}/calls
 * @desc 提交通话记录（表单超集；pushToGroup 同步群卡片）
 * @param {Object} params 请求参数
 */
export async function postCsPatientsByIdCallsApi(params = {}) { return callApi("POST", "/cs/patients/{id}/calls", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 发起双呼（虚拟保护号）
 * @method POST
 * @url /cs/patients/{id}/call
 * @desc 返回 callId + virtualNumber；通话结束后用 /cs/patients/{id}/calls 回传 callId 做幂等。
 * @param {Object} params 请求参数
 */
export async function postCsPatientsByIdCallApi(params = {}) { return callApi("POST", "/cs/patients/{id}/call", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 医生个人档案（certified=账号启用；prescriptionSignEnabled 仅展示）
 * @method GET
 * @url /doctor/profile
 * @desc 医生个人档案（certified=账号启用；prescriptionSignEnabled 仅展示）
 * @param {Object} params 请求参数
 */
export async function getDoctorProfileApi(params = {}) { return callApi("GET", "/doctor/profile", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 编辑医生个人档案（写 dict_doctor；5 个必填字段）
 * @method PUT
 * @url /doctor/profile
 * @desc 编辑医生个人档案（写 dict_doctor；5 个必填字段）
 * @param {Object} params 请求参数
 */
export async function putDoctorProfileApi(params = {}) { return callApi("PUT", "/doctor/profile", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 本人患者列表（姓名/手机号/术式/病症/入院诊断搜索；surgery_date 区间+排序）
 * @method GET
 * @url /doctor/patients
 * @desc 本人患者列表（姓名/手机号/术式/病症/入院诊断搜索；surgery_date 区间+排序）
 * @param {Object} params 请求参数
 */
export async function getDoctorPatientsApi(params = {}) { return callApi("GET", "/doctor/patients", params, {"pathNames":[],"queryNames":["keyword","departmentId","from","to","sort","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 10 模块临床档案（进入自动写访问审计）
 * @method GET
 * @url /doctor/patients/{id}/archive
 * @desc 10 模块临床档案（进入自动写访问审计）
 * @param {Object} params 请求参数
 */
export async function getDoctorPatientsByIdArchiveApi(params = {}) { return callApi("GET", "/doctor/patients/{id}/archive", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 登记患者附件（文件本体先走 /files/upload）
 * @method POST
 * @url /doctor/patients/{id}/attachments
 * @desc 登记患者附件（文件本体先走 /files/upload）
 * @param {Object} params 请求参数
 */
export async function postDoctorPatientsByIdAttachmentsApi(params = {}) { return callApi("POST", "/doctor/patients/{id}/attachments", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除本人上传的附件（他人上传只读，403）
 * @method DELETE
 * @url /doctor/patients/{id}/attachments/{attId}
 * @desc 删除本人上传的附件（他人上传只读，403）
 * @param {Object} params 请求参数
 */
export async function deleteDoctorPatientsByIdAttachmentsByAttIdApi(params = {}) { return callApi("DELETE", "/doctor/patients/{id}/attachments/{attId}", params, {"pathNames":["id","attId"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 只读群聊（会话+成员槽位+消息；进入自动审计）
 * @method GET
 * @url /doctor/patients/{id}/conversation
 * @desc 医生无发送/编辑/状态等写权限（路由不授权）。
 * @param {Object} params 请求参数
 */
export async function getDoctorPatientsByIdConversationApi(params = {}) { return callApi("GET", "/doctor/patients/{id}/conversation", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的陪诊（剩余次数+当前有效预约）
 * @method GET
 * @url /me/escort
 * @desc 我的陪诊（剩余次数+当前有效预约）
 * @param {Object} params 请求参数
 */
export async function getMeEscortApi(params = {}) { return callApi("GET", "/me/escort", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 可预约陪诊师列表（含忙碌时段）
 * @method GET
 * @url /me/escort/caregivers
 * @desc 可预约陪诊师列表（含忙碌时段）
 * @param {Object} params 请求参数
 */
export async function getMeEscortCaregiversApi(params = {}) { return callApi("GET", "/me/escort/caregivers", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 我的预约列表（含陪诊师联系方式）
 * @method GET
 * @url /me/escort/bookings
 * @desc 我的预约列表（含陪诊师联系方式）
 * @param {Object} params 请求参数
 */
export async function getMeEscortBookingsApi(params = {}) { return callApi("GET", "/me/escort/bookings", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 预约陪诊（预约即扣 1 次；明天起 10 天；时段冲突校验）
 * @method POST
 * @url /me/escort/bookings
 * @desc MORNING/AFTERNOON/FULLDAY 时段排他；仅个人就诊医院；取消全额返还次数。
 * @param {Object} params 请求参数
 */
export async function postMeEscortBookingsApi(params = {}) { return callApi("POST", "/me/escort/bookings", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 取消预约（全额返还 1 次；仅 WAIT_ACCEPT/CONFIRMED 可取消）
 * @method POST
 * @url /me/escort/bookings/{id}/cancel
 * @desc 取消预约（全额返还 1 次；仅 WAIT_ACCEPT/CONFIRMED 可取消）
 * @param {Object} params 请求参数
 */
export async function postMeEscortBookingsByIdCancelApi(params = {}) { return callApi("POST", "/me/escort/bookings/{id}/cancel", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 陪诊师工作台统计（待接单/待服务/服务中/已完成/服务人数）
 * @method GET
 * @url /escort/stats
 * @desc 陪诊师工作台统计（待接单/待服务/服务中/已完成/服务人数）
 * @param {Object} params 请求参数
 */
export async function getEscortStatsApi(params = {}) { return callApi("GET", "/escort/stats", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 陪诊师订单列表（分页）
 * @method GET
 * @url /escort/orders
 * @desc 陪诊师订单列表（分页）
 * @param {Object} params 请求参数
 */
export async function getEscortOrdersApi(params = {}) { return callApi("GET", "/escort/orders", params, {"pathNames":[],"queryNames":["status","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 订单详情（待服务=患者+风险提示；完成/取消=服务记录+打卡）
 * @method GET
 * @url /escort/orders/{id}
 * @desc 订单详情（待服务=患者+风险提示；完成/取消=服务记录+打卡）
 * @param {Object} params 请求参数
 */
export async function getEscortOrdersByIdApi(params = {}) { return callApi("GET", "/escort/orders/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 接单（WAIT_ACCEPT→CONFIRMED）
 * @method PUT
 * @url /escort/orders/{id}/accept
 * @desc 接单（WAIT_ACCEPT→CONFIRMED）
 * @param {Object} params 请求参数
 */
export async function putEscortOrdersByIdAcceptApi(params = {}) { return callApi("PUT", "/escort/orders/{id}/accept", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 开始服务（CONFIRMED→IN_SERVICE）
 * @method PUT
 * @url /escort/orders/{id}/start
 * @desc 开始服务（CONFIRMED→IN_SERVICE）
 * @param {Object} params 请求参数
 */
export async function putEscortOrdersByIdStartApi(params = {}) { return callApi("PUT", "/escort/orders/{id}/start", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 到院打卡（定位+地址+照片；记录 ARRIVE 打卡）
 * @method POST
 * @url /escort/orders/{id}/checkin
 * @desc 到院打卡（定位+地址+照片；记录 ARRIVE 打卡）
 * @param {Object} params 请求参数
 */
export async function postEscortOrdersByIdCheckinApi(params = {}) { return callApi("POST", "/escort/orders/{id}/checkin", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 提交服务记录（订单归档 COMPLETED；COMPLETED 才累加服务人次）
 * @method POST
 * @url /escort/orders/{id}/service-record
 * @desc 提交服务记录（订单归档 COMPLETED；COMPLETED 才累加服务人次）
 * @param {Object} params 请求参数
 */
export async function postEscortOrdersByIdServiceRecordApi(params = {}) { return callApi("POST", "/escort/orders/{id}/service-record", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 月历排班（yyyy-MM-dd → 时段订单）
 * @method GET
 * @url /escort/schedules
 * @desc 月历排班（yyyy-MM-dd → 时段订单）
 * @param {Object} params 请求参数
 */
export async function getEscortSchedulesApi(params = {}) { return callApi("GET", "/escort/schedules", params, {"pathNames":[],"queryNames":["month"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 陪诊师个人统计（累计服务/本月/评分）
 * @method GET
 * @url /escort/profile-stats
 * @desc 陪诊师个人统计（累计服务/本月/评分）
 * @param {Object} params 请求参数
 */
export async function getEscortProfileStatsApi(params = {}) { return callApi("GET", "/escort/profile-stats", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 陪诊师服务过的患者（会话入口+未读数）
 * @method GET
 * @url /escort/users
 * @desc 陪诊师服务过的患者（会话入口+未读数）
 * @param {Object} params 请求参数
 */
export async function getEscortUsersApi(params = {}) { return callApi("GET", "/escort/users", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 预约管理（公司管理全量列表）
 * @method GET
 * @url /escort/bookings
 * @desc 预约管理（公司管理全量列表）
 * @param {Object} params 请求参数
 */
export async function getEscortBookingsApi(params = {}) { return callApi("GET", "/escort/bookings", params, {"pathNames":[],"queryNames":["patientId","status"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 风险提示列表（PC客服核心模块）
 * @method GET
 * @url /risk-alerts
 * @desc 风险提示列表（PC客服核心模块）
 * @param {Object} params 请求参数
 */
export async function getRiskAlertsApi(params = {}) { return callApi("GET", "/risk-alerts", params, {"pathNames":[],"queryNames":["status","level","source","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 手动上报风险（兜底）
 * @method POST
 * @url /risk-alerts
 * @desc 手动上报风险（兜底）
 * @param {Object} params 请求参数
 */
export async function postRiskAlertsApi(params = {}) { return callApi("POST", "/risk-alerts", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 风险统计（未处理/高中低）
 * @method GET
 * @url /risk-alerts/summary
 * @desc 风险统计（未处理/高中低）
 * @param {Object} params 请求参数
 */
export async function getRiskAlertsSummaryApi(params = {}) { return callApi("GET", "/risk-alerts/summary", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 处理/关闭风险提示
 * @method PUT
 * @url /risk-alerts/{id}
 * @desc 处理/关闭风险提示
 * @param {Object} params 请求参数
 */
export async function putRiskAlertsByIdApi(params = {}) { return callApi("PUT", "/risk-alerts/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 人员列表（客服/陪诊师/医生/医院管理；不返回 ADMIN）
 * @method GET
 * @url /staff
 * @desc 人员列表（客服/陪诊师/医生/医院管理；不返回 ADMIN）
 * @param {Object} params 请求参数
 */
export async function getStaffApi(params = {}) { return callApi("GET", "/staff", params, {"pathNames":[],"queryNames":["role","status","keyword","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增员工（初始密码 123456）
 * @method POST
 * @url /staff
 * @desc 新增员工（初始密码 123456）
 * @param {Object} params 请求参数
 */
export async function postStaffApi(params = {}) { return callApi("POST", "/staff", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 员工详情
 * @method GET
 * @url /staff/{id}
 * @desc 员工详情
 * @param {Object} params 请求参数
 */
export async function getStaffByIdApi(params = {}) { return callApi("GET", "/staff/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 修改员工（负责区域矩阵等；密码需单独重置）
 * @method PUT
 * @url /staff/{id}
 * @desc 修改员工（负责区域矩阵等；密码需单独重置）
 * @param {Object} params 请求参数
 */
export async function putStaffByIdApi(params = {}) { return callApi("PUT", "/staff/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 启停账号
 * @method PUT
 * @url /staff/{id}/status
 * @desc 启停账号
 * @param {Object} params 请求参数
 */
export async function putStaffByIdStatusApi(params = {}) { return callApi("PUT", "/staff/{id}/status", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 重置密码
 * @method PUT
 * @url /staff/{id}/password
 * @desc 重置密码
 * @param {Object} params 请求参数
 */
export async function putStaffByIdPasswordApi(params = {}) { return callApi("PUT", "/staff/{id}/password", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 客服排班查询
 * @method GET
 * @url /staff/schedules
 * @desc 客服排班查询
 * @param {Object} params 请求参数
 */
export async function getStaffSchedulesApi(params = {}) { return callApi("GET", "/staff/schedules", params, {"pathNames":[],"queryNames":["staffId","from","to"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增排班
 * @method POST
 * @url /staff/schedules
 * @desc 新增排班
 * @param {Object} params 请求参数
 */
export async function postStaffSchedulesApi(params = {}) { return callApi("POST", "/staff/schedules", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除排班
 * @method DELETE
 * @url /staff/schedules/{id}
 * @desc 删除排班
 * @param {Object} params 请求参数
 */
export async function deleteStaffSchedulesByIdApi(params = {}) { return callApi("DELETE", "/staff/schedules/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 客服绩效（骨架：答复率/响应时间/满意度占位）
 * @method GET
 * @url /staff/performance
 * @desc 客服绩效（骨架：答复率/响应时间/满意度占位）
 * @param {Object} params 请求参数
 */
export async function getStaffPerformanceApi(params = {}) { return callApi("GET", "/staff/performance", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 医院效能看板（骨架 TODO）
 * @method GET
 * @url /assessment/hospital-dashboard
 * @desc 医院效能看板（骨架 TODO）
 * @param {Object} params 请求参数
 */
export async function getAssessmentHospitalDashboardApi(params = {}) { return callApi("GET", "/assessment/hospital-dashboard", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者列表（医院权限=全部科室可筛选；科室权限=仅本科室）
 * @method GET
 * @url /hospital/patients
 * @desc 患者列表（医院权限=全部科室可筛选；科室权限=仅本科室）
 * @param {Object} params 请求参数
 */
export async function getHospitalPatientsApi(params = {}) { return callApi("GET", "/hospital/patients", params, {"pathNames":[],"queryNames":["keyword","hospitalId","departmentId","healthStatus","tag","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者健康详情（饮食/运动/体重/血糖血压7天；检查指标30天；其他附件）
 * @method GET
 * @url /hospital/patients/{id}/health-detail
 * @desc 患者健康详情（饮食/运动/体重/血糖血压7天；检查指标30天；其他附件）
 * @param {Object} params 请求参数
 */
export async function getHospitalPatientsByIdHealthDetailApi(params = {}) { return callApi("GET", "/hospital/patients/{id}/health-detail", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 患者 tab 统计
 * @method GET
 * @url /hospital/summary
 * @desc 患者 tab 统计
 * @param {Object} params 请求参数
 */
export async function getHospitalSummaryApi(params = {}) { return callApi("GET", "/hospital/summary", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name Banner（健康知识库精选等，C端公开）
 * @method GET
 * @url /app/banners
 * @desc Banner（健康知识库精选等，C端公开）
 * @param {Object} params 请求参数
 */
export async function getAppBannersApi(params = {}) { return callApi("GET", "/app/banners", params, {"pathNames":[],"queryNames":["position"],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 新增 Banner（公司管理）
 * @method POST
 * @url /app/banners
 * @desc 新增 Banner（公司管理）
 * @param {Object} params 请求参数
 */
export async function postAppBannersApi(params = {}) { return callApi("POST", "/app/banners", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 全部 Banner（公司管理）
 * @method GET
 * @url /app/banners/all
 * @desc 全部 Banner（公司管理）
 * @param {Object} params 请求参数
 */
export async function getAppBannersAllApi(params = {}) { return callApi("GET", "/app/banners/all", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 修改 Banner（公司管理）
 * @method PUT
 * @url /app/banners/{id}
 * @desc 修改 Banner（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppBannersByIdApi(params = {}) { return callApi("PUT", "/app/banners/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除 Banner（公司管理）
 * @method DELETE
 * @url /app/banners/{id}
 * @desc 删除 Banner（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteAppBannersByIdApi(params = {}) { return callApi("DELETE", "/app/banners/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 资讯/健康文章/心理健康内容（C端公开，按科室+术式）
 * @method GET
 * @url /app/articles
 * @desc 资讯/健康文章/心理健康内容（C端公开，按科室+术式）
 * @param {Object} params 请求参数
 */
export async function getAppArticlesApi(params = {}) { return callApi("GET", "/app/articles", params, {"pathNames":[],"queryNames":["type","departmentId","surgeryType","page","pageSize"],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 新增文章（公司管理）
 * @method POST
 * @url /app/articles
 * @desc 新增文章（公司管理）
 * @param {Object} params 请求参数
 */
export async function postAppArticlesApi(params = {}) { return callApi("POST", "/app/articles", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 全部文章（公司管理）
 * @method GET
 * @url /app/articles/all
 * @desc 全部文章（公司管理）
 * @param {Object} params 请求参数
 */
export async function getAppArticlesAllApi(params = {}) { return callApi("GET", "/app/articles/all", params, {"pathNames":[],"queryNames":["type"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 修改文章（公司管理）
 * @method PUT
 * @url /app/articles/{id}
 * @desc 修改文章（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppArticlesByIdApi(params = {}) { return callApi("PUT", "/app/articles/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除文章（公司管理）
 * @method DELETE
 * @url /app/articles/{id}
 * @desc 删除文章（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteAppArticlesByIdApi(params = {}) { return callApi("DELETE", "/app/articles/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 全部回复模板（公司管理）
 * @method GET
 * @url /app/templates/all
 * @desc 全部回复模板（公司管理）
 * @param {Object} params 请求参数
 */
export async function getAppTemplatesAllApi(params = {}) { return callApi("GET", "/app/templates/all", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 新增模板（公司管理）
 * @method POST
 * @url /app/templates
 * @desc 新增模板（公司管理）
 * @param {Object} params 请求参数
 */
export async function postAppTemplatesApi(params = {}) { return callApi("POST", "/app/templates", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改模板（公司管理）
 * @method PUT
 * @url /app/templates/{id}
 * @desc 修改模板（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppTemplatesByIdApi(params = {}) { return callApi("PUT", "/app/templates/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除模板（公司管理）
 * @method DELETE
 * @url /app/templates/{id}
 * @desc 删除模板（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteAppTemplatesByIdApi(params = {}) { return callApi("DELETE", "/app/templates/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 启用/停用模板（公司管理）
 * @method PUT
 * @url /app/templates/{id}/status
 * @desc 启用/停用模板（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppTemplatesByIdStatusApi(params = {}) { return callApi("PUT", "/app/templates/{id}/status", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 告知书列表（C端公开，生效中）
 * @method GET
 * @url /app/informed-consents
 * @desc 告知书列表（C端公开，生效中）
 * @param {Object} params 请求参数
 */
export async function getAppInformedConsentsApi(params = {}) { return callApi("GET", "/app/informed-consents", params, {"pathNames":[],"queryNames":["departmentId"],"hasBody":false,"auth":false,"clearAuth":false}); }
/**
 * @name 新增告知书（公司管理）
 * @method POST
 * @url /app/informed-consents
 * @desc 新增告知书（公司管理）
 * @param {Object} params 请求参数
 */
export async function postAppInformedConsentsApi(params = {}) { return callApi("POST", "/app/informed-consents", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 修改告知书（公司管理）
 * @method PUT
 * @url /app/informed-consents/{id}
 * @desc 修改告知书（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppInformedConsentsByIdApi(params = {}) { return callApi("PUT", "/app/informed-consents/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 删除告知书（公司管理）
 * @method DELETE
 * @url /app/informed-consents/{id}
 * @desc 删除告知书（公司管理）
 * @param {Object} params 请求参数
 */
export async function deleteAppInformedConsentsByIdApi(params = {}) { return callApi("DELETE", "/app/informed-consents/{id}", params, {"pathNames":["id"],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 启用/归档告知书（公司管理）
 * @method PUT
 * @url /app/informed-consents/{id}/status
 * @desc 启用/归档告知书（公司管理）
 * @param {Object} params 请求参数
 */
export async function putAppInformedConsentsByIdStatusApi(params = {}) { return callApi("PUT", "/app/informed-consents/{id}/status", params, {"pathNames":["id"],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 通知列表（系统信息/资料更新/人工服务提醒/风险）
 * @method GET
 * @url /notifications
 * @desc 通知列表（系统信息/资料更新/人工服务提醒/风险）
 * @param {Object} params 请求参数
 */
export async function getNotificationsApi(params = {}) { return callApi("GET", "/notifications", params, {"pathNames":[],"queryNames":["isRead","type","page","pageSize"],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 全部标记已读
 * @method PUT
 * @url /notifications/read
 * @desc 全部标记已读
 * @param {Object} params 请求参数
 */
export async function putNotificationsReadApi(params = {}) { return callApi("PUT", "/notifications/read", params, {"pathNames":[],"queryNames":[],"hasBody":false,"auth":true,"clearAuth":false}); }
/**
 * @name 小程序订阅消息授权登记（TODO 骨架）
 * @method POST
 * @url /notifications/wx-subscribe
 * @desc 小程序订阅消息授权登记（TODO 骨架）
 * @param {Object} params 请求参数
 */
export async function postNotificationsWxSubscribeApi(params = {}) { return callApi("POST", "/notifications/wx-subscribe", params, {"pathNames":[],"queryNames":[],"hasBody":true,"auth":true,"clearAuth":false}); }
/**
 * @name 上传文件（图片/文档，≤20MB）→本地存储（需登录；COS 实现 TODO）
 * @method POST
 * @url /files/upload
 * @desc 上传接口需登录（SecurityConfig 保护）；dir 只允许白名单，拒绝路径穿越。
 * @param {Object} params 请求参数
 */
export async function postFilesUploadApi(params = {}) { return uploadSingleFile(params); }
/**
 * @name 批量上传（其他指标5附件等；需登录）
 * @method POST
 * @url /files/uploads
 * @desc 批量上传（其他指标5附件等；需登录）
 * @param {Object} params 请求参数
 */
export async function postFilesUploadsApi(params = {}) { return uploadMultipleFiles(params); }
/**
 * @name 本地存储读取（开发用；匿名可访问）
 * @method GET
 * @url /files/{dir}/{filename}
 * @desc 本地存储读取（开发用；匿名可访问）
 * @param {Object} params 请求参数
 */
export async function getFilesByDirByFilenameApi(params = {}) { return Promise.resolve(buildPublicFileUrl(params)); }
