# 接口索引（自动生成）

> 本文件由 `server/tools/gen_api_guide.py` 从 swagger 契约自动生成，**请勿手改**。
> 当前：159 个路径 / 198 个操作；Base URL：`/api/v1`。
> 重新生成：`cd server && python3 tools/gen_swagger.py`；校验：`python3 tools/gen_swagger.py --check`。
> 角色流程、枚举、易错点与代码生成约定见同目录 `AGENTS.md`；完整字段以 `swagger.json` 为准。

## 目录

- [auth](#auth)（15）
- [user](#user)（10）
- [dict](#dict)（21）
- [patient](#patient)（10）
- [health](#health)（34）
- [conversation](#conversation)（19）
- [kb](#kb)（5）
- [followup](#followup)（7）
- [cs](#cs)（9）
- [doctor](#doctor)（7）
- [escort](#escort)（17）
- [risk](#risk)（4）
- [staff](#staff)（11）
- [hospital](#hospital)（3）
- [app](#app)（20）
- [notification](#notification)（3）
- [file](#file)（3）

## auth

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/accounts/login-logs` | 登录日志（公司管理） | JWT |  |
| GET | `/accounts/operation-logs` | 操作日志（公司管理） | JWT |  |
| PUT | `/accounts/security` | 安全选项（骨架占位） | JWT |  |
| GET | `/auth/dev-tokens` | dev 免登静态 token（仅 dev profile 生效，生产 404） | 公开 |  |
| POST | `/auth/login` | 员工账号密码登录（PC后台/手机端客服陪诊师医生医院管理） | 公开 |  |
| POST | `/auth/logout` | 登出（注销 refresh token；需携带 access token） | JWT |  |
| GET | `/auth/me` | 当前登录用户（角色/数据范围） | JWT |  |
| PUT | `/auth/password` | 修改自己的密码（员工/患者共用） | JWT |  |
| POST | `/auth/refresh` | 刷新令牌 | 公开 |  |
| POST | `/auth/register` | 患者注册（手机号验证码，仅患者可自助注册） | 公开 |  |
| POST | `/auth/sms-code` | 发送短信验证码（60秒限频） | 公开 |  |
| POST | `/auth/sms-login` | 患者手机号验证码登录 | 公开 |  |
| POST | `/auth/wx-login` | 微信一键登录（患者） | 公开 |  |
| GET | `/me/settings` | 系统设定（骨架占位） | JWT |  |
| PUT | `/me/settings` | 更新系统设定（骨架占位） | JWT |  |

## user

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/me/health-manager` | 我的健康管家：主管医生+客服信息（代码仍保留，文档已标记移除） | JWT | deprecated |
| GET | `/me/home` | 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书） | JWT |  |
| GET | `/me/informed-consent` | 我的告知书列表（按术式匹配，含已确认标记） | JWT |  |
| POST | `/me/informed-consent/{id}/confirm` | 确认告知书（幂等） | JWT |  |
| GET | `/me/medical-record` | 我的病历 | JWT |  |
| POST | `/me/medical-record/confirm` | 确认 OCR 结果回填病历/检验指标（部分更新） | JWT |  |
| POST | `/me/medical-record/scan` | 扫一扫添加：病历照片→OCR识别（附件1样表结构化） | JWT |  |
| GET | `/me/medical-record/scan/{taskId}` | OCR 识别结果（样表字段+置信度） | JWT |  |
| GET | `/me/profile` | 我的个人基本信息 | JWT |  |
| PUT | `/me/profile` | 编辑我的信息（白名单字段+手机号验证码） | JWT |  |

## dict

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/dict/areas` | 院区列表 | JWT |  |
| POST | `/dict/areas` | 新增院区（公司管理） | JWT |  |
| PUT | `/dict/areas/{id}` | 修改院区（公司管理） | JWT |  |
| DELETE | `/dict/areas/{id}` | 删除院区（公司管理） | JWT |  |
| GET | `/dict/departments` | 科室列表 | JWT |  |
| POST | `/dict/departments` | 新增科室（公司管理） | JWT |  |
| PUT | `/dict/departments/{id}` | 修改科室（公司管理） | JWT |  |
| DELETE | `/dict/departments/{id}` | 删除科室（公司管理） | JWT |  |
| GET | `/dict/doctors` | 医生库列表（字典，无账号） | JWT |  |
| POST | `/dict/doctors` | 新增医生（公司管理） | JWT |  |
| PUT | `/dict/doctors/{id}` | 修改医生（公司管理） | JWT |  |
| DELETE | `/dict/doctors/{id}` | 删除医生（公司管理） | JWT |  |
| GET | `/dict/hospitals` | 医院字典列表 | JWT |  |
| POST | `/dict/hospitals` | 新增医院（公司管理） | JWT |  |
| PUT | `/dict/hospitals/{id}` | 修改医院（公司管理） | JWT |  |
| DELETE | `/dict/hospitals/{id}` | 删除医院（公司管理） | JWT |  |
| GET | `/dict/options` | 级联下拉包（医院/院区/科室/医生/标签一次性拉取） | JWT |  |
| GET | `/dict/tags` | 患者标签列表（动态枚举） | JWT |  |
| POST | `/dict/tags` | 新增标签（公司管理） | JWT |  |
| PUT | `/dict/tags/{id}` | 修改标签（公司管理） | JWT |  |
| DELETE | `/dict/tags/{id}` | 删除标签（公司管理） | JWT |  |

## patient

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/patients` | 患者列表（时间倒序+姓名/手机号搜索；按数据范围过滤） | JWT |  |
| POST | `/patients` | 新增患者（公司管理） | JWT |  |
| GET | `/patients/{id}` | 患者详情 | JWT |  |
| PUT | `/patients/{id}` | 修改患者（公司管理） | JWT |  |
| DELETE | `/patients/{id}` | 删除患者（公司管理） | JWT |  |
| PUT | `/patients/{id}/escort-quota` | 陪诊次数配置 0-999（PC配置） | JWT |  |
| PUT | `/patients/{id}/match` | 匹配客服/陪诊师（PC端配置） | JWT |  |
| GET | `/patients/{id}/medical-record` | 患者病历（附件1样表结构） | JWT |  |
| PUT | `/patients/{id}/medical-record` | 维护病历（公司管理/医院管理） | JWT |  |
| PUT | `/patients/{id}/tags` | 患者标签（动态枚举，前端维护） | JWT |  |

## health

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| PUT | `/health-records/{id}/advice` | 健康记录写建议（客服/后台） | JWT |  |
| GET | `/me/devices` | 本人已绑定设备列表 | JWT |  |
| POST | `/me/devices` | 绑定 BLE 设备（同用户同 MAC 不可重复） | JWT |  |
| DELETE | `/me/devices/{id}` | 解绑本人设备 | JWT |  |
| POST | `/me/devices/{id}/sync` | 同步设备：体脂秤必传 weightKg 并 upsert 当日 SCALE 记录；睡眠仪仅更新时间/电量 | JWT |  |
| GET | `/me/exercise/eval-config` | 评估表单配置（PC 可维护；配置缺失失败关闭 400） | JWT |  |
| POST | `/me/exercise/items/{id}/complete-set` | 完成一组（达到目标组数→NEED_EVAL） | JWT |  |
| POST | `/me/exercise/items/{id}/evaluation` | 训练后评估（动态表单；异常→PAUSED） | JWT |  |
| POST | `/me/exercise/items/{id}/finish` | 提前结束动作（→NEED_EVAL） | JWT |  |
| POST | `/me/exercise/items/{id}/pause` | 暂停动作（异常，无自动恢复） | JWT |  |
| GET | `/me/exercise/plan` | 我的运动康复方案（动作+本周统计；每日重置昨日完成项） | JWT |  |
| GET | `/me/health-archive` | 我的健康档案（基本信息+肿瘤标志物/血常规/肝功能 records+historyTrend） | JWT |  |
| GET | `/me/health-dashboard` | 我的健康看板（骨架） | JWT |  |
| GET | `/me/health-records` | 我的健康记录（按类型/时间；legacy 兼容入口） | JWT | deprecated |
| POST | `/me/health-records` | 录入健康数据（legacy；体重统一走 canonical 逻辑） | JWT | deprecated |
| POST | `/me/medication` | 添加用药（药名+每日次数 1-3；v3 不再设置提醒时间） | JWT |  |
| PUT | `/me/medication/reminder` | 用药提醒设置（已移除：接口固定返回 400） | JWT |  |
| GET | `/me/medication/today` | 今日用药列表（status 由当日打卡推导） | JWT |  |
| DELETE | `/me/medication/{id}` | 删除本人用药提醒 | JWT |  |
| POST | `/me/medication/{id}/take` | 用药打卡（当日幂等） | JWT |  |
| POST | `/me/nutrition/analyze` | 拍照→AI 营养分析（失败降级 mock；每日 30 次） | JWT |  |
| GET | `/me/scales/psqi` | PSQI 睡眠评估题目（近1个月，18题） | JWT |  |
| POST | `/me/scales/psqi/draft` | PSQI 断点暂存（upsert 唯一草稿） | JWT |  |
| GET | `/me/scales/psqi/status` | PSQI 评估状态（UNASSESSED/IN_PROGRESS/COMPLETED/EXPIRED） | JWT |  |
| GET | `/me/scales/psqi/submissions` | PSQI 历史记录 | JWT |  |
| POST | `/me/scales/psqi/submissions` | 提交 PSQI 作答→服务端计分（0-21+7维度） | JWT |  |
| GET | `/me/weight/records` | 体重记录列表（range=7d\|30d，默认 7d；最近 200 条） | JWT |  |
| POST | `/me/weight/records` | 新增体重记录（record_date=今天） | JWT |  |
| DELETE | `/me/weight/records/{id}` | 删除本人未删除的体重记录 | JWT |  |
| PUT | `/patients/{id}/exercise/items/{itemId}/unlock` | 人工解锁动作项（客服/医生/公司管理） | JWT |  |
| GET | `/patients/{id}/health-dashboard` | 患者看板（骨架：最近20条+趋势占位） | JWT |  |
| GET | `/patients/{id}/health-records` | 患者健康记录（后台） | JWT |  |
| POST | `/patients/{id}/health-records` | 后台代录健康数据（公司管理/客服） | JWT |  |
| GET | `/patients/{id}/scales` | 患者 PSQI 结果（后台查看） | JWT |  |

## conversation

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/conversations` | 会话列表（客服工作台） | JWT |  |
| GET | `/conversations/stats` | 客服统计卡（总会话/ACTIVE 会话/紧急/答复率占位） | JWT |  |
| GET | `/conversations/{id}` | 会话详情（患者信息+成员） | JWT |  |
| POST | `/conversations/{id}/audit` | 显式访问审计（陪诊师/客服/公司管理） | JWT |  |
| POST | `/conversations/{id}/evaluation` | 患者评价客服（v2 旧路径，保留兼容；返回 void） | JWT | deprecated |
| POST | `/conversations/{id}/manual-service` | 患者点「人工服务」（转人工唯一触发方式）→PC提醒 | JWT |  |
| GET | `/conversations/{id}/messages` | 历史消息（beforeId 游标，size 默认 30） | JWT |  |
| POST | `/conversations/{id}/messages` | 发送消息（患者/客服/陪诊师；文本/图片/健康卡片） | JWT |  |
| PUT | `/conversations/{id}/messages/{messageId}` | 编辑消息（仅作者本人；AI/SYSTEM 锁定） | JWT |  |
| PUT | `/conversations/{id}/priority` | 紧急标记（客服；注意是 PUT） | JWT |  |
| POST | `/conversations/{id}/read` | 标记已读 | JWT |  |
| PUT | `/conversations/{id}/status` | 解决/重新打开会话（客服） | JWT |  |
| GET | `/manual-service-requests` | 待响应人工服务请求列表（PC客服） | JWT |  |
| PUT | `/manual-service-requests/{id}` | 受理人工服务请求（PC客服） | JWT |  |
| GET | `/me/conversations` | 我的会话（两段式：会话入口+站内通知） | JWT |  |
| POST | `/me/conversations/{id}/evaluation` | 患者评价客服（星级+标签+评论） | JWT |  |
| POST | `/me/conversations/{id}/manual-service` | 患者点「人工服务」（/me 路径别名） | JWT |  |
| POST | `/me/conversations/{id}/messages` | 患者发消息（/me 路径别名） | JWT |  |
| GET | `/reply-templates` | 群沟通反馈模板（常见问题回复） | JWT |  |

## kb

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/kb/entries` | 知识库问答列表（客服共享） | JWT |  |
| POST | `/kb/entries` | 新增知识条目（人工客服） | JWT |  |
| PUT | `/kb/entries/{id}` | 修改知识条目（人工客服） | JWT |  |
| DELETE | `/kb/entries/{id}` | 删除知识条目（人工客服） | JWT |  |
| PUT | `/kb/entries/{id}/status` | 启用/停用（人工客服） | JWT |  |

## followup

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/follow-up/summary` | 随访统计（待沟通/待跟进/今日随访） | JWT |  |
| GET | `/follow-up/tasks` | 随访任务列表（PC工作流+手机端同源） | JWT |  |
| POST | `/follow-up/tasks` | 创建随访任务 | JWT |  |
| PUT | `/follow-up/tasks/{id}` | 更新任务（分配/改期/状态流转） | JWT |  |
| GET | `/follow-up/tasks/{id}/calls` | 历史通话记录 | JWT |  |
| POST | `/follow-up/tasks/{id}/calls` | 提交电话随访记录（PC 4步表单） | JWT |  |
| GET | `/follow-up/tasks/{id}/phone-status` | 电话按钮状态（未拨打=绿/已拨打=蓝） | JWT |  |

## cs

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/cs/faq` | 客服 FAQ（启用知识库，按术式+关键词） | JWT |  |
| GET | `/cs/patients` | 客服患者列表（CS 仅本人匹配；ADMIN 全量） | JWT |  |
| GET | `/cs/patients/{id}` | 患者详情（手术档案+AI摘要缓存+时间线） | JWT |  |
| GET | `/cs/patients/{id}/ai-prediction` | AI 沟通初步预判（30 分钟缓存，失败降级 mock） | JWT |  |
| GET | `/cs/patients/{id}/ai-summary` | AI 沟通关键点总结（30 分钟缓存，失败降级 mock） | JWT |  |
| POST | `/cs/patients/{id}/call` | 发起双呼（虚拟保护号） | JWT |  |
| POST | `/cs/patients/{id}/calls` | 提交通话记录（表单超集；pushToGroup 同步群卡片） | JWT |  |
| GET | `/cs/patients/{id}/phone-status` | 电话按钮状态（未拨打=绿/已拨打=蓝） | JWT |  |
| GET | `/cs/stats` | 客服工作台统计（高意向/待沟通/待回复） | JWT |  |

## doctor

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/doctor/patients` | 本人患者列表（姓名/手机号/术式/病症/入院诊断搜索；surgery_date 区间+排序） | JWT |  |
| GET | `/doctor/patients/{id}/archive` | 10 模块临床档案（进入自动写访问审计） | JWT |  |
| POST | `/doctor/patients/{id}/attachments` | 登记患者附件（文件本体先走 /files/upload） | JWT |  |
| DELETE | `/doctor/patients/{id}/attachments/{attId}` | 删除本人上传的附件（他人上传只读，403） | JWT |  |
| GET | `/doctor/patients/{id}/conversation` | 只读群聊（会话+成员槽位+消息；进入自动审计） | JWT |  |
| GET | `/doctor/profile` | 医生个人档案（certified=账号启用；prescriptionSignEnabled 仅展示） | JWT |  |
| PUT | `/doctor/profile` | 编辑医生个人档案（写 dict_doctor；5 个必填字段） | JWT |  |

## escort

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/escort/bookings` | 预约管理（公司管理全量列表） | JWT |  |
| PUT | `/escort/config` | 陪诊全局配置（未实现：Controller 固定返回 400） | JWT |  |
| GET | `/escort/orders` | 陪诊师订单列表（分页） | JWT |  |
| GET | `/escort/orders/{id}` | 订单详情（待服务=患者+风险提示；完成/取消=服务记录+打卡） | JWT |  |
| PUT | `/escort/orders/{id}/accept` | 接单（WAIT_ACCEPT→CONFIRMED） | JWT |  |
| POST | `/escort/orders/{id}/checkin` | 到院打卡（定位+地址+照片；记录 ARRIVE 打卡） | JWT |  |
| POST | `/escort/orders/{id}/service-record` | 提交服务记录（订单归档 COMPLETED；COMPLETED 才累加服务人次） | JWT |  |
| PUT | `/escort/orders/{id}/start` | 开始服务（CONFIRMED→IN_SERVICE） | JWT |  |
| GET | `/escort/profile-stats` | 陪诊师个人统计（累计服务/本月/评分） | JWT |  |
| GET | `/escort/schedules` | 月历排班（yyyy-MM-dd → 时段订单） | JWT |  |
| GET | `/escort/stats` | 陪诊师工作台统计（待接单/待服务/服务中/已完成/服务人数） | JWT |  |
| GET | `/escort/users` | 陪诊师服务过的患者（会话入口+未读数） | JWT |  |
| GET | `/me/escort` | 我的陪诊（剩余次数+当前有效预约） | JWT |  |
| GET | `/me/escort/bookings` | 我的预约列表（含陪诊师联系方式） | JWT |  |
| POST | `/me/escort/bookings` | 预约陪诊（预约即扣 1 次；明天起 10 天；时段冲突校验） | JWT |  |
| POST | `/me/escort/bookings/{id}/cancel` | 取消预约（全额返还 1 次；仅 WAIT_ACCEPT/CONFIRMED 可取消） | JWT |  |
| GET | `/me/escort/caregivers` | 可预约陪诊师列表（含忙碌时段） | JWT |  |

## risk

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/risk-alerts` | 风险提示列表（PC客服核心模块） | JWT |  |
| POST | `/risk-alerts` | 手动上报风险（兜底） | JWT |  |
| GET | `/risk-alerts/summary` | 风险统计（未处理/高中低） | JWT |  |
| PUT | `/risk-alerts/{id}` | 处理/关闭风险提示 | JWT |  |

## staff

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/assessment/hospital-dashboard` | 医院效能看板（骨架 TODO） | JWT |  |
| GET | `/staff` | 人员列表（客服/陪诊师/医生/医院管理；不返回 ADMIN） | JWT |  |
| POST | `/staff` | 新增员工（初始密码 123456） | JWT |  |
| GET | `/staff/performance` | 客服绩效（骨架：答复率/响应时间/满意度占位） | JWT |  |
| GET | `/staff/schedules` | 客服排班查询 | JWT |  |
| POST | `/staff/schedules` | 新增排班 | JWT |  |
| DELETE | `/staff/schedules/{id}` | 删除排班 | JWT |  |
| GET | `/staff/{id}` | 员工详情 | JWT |  |
| PUT | `/staff/{id}` | 修改员工（负责区域矩阵等；密码需单独重置） | JWT |  |
| PUT | `/staff/{id}/password` | 重置密码 | JWT |  |
| PUT | `/staff/{id}/status` | 启停账号 | JWT |  |

## hospital

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/hospital/patients` | 患者列表（医院权限=全部科室可筛选；科室权限=仅本科室） | JWT |  |
| GET | `/hospital/patients/{id}/health-detail` | 患者健康详情（饮食/运动/体重/血糖血压7天；检查指标30天；其他附件） | JWT |  |
| GET | `/hospital/summary` | 患者 tab 统计 | JWT |  |

## app

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/app/articles` | 资讯/健康文章/心理健康内容（C端公开，按科室+术式） | 公开 |  |
| POST | `/app/articles` | 新增文章（公司管理） | JWT |  |
| GET | `/app/articles/all` | 全部文章（公司管理） | JWT |  |
| PUT | `/app/articles/{id}` | 修改文章（公司管理） | JWT |  |
| DELETE | `/app/articles/{id}` | 删除文章（公司管理） | JWT |  |
| GET | `/app/banners` | Banner（健康知识库精选等，C端公开） | 公开 |  |
| POST | `/app/banners` | 新增 Banner（公司管理） | JWT |  |
| GET | `/app/banners/all` | 全部 Banner（公司管理） | JWT |  |
| PUT | `/app/banners/{id}` | 修改 Banner（公司管理） | JWT |  |
| DELETE | `/app/banners/{id}` | 删除 Banner（公司管理） | JWT |  |
| GET | `/app/informed-consents` | 告知书列表（C端公开，生效中） | 公开 |  |
| POST | `/app/informed-consents` | 新增告知书（公司管理） | JWT |  |
| PUT | `/app/informed-consents/{id}` | 修改告知书（公司管理） | JWT |  |
| DELETE | `/app/informed-consents/{id}` | 删除告知书（公司管理） | JWT |  |
| PUT | `/app/informed-consents/{id}/status` | 启用/归档告知书（公司管理） | JWT |  |
| POST | `/app/templates` | 新增模板（公司管理） | JWT |  |
| GET | `/app/templates/all` | 全部回复模板（公司管理） | JWT |  |
| PUT | `/app/templates/{id}` | 修改模板（公司管理） | JWT |  |
| DELETE | `/app/templates/{id}` | 删除模板（公司管理） | JWT |  |
| PUT | `/app/templates/{id}/status` | 启用/停用模板（公司管理） | JWT |  |

## notification

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| GET | `/notifications` | 通知列表（系统信息/资料更新/人工服务提醒/风险） | JWT |  |
| PUT | `/notifications/read` | 全部标记已读 | JWT |  |
| POST | `/notifications/wx-subscribe` | 小程序订阅消息授权登记（TODO 骨架） | JWT |  |

## file

| 方法 | 路径 | 说明 | 鉴权 | 备注 |
|---|---|---|---|---|
| POST | `/files/upload` | 上传文件（图片/文档，≤20MB）→本地存储（需登录；COS 实现 TODO） | JWT |  |
| POST | `/files/uploads` | 批量上传（其他指标5附件等；需登录） | JWT |  |
| GET | `/files/{dir}/{filename}` | 本地存储读取（开发用；匿名可访问） | 公开 |  |
