#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
前端联调冒烟脚本（Python3 标准库，无第三方依赖）。
用法: python3 smoke_test.py [base_url]
  默认 base_url = http://115.159.151.158:8081/api/v1
退出码: 0 = 全部通过, 1 = 有失败项
✅ 对齐 AGENTS.md：移除废弃/未实现接口，修正路径
"""
import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://115.159.151.158:8081/api/v1"
FAILED = []

def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {"code": -1, "message": "非json返回"}

def t(name, ok, extra=""):
    tag = "OK  " if ok else "FAIL"
    if not ok:
        FAILED.append(name)
    print(f"{tag} | {name}" + (f" | {extra}" if extra else ""))

print(f"冒烟目标: {BASE}\n")

# 1. dev 免登 token（开发环境专用，生产注释掉）
s, r = call("GET", "/auth/dev-tokens")
tk = r.get("data") or {}
if s == 200 and r.get("code") == 0 and len(tk) >= 5:
    t("dev 静态 token", True, "roles=" + ",".join(tk.keys()))
else:
    t("dev 静态 token", False, f"code={r.get('code')} message={r.get('message')}")
    print("\n[提示] 非 dev 环境请改用账号密码登录获取 token，修改脚本。\n")
    sys.exit(1)

# 2. 各角色合法接口（全部来自 AGENTS.md 有效接口，剔除废弃/未实现）
# ADMIN 后台：患者列表
s, r = call("GET", "/patients?page=1&pageSize=10", tk["admin"])
t("admin 查患者列表", s == 200 and r.get("code") == 0 and r["data"]["total"] >= 1, f"total={r['data']['total']}")

# CS 客服：客服患者列表
s, r = call("GET", "/cs/patients?page=1&pageSize=10", tk["cs"])
t("cs 查患者列表", s == 200 and r.get("code") == 0 and r["data"]["total"] >= 1, f"total={r['data']['total']}")

# HOSPITAL_ADMIN 医院管理员：医院患者
s, r = call("GET", "/hospital/patients?page=1&pageSize=10", tk["hospital"])
t("hospital 查本院患者", s == 200 and r.get("code") == 0 and r["data"]["total"] >= 1, f"total={r['data']['total']}")

# CAREGIVER陪诊师（dev key: station）：陪诊订单
s, r = call("GET", "/escort/orders?status=WAIT_ACCEPT&page=1&pageSize=10", tk["station"])
t("station(CAREGIVER) 待接单", s == 200 and r.get("code") == 0, f"total={r['data'].get('total',0)}")

# PATIENT患者：拉取会话消息
s, r = call("GET", "/conversations/603/messages", tk["patient"])
t("patient 拉取沟通群消息", s == 200 and r.get("code") == 0, f"消息数={len(r.get('data', []))}")

# PATIENT患者：首页 /me/home 核心入口（AGENTS首选）
s, r = call("GET", "/me/home", tk["patient"])
t("patient 首页 home", s == 200 and r.get("code") == 0, f"postopDays={r['data'].get('postopDays')}")

# PATIENT患者：PSQI状态
s, r = call("GET", "/me/scales/psqi/status", tk["patient"])
t("patient PSQI状态", s == 200 and r.get("code") == 0, f"state={r['data'].get('state')}")

# 3. 登录 / 错误语义（HTTP 恒 200 + code 语义，后端标准）
s, r = call("POST", "/auth/login", body={"username": "admin", "password": "admin123"})
t("admin 账号密码登录", s == 200 and r.get("code") == 0 and r["data"]["user"]["role"] == "ADMIN",
  f"role={r['data']['user']['role']}")

s, r = call("POST", "/auth/login", body={"username": "admin", "password": "wrong"})
t("错误密码 → HTTP200/code400", s == 200 and r.get("code") == 400, f"code={r.get('code')}")

s, r = call("GET", "/auth/me")
t("无 token → HTTP200/code401", s == 200 and r.get("code") == 401, f"code={r.get('code')}")

# 越权测试：患者访问CS接口 /cs/stats
s, r = call("GET", "/cs/stats", tk["patient"])
t("患者越权访问CS接口 → code403", s == 200 and r.get("code") == 403, f"code={r.get('code')}")

print()
if FAILED:
    print(f"失败 {len(FAILED)} 项: {', '.join(FAILED)}")
    sys.exit(1)
print("全部通过 服务端可用，可以开始联调。")
