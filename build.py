"""Buduje dist/esp-jbl-card.js (karta HACS) i dist/esp-jbl-web.html (panel WWW na ESP).

Uzycie: python build.py [--esp SCIEZKA_DO_index.html]
"""
import argparse
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"


def module(name):
    code = (SRC / name).read_text(encoding="utf-8")
    code = re.sub(r'^import .*?;\n', "", code, flags=re.M)
    return re.sub(r'^export ', "", code, flags=re.M)


def bundle(adapter, version, repo):
    body = module("core.js") + "\n" + module(adapter)
    body = body.replace("__VERSION__", version).replace("__REPO__", repo)
    return f"(() => {{\n\"use strict\";\n{body}\n}})();\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--esp", help="skopiuj panel WWW do firmware (np. ../ESP/src/web/index.html)")
    args = ap.parse_args()

    pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    version, repo = pkg["version"], pkg["repository"]
    DIST.mkdir(exist_ok=True)

    card = DIST / "esp-jbl-card.js"
    card.write_text(bundle("ha-card.js", version, repo), encoding="utf-8", newline="\n")

    html = (SRC / "web.html").read_text(encoding="utf-8")
    web = DIST / "esp-jbl-web.html"
    web.write_text(html.replace("/*__BUNDLE__*/", bundle("web.js", version, repo)), encoding="utf-8", newline="\n")

    print(f"{card.name}: {card.stat().st_size} B, {web.name}: {web.stat().st_size} B")
    if args.esp:
        shutil.copyfile(web, args.esp)
        print(f"skopiowano do {args.esp}")


if __name__ == "__main__":
    main()
