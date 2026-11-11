# OCR 接口联调指南（2026-11-10）

> 适用：患者小程序“扫一扫添加病历/检验报告”。
> 接口契约：`ocr-swagger.json`；完整 API：`../frontend-api-kit/swagger.json`。
> 服务端已部署到 dev：`http://115.159.151.158:8081/api/v1`。

## 1. 这次改了什么

| 旧行为 | 新行为 |
|---|---|
| 前端传 `scanType` 区分病历/检验报告 | 不传；LLM 自动返回 `docType` |
| 扫描结果只返回附件1病历字段 | 同时返回病历字段 + `labReports`（模块/日期/全部指标） |
| 检验指标要前端手工 confirm | `LAB_REPORT/MIXED` 的检验指标 OCR 成功后**自动入库** |
| 同日重复上传会重复新增 | 同患者+模块+报告日期 upsert，整条替换 |
| 检验报告也混在 `scanDocs` | 纯检验报告不再进入 `scanDocs`，原图挂 `health_record` 附件 |

## 2. 调用流程

```
[1] 上传图片
    POST /files/upload?dir=medical  (multipart file)
    → data = "/files/medical/xxx.png"

[2] 创建 OCR 任务
    POST /me/medical-record/scan
    { "imageUrls": ["/files/medical/xxx.png", ...] }   // 1-5 张
    → data = { taskId, status: "PENDING" }

[3] 轮询
    GET /me/medical-record/scan/{taskId}
    → PENDING（无 result）/ SUCCESS / FAILED

[4] 按 result.docType 分流
    LAB_REPORT     → 检验已自动入库，展示即可
    MEDICAL_RECORD → fields 预览 → POST /me/medical-record/confirm
    MIXED          → 检验已自动入库；fields 走 confirm
    UNKNOWN        → 提示重拍/手工录入
```

轮询建议：每 2s 一次，最多 180s；OCR 通常 10-40s。`FAILED` 不要自动重试旧任务，重新发 scan 或手工录入。

## 3. 创建任务

```http
POST /api/v1/me/medical-record/scan
Authorization: Bearer <patient token>
Content-Type: application/json

{
  "imageUrls": [
    "/files/medical/2a736579228b4339924c9ab2f37aeef1.png"
  ]
}
```

```json
{
  "code": 0,
  "message": "ok",
  "data": { "taskId": 2119828885932150786, "status": "PENDING" }
}
```

规则：

- 1-5 张；只接受本系统 `/files/medical/...`（或同源绝对地址），外部 URL 400。
- `scanType` 已忽略；不要传。
- AI 未启用/未配置 key：直接 400“OCR 未启用，请手工录入”，不会创建任务。
- `taskId` 是雪花 ID（19 位），前端用 `json-bigint` 或字符串处理。

## 4. 轮询结果

```http
GET /api/v1/me/medical-record/scan/2119828885932150786
Authorization: Bearer <patient token>
```

### 4.1 `PENDING`

```json
{ "code": 0, "message": "ok",
  "data": { "taskId": 2119828885932150786, "status": "PENDING",
            "result": null, "failReason": null, "note": "OCR 结果仅供辅助录入，请核对后确认" } }
```

