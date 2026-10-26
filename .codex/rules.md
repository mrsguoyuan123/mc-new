# mc-vue2版 uni-app Vue2 全局规则｜微信小程序
> 鉴权逻辑优先遵守 api/05-前端登录与鉴权联调.md，接口契约以 api/swagger.json 为准
1. 框架：uni-app Vue2，选项式API export default {}
❌ 禁止 <script setup>、ref、reactive、Vue3语法
2. 请求封装统一入口：import { xxx } from '@/api/frontApikit.js'
3. 请求头：Authorization: Bearer ${accessToken}，公开接口不需要
4. 统一响应约定（强制）
   HTTP 状态永远200，判断依据为返回code：
   code:0 → 成功；code:400 → 业务错误，弹message，不跳登录
   code:401 → accessToken过期，自动调用 /auth/refresh 刷新一次，重试原请求；刷新失败（code402）清除token，跳转登录页
   code:402 → refreshToken失效，清空本地token，跳登录
   code:403 → 无权限提示；code:500 → 服务异常提示
5. 本地存储：
   accessToken 、refreshToken、user信息 全部使用 uni.setStorageSync / uni.getStorageSync
6. 分页固定返回结构：data:{ list:[], total, page, pageSize }
7. 角色：PATIENT / CS / STATION / HOSPITAL_ADMIN / ADMIN
   根据user.role渲染页面tab、筛选权限
8. 开发页面：数据写在 data(){return{}}，请求写在 methods
9. 页面存放路径：pages/
10. dev环境支持 /auth/dev-tokens 获取各角色免登token，仅开发调试使用
