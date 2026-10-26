# 前端联调工具箱（frontend-api-kit）

一句话：把整个目录拷给前端，装好 **Apifox/Postman + Python3** 即可开工。

## 目录内容

| 文件 | 用途 |
|---|---|
| `AGENTS.md` | **给 AI 编码代理的接口使用指南**：角色域、流程、枚举、坑位、代码生成约定（推荐先读） |
| `API_INDEX.md` | 接口总索引（自动生成，按模块分组，含鉴权/废弃标记） |
| `05-前端登录与鉴权联调.md` | 登录/鉴权/会话完整文档 |
| `swagger.json` | Swagger 2.0 接口契约，导入 Apifox/Postman 生成全部接口与模型 |
| `smoke_test.py` | 一键冒烟脚本（Python3 标准库，无依赖），验证服务端可用性 |

## 一分钟上手

1. **导接口**：Apifox/Postman → 导入 `swagger.json`
2. **跑冒烟**：
   ```bash
   python3 smoke_test.py
   # 或显式指定接口地址：
   python3 smoke_test.py http://115.159.151.158:8081/api/v1
   ```
   输出一堆 `OK | xxx`，全 OK = 服务可用，可以开始写前端
3. **免登调试**：`GET /auth/dev-tokens` 拿 6 个角色临时 token（有效期一年），
   请求加头 `Authorization: Bearer <token>`，比 curl 还快的方法是把 token
   配成 Apifox 的环境变量（注意 `station` key 的 role 是 `CAREGIVER` 陪诊师）
   ```bash
   TOKEN=$(curl -s http://115.159.151.158:8081/api/v1/auth/dev-tokens | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['patient'])")
   curl -s http://115.159.151.158:8081/api/v1/me/conversations -H "Authorization: Bearer $TOKEN"
   ```

## 暗号化约定（前端代码必须遵守）

- 响应永远是 `{code, message, data}`，**HTTP 状态恒为 200**
- `code=0` 成功；`400` 弹提示；`401` 静默 refresh；`402` 跳登录；`403` 无权限；`500` 服务异常
- 登录成功响应自带 `token + refreshToken + user(role)`；恢复会话调 `GET /auth/me`

## 环境指径

| 环境 | 地址 |
|---|---|
| 联调服务器 | `http://115.159.151.158:8081/api/v1`、`http://followup.ijunyuan.cn/api/v1` |
| WebSocket | 同上 + `/ws?token=xxx` |
| 服务器日志（验证码等） | tcpkg:/home/wyc/followup/app.log |

> 无需任何额外凭证即可开始；服务端改动后 swagger.json 会重新生成，目录里的这份也会同步替换。