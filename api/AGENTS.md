# AGENTS.md —— 前端 AI 编码代理接口指南

> 本文件写给 **AI 编码代理（Codex / Cursor / Claude Code 等）** 与前端开发者：说明这套接口怎么用、按什么顺序调、哪些是坑。
> 接口全集见同目录 `API_INDEX.md`（自动生成），字段细节以 `swagger.json` 为准，业务说明以仓库 `docs/03-接口设计.md` 为准。
> 发现文档与代码不一致时：**以运行时/`swagger.json` 为准**，并在仓库提 issue。

## 1. 快速事实

| 项 | 值 |
|---|---|
| Base URL | `http://115.159.151.158:8081/api/v1`（联调）或 `http://followup.ijunyuan.cn/api/v1` |
| 协议 | HTTP + JSON（UTF-8）；WebSocket `ws://{host}/api/v1/ws?token=...` |
| 统一响应 | HTTP 状态**恒为 200**，业务状态看响应体 `code`（0=成功） |
| 鉴权 | `Authorization: Bearer <accessToken>` |
| 时间 | `yyyy-MM-dd HH:mm:ss`；日期 `yyyy-MM-dd` |
| 分页 | 请求 `page`(从1)/`pageSize`(默认20，最大100)；响应 `{list,total,page,pageSize}` |
| 文件 | 上传 `POST /files/upload`（multipart，需登录）；读取 `GET /files/{dir}/{filename}`（公开） |

## 2. 角色与账号（联调）

| 角色（JWT `role`） | 端 | 账号 | 接口域 |
|---|---|---|---|
| `PATIENT` 患者 | 小程序 | `admin2/1`（患者 910005） | `/me/**`（本人） |
| `CS` 客服 | 小程序 | `admin/1` | `/cs/**`、`/conversations/**` |
| `CAREGIVER` 陪诊师 | 小程序 | `admin3/1` | `/escort/**`、`/conversations/**` |
| `DOCTOR` 医生 | 小程序 | `admin5/1` | `/doctor/**`（只读） |
| `ADMIN` 公司管理 | PC | `root/admin123` | PC 管理接口（`/patients`、`/staff`、`/dict`、`/app` 等） |
| `HOSPITAL_ADMIN` 医院管理 | PC | 由 PC 人员管理创建 | `/hospital/**`、只读字典 |

- **医助（DA）暂缓**：不存在该角色/账号，不要为其生成页面逻辑。
- dev 免登 token：`GET /auth/dev-tokens`（仅 dev 环境）返回 6 个 key：`admin/hospital/cs/station/doctor/patient`；注意 **`station` 的 role 是 `CAREGIVER`**（历史 key 名）。
- 多设备登录允许；refresh token 旋转（旧 refresh 用一次即失效）。

## 3. 登录与鉴权流程

```
POST /auth/login            {username, password}          // 员工 + 患者账密通用
POST /auth/sms-code         {phone}                       // 仅 phone（无 scene）
POST /auth/sms-login        {phone, code}                 // 仅患者
POST /auth/register         {phone, code, name, age, surgeryType, doctorId,
                             gender?, surgeryRegion?, hospitalId?, departmentId?,
                             diseaseIntro?, idCard?}       // 患者自助注册；age/surgeryType/doctorId 必填
POST /auth/wx-login         ?code=                        // 返回 needRegister + bindToken（新用户）
POST /auth/refresh          ?refreshToken=                // 旋转
POST /auth/logout           ?refreshToken=
GET  /auth/me                                              // 当前用户（含 role/isRegistered）
PUT  /auth/password         {oldPassword, newPassword}     // 已有密码时 oldPassword 必填
```

**前端必须实现的错误处理**（HTTP 一律 200，按 `code` 分流）：

| code | 处理 |
|---|---|
| 0 | 成功 |
| 400 | 弹 `message`，不跳登录（参数/业务错误） |
| 401 | 用 refreshToken 静默调 `/auth/refresh` 换新并重试原请求；无 refresh 则跳登录 |
| 402 | refresh 失败 → 清凭证 → 跳登录 |
| 403 | 无权限提示（不要跳登录） |
| 500 | 通用错误提示 |

