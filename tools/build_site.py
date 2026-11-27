"""Construit index.html (version web installable) à partir de voyage-japon-2027.html, la page publiée sur claude.ai."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "voyage-japon-2027.html"), encoding="utf-8").read()
head = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#d9381e">
<meta name="description" content="Voyage au Japon du 1er au 19 avril 2027 : programme, carte 3D, budget, réservations et préparatifs.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Japon 2027">
<style>html{color-scheme:light dark}body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}:root{padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0)}</style>
</head><body>
"""
tail = '\n<script src="web-app.js"></script>\n</body></html>\n'
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(head + src + tail)
assets = sorted("img/" + f for f in os.listdir(os.path.join(ROOT, "img")) if f.endswith(".jpg"))
json.dump(assets, open(os.path.join(ROOT, "assets.json"), "w"))
print("index.html et assets.json générés :", len(assets), "photos")