### 4.2 `SUCCESS` — 检验报告 `LAB_REPORT`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "taskId": 2119828885932150786,
    "status": "SUCCESS",
    "result": {
      "docType": "LAB_REPORT",
      "classifyConfidence": 0.96,
      "fields": { "name": "张三", "age": "31岁" },
      "confidence": { "name": 0.9, "age": 0.9 },
      "missing": [],
      "labReports": [
        {
          "labModule": "BLOOD_ROUTINE",
          "recordDate": "2013-07-25",
          "dateInferred": false,
          "indicators": [
            {
              "name": "WBC",
              "label": "白细胞数目",
              "value": 7.73,
              "qualifier": null,
              "unit": "10^9/L",
              "referenceRange": "4.00 - 10.00",
              "confidence": 0.98
            },
            {
              "name": "CA50",
              "label": "糖类抗原50(CA-50)",
              "value": 4.8,
              "qualifier": "LT",
              "unit": "U/mL",
              "referenceRange": "<20.00",
              "confidence": 0.95
            }
          ],
          "autoSaved": true,
          "action": "INSERTED",
          "recordId": 2119828975862222849,
          "applyError": null
        }
      ]
    },
    "failReason": null,
    "note": "OCR 结果仅供辅助录入，请核对后确认"
  }
}
```

关键字段：

- `docType=LAB_REPORT`：检验报告；`labReports` 至少 1 条。
- `autoSaved=true` + `action=INSERTED|UPDATED`：已写入 `health_record`，**不需要 confirm**。
- `action=PENDING`：后台写库尚未完成（SUCCESS 后短暂窗口）；再轮询一次或调 apply。
- `action=FAILED` / `applyError`：写库失败；调 `POST /scan/{taskId}/apply` 重试。
- `recordDate` 取报告日期；`dateInferred=true` 表示报告没识别到日期，按今天兜底。
- `qualifier=LT` 表示 `<x`，`GT` 表示 `>x`；展示时还原为 `<`/`>`。
- `unit` 可能为 `null`（照片没拍到单位列），不要编造。

### 4.3 `SUCCESS` — 普通病历 `MEDICAL_RECORD`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "taskId": 2119829090547077122,
    "status": "SUCCESS",
    "result": {
      "docType": "MEDICAL_RECORD",
      "classifyConfidence": 0.9,
      "fields": { "name": "孙某", "gender": "男", "age": 50, "admissionDiagnosis": "湿疹" },
      "confidence": { "name": 0.9 },
      "missing": ["idCard", "phone"],
      "labReports": []
    },
    "failReason": null,
    "note": "OCR 结果仅供辅助录入，请核对后确认"
  }
}
```

前端用 `fields` 渲染预览；患者勾选/编辑后 confirm。`missing`/`confidence` 可用来提示低置信度字段。

### 4.4 `SUCCESS` — 混合文档 `MIXED`

`fields` 与 `labReports` 同时非空。检验部分已自动入库；**只对 fields 走 confirm**，不要重复提交 labModule/indicators。

> 服务端会把“只有姓名/性别/年龄/报告诊断行抬头 + 检验表格”的报告归一为 `LAB_REPORT`，正常不会出现需要确认的 MIXED。

### 4.5 `SUCCESS` — `UNKNOWN`

```json
{ "docType": "UNKNOWN", "fields": {}, "labReports": [] }
```

不自动入库；提示重拍/手工录入。

### 4.6 `FAILED`

```json
{ "code": 0, "message": "ok",
  "data": { "taskId": 123, "status": "FAILED", "result": null,
            "failReason": "模型输出被截断", "note": "OCR 结果仅供辅助录入，请核对后确认" } }
```

展示 `failReason`，引导重拍或手工录入；不要 mock 假结果。

## 5. 病历确认

```http
POST /api/v1/me/medical-record/confirm
Authorization: Bearer <patient token>
Content-Type: application/json

{
  "taskId": 2119829090547077122,
  "basicInfoPatch": {
    "name": "孙某",
    "gender": "男",
    "age": 50
  }
}
```

- `basicInfoPatch` 部分更新：只覆盖传入字段；未传字段保持原值。
- `phone/idCard/name` 属登录身份字段，**默认不勾选**，患者主动选择后再提交。
- **不要**把检验报告抬头的姓名/年龄/诊断行自动写入患者档案。
- 返回 `data=null`，`code=0` 即成功。

## 6. 自动入库失败重试