- 患者登录后若 `isRegistered=false`，引导到注册/补全档案（`name/surgeryType/doctorId`）。
- 患者修改手机号必须带 `phoneCode`（`PUT /me/profile`），否则 400。

## 4. ID、数值与序列化（高频坑）

- **雪花 ID 是 19 位数字，超过 JS `Number.MAX_SAFE_INTEGER`**。浏览器 `JSON.parse` 会丢精度。
  - 推荐：请求层用 `json-bigint` 解析（`storeAsString: true`），或推动服务端配置 Long→String。
  - 类型定义中所有 `id/*Id` 一律用 `string | number`，不要用 `number` 做运算/比较。
- 金额/评分等用 number；日期字符串不要用 `Date.parse` 之外的隐式转换（部分时间无时区，按本地时间处理）。
- 枚举：服务端存 **ASCII**，中文标签由前端维护（见 §7 字典）。

## 5. 各角色首屏调用顺序

**患者**
```
登录 → GET /auth/me → isRegistered?
  → GET /me/home                     // 术后天数/顾问名片/监测看板/陪诊状态/待确认告知书
  → 若 consentPending 非空：弹窗 → POST /me/informed-consent/{id}/confirm
  → GET /me/health-archive / GET /me/exercise/plan / GET /me/scales/psqi/status ...
```

**客服**
```
登录 → GET /cs/stats → GET /cs/patients?page=1
  → 详情：GET /cs/patients/{id}（含 AI 总结缓存，可能为 null）
  → 需要 AI 总结时：GET /cs/patients/{id}/ai-summary（同步生成并缓存 30 分钟）
  → 外呼：POST /cs/patients/{id}/call → 通话结束 POST /cs/patients/{id}/calls
```

**陪诊师**
```
登录 → GET /escort/stats → GET /escort/orders?status=WAIT_ACCEPT&page=1
  → 接单 PUT /escort/orders/{id}/accept → 服务日 PUT .../start
  → 打卡 POST .../checkin → 服务记录 POST .../service-record
  → GET /escort/schedules?month=yyyy-MM / GET /escort/users / GET /escort/profile-stats
```

**医生**
```
登录 → GET /doctor/patients?page=1
  → GET /doctor/patients/{id}/archive      // 10 模块，服务端自动写访问审计
  → GET /doctor/patients/{id}/conversation // 只读；不要生成发送/编辑入口
  → GET/PUT /doctor/profile
```

## 6. 关键业务流程（按顺序调用）

### 6.1 患者首页与告知书
1. `GET /me/home` → `{postopDays, advisorCard, monitor, escort, consentPending}`
2. `consentPending != null` → 弹窗展示 `content`（可能为空则用 `fileUrl/fileName`）
3. `POST /me/informed-consent/{id}/confirm`（幂等）→ 再取 `/me/home` 时 `consentPending=null`
4. 文章：`GET /app/articles?surgeryType=<patient.surgeryType>`（公开；精确匹配排前，含通用文章）

### 6.2 健康中心
- 体重：`GET /me/weight/records?range=7d|30d`；`POST /me/weight/records {weightKg(25~250), source?}`
- 体脂秤：`POST /me/devices {deviceType:"WEIGHT_SCALE",...}` → `POST /me/devices/{id}/sync {weightKg}`（当日 upsert，同一天只有一条 SCALE 记录）
- 睡眠仪：`POST /me/devices {deviceType:"SLEEP_MONITOR",...}` → `POST /me/devices/{id}/sync {battery?}`（仅更新同步时间/电量）
- 用药：`POST /me/medication {name, timesPerDay(1-3)}` → `GET /me/medication/today` → `POST /me/medication/{id}/take`（幂等）→ `DELETE /me/medication/{id}`
- 饮食分析：图片先 `POST /files/upload?dir=meal` → `POST /me/nutrition/analyze {imageUrls:[1..3], requestId?}`
  - 返回 `{recordId, recordDate, calories, protein, fat, carb, vitamin, assessment, analysisSource}`
  - `analysisSource=MOCK` 表示 AI 未开启/失败，展示时请标注“示例分析”
  - 每患者每天最多 30 次；同一 `requestId` 重复调用返回同一 `recordId`（幂等）
