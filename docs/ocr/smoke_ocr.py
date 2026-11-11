#!/usr/bin/env python3
"""OCR API kit 冒烟脚本（dev）。

用法：
  python3 smoke_ocr.py --dev-token
  python3 smoke_ocr.py --token <patient_token> --image /files/medical/xxx.png
  python3 smoke_ocr.py --token <token> --image a.png --image b.png --duplicate

默认使用 4 张 dev 样例图。脚本只读 + 触发服务端自动入库，不会 confirm 病历字段。
"""
import argparse
import json
import sys
import time
import urllib.request

BASE_DEFAULT = "http://115.159.151.158:8081/api/v1"
DEV_SAMPLES = [
    "/files/medical/2a736579228b4339924c9ab2f37aeef1.png",  # 血常规
    "/files/medical/44fadf48f49e41cb87c3f336f7d4ff1c.png",  # 肿瘤标志物
    "/files/medical/2b049b945bbc4409b34e7672c773a446.png",  # 门诊病历
    "/files/medical/53dcdca5a1f245c3ac719121d1b089fe.png",  # 门诊病历
]


def request(base, path, token=None, method="GET", body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    headers = {}
    if token:
        headers["Authorization"] = "Bearer " + token
    if body is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def poll(base, token, task_id, label):
    for i in range(90):
        data = request(base, f"/me/medical-record/scan/{task_id}", token)
        if data.get("code") != 0:
            raise RuntimeError(f"{label} 轮询失败: {data}")
        view = data["data"]
        status = view["status"]
        if status in ("SUCCESS", "FAILED"):
            print(f"[{label}] task={task_id} status={status} ({i * 2}s)")
            return view
        time.sleep(2)
    raise TimeoutError(f"{label} 超过 180s 仍未完成")


def summarize(view, label):
    result = view.get("result") or {}
    print(f"  {label}: docType={result.get('docType')} "
          f"fields={len(result.get('fields') or {})} "
          f"labs={len(result.get('labReports') or [])}")
    for report in result.get("labReports") or []:
        inds = report.get("indicators") or []
        print(f"    {report.get('labModule')} date={report.get('recordDate')} "
              f"inferred={report.get('dateInferred')} "
              f"action={report.get('action')} autoSaved={report.get('autoSaved')} "
              f"recordId={report.get('recordId')} indicators={len(inds)}")
        for ind in inds[:3]:
            print(f"      {ind.get('name')} value={ind.get('value')} "
                  f"unit={ind.get('unit')} ref={ind.get('referenceRange')} "
                  f"label={ind.get('label')} qualifier={ind.get('qualifier')}")


def wait_apply_settled(base, token, task_id, view):
    """OCR SUCCESS 后后台写库可能仍在执行；action=PENDING 时再等一次。"""
    reports = (view.get("result") or {}).get("labReports") or []
    if any(r.get("action") == "PENDING" for r in reports):
        time.sleep(2)
        view = request(base, f"/me/medical-record/scan/{task_id}", token)["data"]
    return view


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default=BASE_DEFAULT)
    parser.add_argument("--token", help="患者 access token")
    parser.add_argument("--dev-token", action="store_true",
                        help="从 /auth/dev-tokens 取 patient token（仅 dev）")
    parser.add_argument("--image", action="append", default=[],
                        help="图片 URL，可重复；默认 4 张 dev 样例")
    parser.add_argument("--duplicate", action="store_true",
                        help="重复上传第一张图，验证同日同模块 UPDATED")
    args = parser.parse_args()

    token = args.token
    if args.dev_token or not token:
        tokens = request(args.base, "/auth/dev-tokens")
        if tokens.get("code") != 0:
            raise RuntimeError(f"获取 dev token 失败: {tokens}")
        token = tokens["data"]["patient"]
        print("使用 dev patient token（仅 dev）")

    images = args.image or DEV_SAMPLES
    tasks = []
    for idx, url in enumerate(images, 1):
        data = request(args.base, "/me/medical-record/scan", token, "POST",
                       {"imageUrls": [url]})
        if data.get("code") != 0:
            raise RuntimeError(f"scan 失败: {data}")
        task_id = data["data"]["taskId"]
        view = poll(args.base, token, task_id, f"image{idx}")
        view = wait_apply_settled(args.base, token, task_id, view)
        summarize(view, f"image{idx}")
        tasks.append((task_id, view))

    if args.duplicate:
        url = images[0]
        data = request(args.base, "/me/medical-record/scan", token, "POST",
                       {"imageUrls": [url]})
        task_id = data["data"]["taskId"]
        view = poll(args.base, token, task_id, "duplicate")
        view = wait_apply_settled(args.base, token, task_id, view)
        summarize(view, "duplicate")
        reports = (view.get("result") or {}).get("labReports") or []
        if reports and reports[0].get("action") not in ("UPDATED", "INSERTED"):
            print("WARN: duplicate 未得到 UPDATED/INSERTED")

    archive = request(args.base, "/me/health-archive?range=all", token)
    if archive.get("code") != 0:
        raise RuntimeError(f"health-archive 失败: {archive}")
    data = archive["data"]
    print("\n=== /me/health-archive?range=all ===")
    print("scanDocs =", len((data.get("basicInfo") or {}).get("scanDocs") or []))
    for module in ("tumorMarkers", "bloodRoutine", "liverNutrition"):
        m = data.get(module) or {}
        print(f"{module}: records={len(m.get('records') or [])} "
              f"trend={len(m.get('historyTrend') or [])}")
        for record in (m.get("records") or []):
            inds = record.get("indicators") or []
            sample = inds[0] if inds else {}
            print(f"  date={record.get('date')} indicators={len(inds)} "
                  f"sample={ {k: sample.get(k) for k in ('name','label','unit','qualifier','referenceRange','status')} }")
    print("\nOK：OCR 冒烟完成（未确认任何病历字段）")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("FAILED:", exc, file=sys.stderr)
        sys.exit(1)
