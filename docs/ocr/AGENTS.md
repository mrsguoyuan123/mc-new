# AGENTS.md — OCR 自动分类/检验自动入库（给 AI 编码代理）

> 只覆盖 2026-11-10 OCR 改造相关接口。完整小程序接口见 `../frontend-api-kit/AGENTS.md`。
> 契约以同目录 `ocr-swagger.json` 与服务端 Controller 为准；本文档解释**调用顺序与坑位**。

## 0. 一句话流程

```
上传图片 → POST /me/medical-record/scan {imageUrls}
        → 每 2s GET /me/medical-record/scan/{taskId}
        → result.docType
           LAB_REPORT     → 检验已自动入库，展示结果即可
           MEDICAL_RECORD → 用 fields 预览，患者确认后 POST /me/medical-record/confirm
           MIXED          → 检验已自动入库；病历部分继续 confirm
           UNKNOWN        → 提示重拍/手工录入
```

**不要传 `scanType`**。它已被忽略，传了不报错但没有任何作用。

## 1. 环境/鉴权

- Base：`http://115.159.151.158:8081/api/v1`（dev）
- Header：`Authorization: Bearer <patient accessToken>`
- 联调 token：`GET /auth/dev-tokens` → `data.patient`（仅 dev，患者 910005）
- 所有接口 HTTP 恒 200，业务看 `code`：0 成功；400 业务错误；401 token 失效；402 需重登；403 无权限；500 服务端异常。

## 2. 接口清单

| 方法 | 路径 | 作用 | 备注 |
|---|---|---|---|
| POST | `/me/medical-record/scan` | 创建异步 OCR 任务 | body `{imageUrls:[1-5]}`；只接受 `/files/medical/...` |
| GET | `/me/medical-record/scan/{taskId}` | 轮询结果 | `PENDING/SUCCESS/FAILED` |
| POST | `/me/medical-record/scan/{taskId}/apply` | 重试检验自动入库 | 幂等；`data.applied[]` |
| POST | `/me/medical-record/confirm` | 确认病历字段/手工补录检验 | `basicInfoPatch` 或 `labModule+indicators` |
| GET | `/me/health-archive?range=all\|30d\|7d` | 读健康档案 | 检验报告入库后在这里看 |
| GET | `/me/health-records?type=...` | legacy 读取 | 新代码优先 health-archive |

上传：`POST /files/upload?dir=medical`（multipart `file`，需 JWT）→ `data` 为 `/files/medical/xxx.png`。
不要把外部 URL 传给 scan（服务端拒绝，防 SSRF）。

## 3. 结果字段（SUCCESS）

```jsonc
{
  "docType": "MEDICAL_RECORD|LAB_REPORT|MIXED|UNKNOWN",
  "classifyConfidence": 0.95,
  "fields": { "name": "王五", "age": 52 },       // 仅病历字段
  "confidence": { "name": 0.92 },
  "missing": ["idCard"],
  "labReports": [
    {
      "labModule": "TUMOR_MARKER|BLOOD_ROUTINE|LIVER_FUNCTION|OTHER",
      "recordDate": "2021-06-30",
      "dateInferred": false,                    // true=报告没日期，服务端按今天兜底
      "indicators": [
        {
          "name": "CEA", "label": "癌胚抗原(CEA)",
          "value": 1.59, "qualifier": null,     // <x => LT，>x => GT
          "unit": "ng/mL", "referenceRange": "<4.70",
          "confidence": 0.95
        }
      ],
      "autoSaved": true,
      "action": "PENDING|INSERTED|UPDATED|FAILED",
      "recordId": 2119829083634864129,          // 雪花ID，按字符串处理
      "applyError": null
    }
  ]
}
```

## 4. 分流规则（必须按此实现）

### 4.1 `LAB_REPORT`

- 检验指标已自动 upsert `health_record`，**不要再调 confirm**。
- `autoSaved=true` 且 `action=INSERTED|UPDATED`：展示“已写入健康档案”，可跳转 `/me/health-archive`。
- `action=PENDING`：后台自动入库尚未完成（SUCCESS 后短暂窗口），**再轮询一次**或调用 `apply`。
- `action=FAILED` / `applyError` 非空：展示错误，调 `POST /scan/{taskId}/apply` 重试；成功后刷新。

### 4.2 `MEDICAL_RECORD`

- 用 `fields` 渲染预览，患者勾选/修改。
- 提交 `POST /me/medical-record/confirm`：

```json
{
  "taskId": 2119829090547077122,
  "basicInfoPatch": { "name": "王五", "age": 52, "phone": "13800000005" }
}
```

- 只提交患者实际勾选的字段；`phone/idCard/name` 属登录身份字段，**默认不勾选**，患者主动选择后再提交。
- **不要**把检验报告抬头的姓名/年龄/诊断行自动写入患者档案。

### 4.3 `MIXED`