- 健康档案：`GET /me/health-archive`；OCR：`POST /me/medical-record/scan {imageUrls}` → `GET /me/medical-record/scan/{taskId}` → `POST /me/medical-record/confirm {taskId, basicInfoPatch?, labModule?, indicators?}`

### 6.3 运动康复（每日循环）
```
GET /me/exercise/plan                       // 服务端会把“昨天完成的动作”重置为 PENDING
POST /me/exercise/items/{id}/complete-set   // 每次一组；组数满 → NEED_EVAL
POST /me/exercise/items/{id}/finish         // 提前结束 → NEED_EVAL
POST /me/exercise/items/{id}/pause          // “感觉不适”→ PAUSED
GET  /me/exercise/eval-config               // 动态评估表单配置
POST /me/exercise/items/{id}/evaluation     // {answers:{...}, notes?}
    → 正常：COMPLETED；命中异常阈值：PAUSED（需人工解锁，前端展示“联系健康团队”）
```
- `answers` 必须按配置字段提交（slider 数值在 min~max、radio/checkbox 值在 options 内），否则 400。
- 客服/医生/管理员解锁：`PUT /patients/{id}/exercise/items/{itemId}/unlock`（小程序端通常由 CS 操作）。

### 6.4 PSQI v2
```
GET  /me/scales/psqi/status        // {state, progress:{completed,total:18}, draft?, latest?}
  state: UNASSESSED / IN_PROGRESS / COMPLETED / EXPIRED（最近有效提交>30天）
POST /me/scales/psqi/draft         // {answers, step} 断点续答
POST /me/scales/psqi/submissions   // {answers} → {valid, score, tier/tierText,
                                   //   levelTitle/interpretation, dimensions, topConcernDimensions}
```
- 答案键使用 PRD 命名：`bedTime/latencyMinutes/wakeTime/actualSleepHours`,
  `disturbances.{a_cantFallAsleep30min,b_wakeNightOrEarly,c_bathroomNight,d_coughOrSnore,e_feelCold,f_feelHot,g_badDreams,h_painDiscomfort,i_breathDifficult,j_otherReasons}`,
  `overallQuality/hypnoticMeds/daytimeSleepiness/daytimeEnthusiasm`。
- `latest` 同时返回 `levelTitle/interpretation/topConcernDimensions` 与旧别名 `tier/tierText/topConcerns`；新代码用前者。

### 6.5 陪诊（患者侧）
```
GET  /me/escort/caregivers                        // 陪诊师列表 + busySlots（明天起 10 天）
POST /me/escort/bookings                          // {caregiverId, serviceDate(明天~+10), period, departmentId?, remark?}
  period: MORNING / AFTERNOON / FULLDAY
  // 预约成功即扣 1 次；同一陪诊师同日：FULLDAY 与一切互斥、MORNING 互斥、AFTERNOON 互斥
POST /me/escort/bookings/{id}/cancel              // 仅 WAIT_ACCEPT/CONFIRMED 且 serviceDate>=今天；取消返还 1 次
GET  /me/escort                                   // {escortCount, activeBooking}
GET  /me/escort/bookings                          // 我的预约（含历史）
```

### 6.6 陪诊（陪诊师侧）
```
GET  /escort/orders?status=&page=&pageSize=       // 只返回自己的订单；默认不含 CANCELLED
PUT  /escort/orders/{id}/accept                   // WAIT_ACCEPT→CONFIRMED；过期订单 400
PUT  /escort/orders/{id}/start                    // 仅服务日当天可开始
POST /escort/orders/{id}/checkin {latitude,longitude,address,photos[]}   // IN_SERVICE；同日重复为幂等更新
POST /escort/orders/{id}/service-record {recoveryDescription, otherSituation?, specialFeedback?, taskCompleted}
  // taskCompleted: COMPLETED / INCOMPLETE；提交后订单归档 COMPLETED（INCOMPLETE 不返还次数、不累加人次）
GET  /escort/orders/{id}                          // 待服务：患者信息+riskLevel+notices；已服务：服务记录+打卡
GET  /escort/schedules?month=yyyy-MM              // {date: [{period,time,patientName,status}]}
GET  /escort/users                                // 订单关系患者 + 未读数
```