```http
POST /api/v1/me/medical-record/scan/{taskId}/apply
Authorization: Bearer <patient token>
```

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "applied": [
      {
        "labModule": "TUMOR_MARKER",
        "recordDate": "2021-06-30",
        "dateInferred": false,
        "action": "UPDATED",
        "recordId": 2119829083634864129,
        "autoSaved": true,
        "applyError": null
      }
    ]
  }
}
```

- 幂等：重复调用会再次 upsert（通常 `UPDATED`），不会新增重复记录。
- 任务没有可入库的检验报告（`MEDICAL_RECORD/UNKNOWN`）→ 400。
- 任务未 `SUCCESS` → 400。

## 7. upsert 语义（重要）

- 键：`patient_id + labModule + recordDate + recorded_by=PATIENT`。
- 同日同模块重复上传：**整条替换** `metrics/targets/元数据/附件`；`recordId` 不变，`action=UPDATED`。
- 不覆盖客服/后台 `recorded_by=STAFF` 的同日记录。
- 不同日期即使同模块也各自保留，用于趋势。
- 不属于三大模块的指标写 `type=OTHER`，暂不在健康档案展示。

## 8. 读健康档案

```http
GET /api/v1/me/health-archive?range=all|30d|7d
Authorization: Bearer <patient token>
```

- `range` 默认 `all`；`30d`=今天-29~今天；`7d`=今天-6~今天。
- 只过滤三个检验模块的 `records/historyTrend`；窗口内无记录返回空，不回退旧记录。
- 指标结构：

```json
{
  "name": "WBC",
  "label": "白细胞数目",
  "value": 7.73,
  "qualifier": null,
  "unit": "10^9/L",
  "referenceRange": "4.00 - 10.00",
  "status": "normal",
  "previousValue": null,
  "changeRate": null,
  "changeSignificant": false
}
```

- `previousValue/changeRate` 由服务端对同指标上一条记录计算；首条为 null。
- 检验报告原图在记录的 `sourceDocUrl/sourceDocName`（来自附件）。
- `basicInfo.scanDocs` 只保留病历/MIXED 任务图片；纯检验报告不在这里。

## 9. 错误码

| code | 含义 | 前端处理 |
|---|---|---|
| 0 | 成功 | 取 `data` |
| 400 | 参数/业务错误（含 AI 未启用、图片非法、未来日期） | 弹 `message`，不跳登录 |
| 401 | access token 失效 | refresh 后重试一次 |
| 402 | refresh 失效 | 清凭证跳登录 |
| 403 | 无权限 | 提示无权限 |
| 500 | 服务端异常 | 通用错误提示 |

HTTP 状态恒为 200，业务语义只看 `code`。

## 10. Dev 样例图（仅联调测试）

以下 4 个 URL 已存在于 dev COS，可直接传给 `scan.imageUrls`：

| 用途 | URL |
|---|---|
| 血常规（25 项，2013-07-25） | `/files/medical/2a736579228b4339924c9ab2f37aeef1.png` |
| 肿瘤标志物（12 项，日期不可见） | `/files/medical/44fadf48f49e41cb87c3f336f7d4ff1c.png` |
| 门诊病历 1 | `/files/medical/2b049b945bbc4409b34e7672c773a446.png` |
| 门诊病历 2 | `/files/medical/53dcdca5a1f245c3ac719121d1b089fe.png` |

这些图片属于不同医院/患者的测试数据，**不要**在正式流程中使用，也不要确认它们的病历字段到患者档案。

## 11. 已验证结果（2026-11-10 dev 实测）

- 血常规：`LAB_REPORT`，`BLOOD_ROUTINE` 25 项，`recordDate=2013-07-25`，`autoSaved=true`。
- 肿瘤标志物：`LAB_REPORT`，`TUMOR_MARKER` 12 项，`dateInferred=true`（图无日期），`autoSaved=true`。
- 重复上传肿瘤标志物：`action=UPDATED`，同一 `recordId`，无重复趋势。
- `apply` 重试：`UPDATED`，同一 `recordId`，保留 `dateInferred`。
- 两张门诊病历：`MEDICAL_RECORD`，`labReports=[]`，不自动写 patient。
- 档案：`tumorMarkers` 1 条/12 指标，`bloodRoutine` 1 条/25 指标；`range=30d/7d` 正确排除 2013 记录。
- `scanDocs` 仍为旧 11 张，纯检验报告未混入。

## 12. 已知限制

- 报告没有可见日期时按今天入库（`dateInferred=true`），历史趋势可能被归到当天；需要患者/客服手工修正时走 confirm 的 `recordDate`。
- 单位/参考范围依赖报告照片是否拍到；缺失时为 `null`。
- 指标名做了常见别名归一化（CEA/WBC/ALT 等）；少见的跨医院中文名可能形成独立趋势。
- 旧 OCR 任务（`doc_type=null`）不会自动重分类/回填；需要重新上传。
- `OTHER` 指标已入库但档案暂不展示。
- 同日同模块整条替换会覆盖当天该模块的患者来源记录（用户已确认此产品规则）。