- `labReports` 已自动入库；**只对 `fields` 走 confirm**，不要重复提交 `labModule/indicators`。
- 服务端会把“只有姓名/性别/年龄/报告诊断行抬头 + 检验表格”的报告归一为 `LAB_REPORT`，正常不会出现这种需要确认的 MIXED；若出现，按字段确认。

### 4.4 `UNKNOWN`

- 不自动入库；展示 `note`/`failReason`，引导重拍或手工录入。
- 不要展示假识别结果。

## 5. 手工补录检验指标（兼容入口）

一般不需要；只有前端让患者手工修正指标时才用：

```json
{
  "taskId": 123,
  "labModule": "TUMOR_MARKER",
  "recordDate": "2021-06-30",
  "indicators": [
    { "name": "CEA", "label": "癌胚抗原(CEA)", "value": 1.59,
      "qualifier": null, "unit": "ng/mL", "referenceRange": "<4.70" }
  ]
}
```

- `recordDate` 选填，默认今天；未来日期 400。
- 写入是 **upsert**：同患者+模块+报告日期+`recorded_by=PATIENT` 整条替换；不会覆盖客服/后台 `STAFF` 记录。
- `indicators[].name` 不能是 `date`。

## 6. 必读坑位

1. **雪花 ID**：`taskId/recordId` 是 19 位数字，超过 JS `Number.MAX_SAFE_INTEGER`。请求层用 `json-bigint({storeAsString:true})` 或按字符串处理；不要做数值运算。
2. **action=PENDING 是正常中间态**：OCR SUCCESS 先返回，随后后台写库并更新 action。看到 PENDING 时再轮询一次（推荐 1-2s 后）或调 apply。
3. **同日同模块 upsert**：同一天同一模块再次上传会整条替换（含附件、单位/参考范围）；这是预期行为，不是重复数据。
4. **不覆盖 STAFF**：客服/后台同一天同一模块手工录入的记录不会被患者扫描覆盖；档案里可能同时存在两条，需客服核对。
5. **日期**：`recordDate` 取报告上的检验日期；`dateInferred=true` 表示报告没日期、按今天兜底，UI 可标注“日期为识别默认值”。
6. **单位/参考范围可能为空**：报告照片没拍到单位列时 `unit=null`，不要编造；`qualifier=LT/GT` 时展示为 `<`/`>`。
7. **OTHER 暂不展示**：不属于三大模块的指标已入库但 `/me/health-archive` 不展示。
8. **scanDocs**：纯检验报告不再进入 `basicInfo.scanDocs`；原图在对应 `health_record.attachments_json`。旧任务（`doc_type=null`）仍会显示在 scanDocs，不会自动回填。
9. **旧 `scanType`**：忽略；不要新增该字段。
10. **AI 未启用**：`scan` 直接 400“OCR 未启用，请手工录入”；不要 mock 假结果。
11. **一次 1-5 张**：超过 5 张或非 `/files/medical/` 地址会 400。
12. **上传返回 URL**：`/files/upload?dir=medical` 的 `data` 是 `/files/medical/xxx`；直接放进 `imageUrls`。

## 7. 推荐前端状态机

```
IDLE → UPLOADING → SCANNING(PENDING) → SUCCESS
                                      ├─ LAB_REPORT → DONE（可查看档案）
                                      ├─ MEDICAL_RECORD → PREVIEW → CONFIRM → DONE
                                      ├─ MIXED → PREVIEW(仅fields) → CONFIRM → DONE
                                      └─ UNKNOWN → RETRY/MANUAL
SCANNING → FAILED → RETRY（重新 scan，不自动重试旧任务）
```

- 轮询间隔 2s，超时建议 180s；页面切后台/重进时用 taskId 恢复轮询。
- `FAILED` 时不要重复轮询同一个 taskId；重新发起 scan 或引导手工录入。

## 8. 联调样例

Dev 患者 token 与 4 张样例图（仅 dev 测试数据）：

```bash
BASE=http://115.159.151.158:8081/api/v1
TOKEN=$(curl -s "$BASE/auth/dev-tokens" | jq -r '.data.patient')

# 血常规（自动入库，25 项，日期 2013-07-25）
curl -s -X POST "$BASE/me/medical-record/scan" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"imageUrls":["/files/medical/2a736579228b4339924c9ab2f37aeef1.png"]}'

# 肿瘤标志物（自动入库，12 项）
curl -s -X POST "$BASE/me/medical-record/scan" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"imageUrls":["/files/medical/44fadf48f49e41cb87c3f336f7d4ff1c.png"]}'
```

轮询：

```bash
curl -s "$BASE/me/medical-record/scan/<taskId>" -H "Authorization: Bearer $TOKEN"
```

档案验证：

```bash
curl -s "$BASE/me/health-archive?range=all" -H "Authorization: Bearer $TOKEN"
```

> 这 4 张图属于 dev 测试数据（不同患者/医院），只用于验证分类与入库；正式联调请上传患者本人资料。