### 6.7 会话（健康团队管理，单会话多视角）
```
GET  /me/conversations                    // 患者：{conversations:[...], systemNotifications:[...]}
GET  /conversations/{id}/messages?beforeId=&size=   // 返回数组（非分页对象）；患者只见 AI/CS/CAREGIVER/SYSTEM/本人
POST /conversations/{id}/messages         // {type:TEXT|IMAGE|HEALTH_CARD, content?, imageUrl?, healthType?, clientSeq?}
  // 患者别名：POST /me/conversations/{id}/messages
PUT  /conversations/{id}/messages/{messageId} {newText}   // 仅作者本人；AI/系统消息锁定；留痕
POST /conversations/{id}/audit {entryPoint?}             // 陪诊师/客服显式上报；医生由服务端自动写
POST /me/conversations/{id}/manual-service               // 患者“人工服务”
POST /me/conversations/{id}/evaluation {targetRole:"CS", rating:1-5, tags:[], comment?}
```
- `HEALTH_CARD` 的 `healthType`：`DIET / EXERCISE / WEIGHT / BP_BG / SLEEP`。
- 医生**只读**：不要为其生成发送/编辑/已读按钮；医生用 `/doctor/patients/{id}/conversation`。
- ADMIN 在会话中发言会以 `senderType=CS` 落库（管理端代客服），前端无需特殊处理。
- 编辑后的消息带 `isEdited/editorName/editedAt/originalText`，UI 展示“已编辑”。

### 6.8 客服通话
```
POST /cs/patients/{id}/call            // 触发双呼，返回 {callId, virtualNumber}；不落库；30 秒防抖
POST /cs/patients/{id}/calls           // 提交通话记录（SUCCESS 时 durationSec 必填）
  // SUCCESS 且 pushToGroup=true → 沟通群出现 CALL_RECORD“康复进度同步”卡片
  // communicate_status: PENDING→FOLLOWED（不回退）；购买意向不在小程序写
GET  /cs/patients/{id}/phone-status    // {called, latestCallTime}
```

### 6.9 医生端
```
GET  /doctor/patients?keyword=&departmentId=&from=&to=&sort=asc|desc&page=&pageSize=
GET  /doctor/patients/{id}/archive     // 10 模块：basicInfo/attachments/diet/exercise/weight/
                                       // bloodGlucosePressure/tumorMarkers/bloodRoutine/liverNutrition/otherAttachments
POST /doctor/patients/{id}/attachments {category, fileName, fileSize?, url}   // url 只能 http(s) 或 /files/
DELETE /doctor/patients/{id}/attachments/{attId}   // 仅本人上传
```
- `weight.latest/trend7d` 同时含 `weight`（主字段）与 `weightKg`（别名）。
- 医生档案 7 天趋势 = 今天-6..今天；30 天 = 今天-29..今天；changeRate 为带符号百分比数字（如 `-12.5`，|x|>=30 为显著）。

## 7. 枚举字典（wire 值 → 中文标签）

