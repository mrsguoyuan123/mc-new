# OCR API Kit（病历/检验报告自动分类与入库）

本 kit 是 2026-11-10 OCR 改造的独立交付包，面向**患者小程序前端**与联调 Agent。

覆盖接口：

- `POST /me/medical-record/scan` — 上传图片创建异步 OCR 任务
- `GET /me/medical-record/scan/{taskId}` — 轮询分类/抽取/自动入库结果
- `POST /me/medical-record/scan/{taskId}/apply` — 自动入库失败后幂等重试
- `POST /me/medical-record/confirm` — 普通病历字段确认回填（检验报告一般不需要）

## 核心变化（必须先读）

1. **不再需要 `scanType`**。前端只传 `imageUrls`，视觉模型自动判断 `docType`：
   `MEDICAL_RECORD` / `LAB_REPORT` / `MIXED` / `UNKNOWN`。
2. **检验报告自动入库**：`LAB_REPORT` / `MIXED` 的检验指标在 OCR 成功后自动写入
   `health_record`，前端不需要再调 confirm。
3. **普通病历仍需确认**：`MEDICAL_RECORD`（以及 `MIXED` 的病历部分）返回 `fields` 预览，
   患者确认后调 `POST /confirm {taskId, basicInfoPatch}`。
4. 检验指标按 `患者 + 模块 + 报告日期 + PATIENT 来源` **upsert**：
   同日同模块重复上传会整条替换，不会产生重复趋势；不覆盖客服/后台录入的 `STAFF` 记录。
5. `basicInfo.scanDocs` 不再混入纯检验报告；检验报告原图挂在对应 `health_record` 附件里。

## 文件

| 文件 | 用途 |
|---|---|
| `AGENTS.md` | 给 AI 编码 Agent 的规则、字段、坑位（优先读） |
| `01-OCR接口联调指南.md` | 人类可读的完整联调文档（流程/示例/错误码/边界） |
| `ocr-swagger.json` | 仅含 OCR 4 个接口的 Swagger 2.0，可直接导入 Apifox/Postman |
| `examples/ocr-client.ts` | TypeScript 请求封装 + 轮询/分流示例 |
| `smoke_ocr.py` | 远端 dev 冒烟脚本（只读校验 + 触发自动入库，不确认病历） |
| `index.html` | 可直接打开/分享的 HTML 阅读页（与 `01` 文档同内容） |

完整 API 见 `../frontend-api-kit/swagger.json`；登录/鉴权见
`../frontend-api-kit/05-前端登录与鉴权联调.md`。

## 环境

| 项 | 值 |
|---|---|
| Dev 地址 | `http://115.159.151.158:8081/api/v1` |
| 鉴权 | `Authorization: Bearer <patient accessToken>` |
| 统一响应 | HTTP 恒 200，业务看 `code`：0 成功 / 400 业务错误 / 401 token 失效 / 402 需重登 / 403 无权限 / 500 服务端错误 |
| Dev 患者 token | `GET /auth/dev-tokens` → `data.patient`（仅 dev，患者 910005） |
| 上传 | `POST /files/upload?dir=medical`（multipart `file`，需登录，返回 `data` 为 `/files/medical/...`） |

## 最快跑通

```bash
# 1) 上传一张病历/检验报告照片（或直接用 dev 样例 URL，见 01 文档）
curl -s -X POST 'http://115.159.151.158:8081/api/v1/files/upload?dir=medical' \
  -H "Authorization: Bearer $PATIENT_TOKEN" -F 'file=@/path/to/report.png'

# 2) 创建 OCR 任务
curl -s -X POST 'http://115.159.151.158:8081/api/v1/me/medical-record/scan' \
  -H "Authorization: Bearer $PATIENT_TOKEN" -H 'Content-Type: application/json' \
  -d '{"imageUrls":["/files/medical/xxx.png"]}'

# 3) 每 2s 轮询，直到 SUCCESS/FAILED（OCR 通常 10-40s）
curl -s 'http://115.159.151.158:8081/api/v1/me/medical-record/scan/<taskId>' \
  -H "Authorization: Bearer $PATIENT_TOKEN"

# 4) 按 result.docType 分流：LAB_REPORT 已自动入库；MEDICAL_RECORD 预览后 confirm
```

> 请使用自己上传的图片做正式联调；`01-OCR接口联调指南.md` 里的 4 个 dev 样例 URL 只用于验证环境。
> 不要把检验报告抬头的姓名/年龄/诊断行拿去覆盖患者档案。

## 契约来源

- `ocr-swagger.json` 由 `server/swagger.json` 过滤生成（2026-11-10）。
- 服务端实现：`server/src/main/java/com/junyuan/followup/ocr/` 与
  `health/service/LabRecordUpsertService.java`。
- 设计稿：`docs/superpowers/specs/2026-11-10-ocr-auto-classify-design.md`。
