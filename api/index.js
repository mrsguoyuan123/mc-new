// ============================================
// API 接口统一导出入口
// ============================================

// 认证模块：登录/注册/验证码/微信登录/刷新令牌/登出/个人信息/改密码/系统设置/登录日志/操作日志/账号安全
export * from './auth'

// 患者个人模块：个人信息/健康管家/病历/OCR识别/病历确认回填
export * from './user'

// 字典模块：医院/院区/科室/医生/患者标签/级联下拉选项
export * from './dict'

// 患者管理（PC后台）：患者CRUD/病历/匹配客服驻点/标签/陪诊配额/健康看板
export * from './patient'

// 健康数据模块：健康记录/PSQI睡眠评估/用药管理/健康看板
export * from './health'

// 会话沟通模块：会话列表/消息/人工客服/评价/回复模板/知识库
export * from './conversation'

// 随访任务模块：随访任务CRUD/电话记录/电话状态/随访汇总
export * from './followup'

// 陪诊模块：患者端预约/陪诊员任务/签到/进度/完成/统计/配置
export * from './escort'

// 风险提示模块：风险告警列表/创建/汇总/处理
export * from './risk'

// 人员管理模块：员工CRUD/排班/绩效/医院效能看板
export * from './staff'

// 医院管理端：医院患者列表/健康详情/医院汇总
export * from './hospital'

// 小程序内容模块：Banner/文章资讯/回复模板/告知书
export * from './app'

// 站内通知模块：通知列表/已读/微信订阅消息
export * from './notification'

// 文件上传模块：单文件上传/批量上传
export * from './file'
export default {
  ...auth,
  ...conversation,
  ...dict,
  ...escort,
  ...file,
  ...followup,   
  ...health,
  ...hospital,
  ...notification,
  ...patient,
  ...risk,
  ...staff,
  ...user
}