| 域 | 字段 | 值 |
|---|---|---|
| 角色 | role | ADMIN 公司管理 / HOSPITAL_ADMIN 医院管理 / CS 客服 / CAREGIVER 陪诊师 / DOCTOR 医生 / PATIENT 患者 |
| 陪诊 | period | MORNING 上午 / AFTERNOON 下午 / FULLDAY 全天 |
| 陪诊 | status | WAIT_ACCEPT 待接单 / CONFIRMED 待服务 / IN_SERVICE 服务中 / COMPLETED 已服务 / CANCELLED 已取消 |
| 患者 | communicateStatus | PENDING 未沟通 / FOLLOWED 已沟通 / FOLLOW_UP 待跟进 / PURCHASED 已购买 |
| 患者 | purchaseIntent（只读） | HIGH 高 / MEDIUM 中 / LOW 低 / PURCHASED 已购 |
| 随访通话 | callStatus | SUCCESS 成功 / FAILED 失败 |
| 随访通话 | failReason | NO_ANSWER 无人接听 / WRONG_NUMBER 号码错误空号 / REJECTED 拒绝沟通 / INTERRUPTED 通话中断 |
| 随访通话 | medicationStatus | ON_TIME 按时用药 / OCCASIONAL_MISS 偶尔漏服 / STOPPED 已停药 / SELF_ADJUSTED 自行调整 |
| 随访通话 | recoveryStatus | GOOD 恢复良好 / FAIR 一般 / POOR 差 |
| 随访通话 | complianceStatus | FULL 完全遵守 / PARTIAL 部分遵守 / NONE 未遵守 |
| 随访通话 | servicePackageFeedback | USED_CORE 已使用核心服务 / NOT_USED 未使用 / ISSUES 使用中遇到问题 |
| 随访通话 | repurchaseIntent | INTERESTED 有意向 / NOT_INTERESTED 无意向 / UNSURE 不确定 |
| 运动 | item.status | PENDING 进行中 / NEED_EVAL 待评估 / COMPLETED 已完成 / PAUSED 已暂停 |
| 运动 | item.mode | REPS 计数 / TIMER 计时 |
| PSQI | state | UNASSESSED 未评估 / IN_PROGRESS 进行中 / COMPLETED 已完成 / EXPIRED 已过期 |
| 消息 | type | TEXT / IMAGE / HEALTH_CARD / CALL_RECORD |
| 消息 | healthType | DIET 饮食 / EXERCISE 运动 / WEIGHT 体重 / BP_BG 血压血糖 / SLEEP 睡眠 |
| 会话 | status | ACTIVE / CLOSED |
| 设备 | deviceType | SLEEP_MONITOR 睡眠仪 / WEIGHT_SCALE 体脂秤 |
| 体重 | source | MANUAL 手动 / SCALE 体脂秤同步 |
| 附件 | category | 检查报告 / 影像资料 / 病理资料 / 饮食记录 / 运动记录 / 其他（中文原值） |
| 通知 | type | SYSTEM 系统 / ARTICLE 资料更新 / MANUAL_SERVICE 人工服务 / RISK 风险 |
| 风险 | level/status/source | HIGH/MEDIUM/LOW；PENDING/HANDLED/CLOSED；AI_CHAT/HEALTH_DATA |

## 8. 文件上传

```
POST /files/upload?dir=meal      multipart: file=<binary>       // 需 JWT；返回 URL 字符串
POST /files/uploads?dir=medical  multipart: files=<binary...>   // 批量
GET  /files/{dir}/{filename}                                    // 公开，无需鉴权
```
- `dir` 白名单：`common / meal / diet / medical / avatar / checkin / attachment / chat`。
- 单文件 20MB、单请求 100MB；扩展名白名单：`jpg/jpeg/png/gif/webp/pdf/doc/docx/xls/xlsx`。
- 营养分析需要可公网访问的图片 URL：生产 local 存储需配置 `FILE_PUBLIC_BASE_URL`。

## 9. WebSocket

```
ws://{host}/api/v1/ws?token=<accessToken>
```
已实现事件（**只依赖这三个**）：
- `{"type":"message.new","data":<Message 实体>}`
- `{"type":"notification.new","data":<Notification 实体>}`
- `{"type":"pong"}`
> `manual.service.requested`、`risk.alert`、`ai.typing` 为**规划/未实现**，不要编码依赖。
> 单机实现；断线需重连并用 REST 拉取补偿（`beforeId` 游标）。

## 10. 不要调用的接口

以下在 `docs/03` 中标注 **未实现（后续）**，调用会得到 404/业务错误：
`GET /dict/{doctors,hospitals,areas,departments}/{id}`、`GET /dict/doctors/options`、`GET /patients/{id}/profile`、`GET /patients/summary`、`GET /follow-up/tasks/{id}`、`GET /risk-alerts/{id}`、`GET /kb/entries/{id}`、`GET /kb/categories`、`GET /conversations/{id}/ai-summary`（用 `/cs/patients/{id}/ai-summary`）、`GET /app/overview`、`POST /me/medical-record/upload`、`POST /me/health-records/{id}/sync-to-group`、`POST /escort/bookings/{id}/assign`、`DELETE /health-records/{id}`。

**legacy / 已下线**（不要在新代码中使用）：
- `GET /me/health-manager`（用 `/me/home.advisorCard`）
- `GET /me/health-records`、`/patients/{id}/health-records`（新代码用 `/me/weight/records`、`/me/medication/*`、`/me/health-archive`）
- `POST /conversations/{id}/evaluation`（用 `/me/conversations/{id}/evaluation`）
- `PUT /me/medication/reminder`、`PUT /escort/config`（固定返回 400）

## 11. 生成 TypeScript 类型的建议

```bash
# swagger.json 为 Swagger 2.0；二选一：
npx openapi-typescript swagger.json -o src/api/schema.d.ts     # 2.0 需先转 3.0，或用下面的工具
npx swagger-typescript-api -p swagger.json -o src/api --modular
```
- 生成后再套一层业务封装（不要直接把生成的类型当请求函数用）：

```ts
// src/api/request.ts
import JSONbig from 'json-bigint'
const client = axios.create({
  baseURL: 'http://115.159.151.158:8081/api/v1',
  transformResponse: [d => JSONbig({ storeAsString: true }).parse(d)],
})
client.interceptors.request.use(cfg => {
  const t = getAccessToken(); if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
client.interceptors.response.use(async res => {
  const { code, message, data } = res.data
  if (code === 0) return data
  if (code === 401) { await refreshToken(); return client(res.config) }  // 只重试一次，防死循环
  if (code === 402) { clearAuth(); location.href = '/login'; throw new ApiError(code, message) }
  if (code === 400 || code === 403) { toast(message); throw new ApiError(code, message) }
  toast('服务异常，请稍后重试'); throw new ApiError(code, message)
})
```
- 命名：请求体 `XxxRequest`，响应体 `Xxx`；枚举用 `as const` + 中文标签映射表（不要在组件里散落中文字符串）。
- 日期：服务端返回 `yyyy-MM-dd HH:mm:ss` 字符串，直接展示；需要计算时用 `dayjs(str)`。

## 12. 契约更新流程（重要）

- `swagger.json` 与 `API_INDEX.md` 都是**生成物**：接口变更后由后端执行
  `cd server && python3 tools/gen_swagger.py`，会同时更新
  `server/swagger.json`、`frontend-api-kit/swagger.json`、`frontend-api-kit/API_INDEX.md`。
- 校验：`python3 tools/gen_swagger.py --check`（含 API 索引）与
  `python3 tools/check_swagger_paths.py`（Controller ↔ swagger 路由一致性）。
- **不要手改** `swagger.json` / `API_INDEX.md`；新增接口先在后端实现并重新生成。
- 前端 AI 代理工作顺序：`AGENTS.md`（本文件）→ `API_INDEX.md`（找接口）→ `swagger.json`（看字段）→ `docs/03-接口设计.md`（看语义与实现状态）。

## 13. 联调自检清单

- [ ] 所有请求经统一封装：`code=0` 取 `data`；401 刷新重试一次；402 跳登录
- [ ] 雪花 ID 用字符串处理（json-bigint 或后端 Long→String）
- [ ] 患者首页处理 `consentPending`（弹窗 + confirm 幂等）
- [ ] 陪诊预约校验可约窗口（明天起 10 天）与时段互斥；取消才有返还
- [ ] 陪诊师订单列表分页结构是 `{list,total,page,pageSize}`（不是数组）
- [ ] 医生端无任何写会话入口
- [ ] 营养分析展示 `analysisSource`，MOCK 时标注“示例分析”
- [ ] 文件上传带 JWT；读取可直接用返回 URL
- [ ] 不使用“未实现/legacy”清单里的接口
- [ ] 接口变更后运行 `gen_swagger.py --check` 确认契约未漂移
