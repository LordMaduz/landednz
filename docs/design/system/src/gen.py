"""Design-system board: live component sheet + every page, today vs proposed states.

Run: python3 docs/design/system/src/gen.py <crops-png-dir>
Reads docs/design/system/{crops.json,hovers.json,img/*.webp}; writes docs/design/system/board.html.
"""
import json
import subprocess
import sys
from collections import Counter
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
PNG = Path(sys.argv[1])
crops = json.loads((HERE / "crops.json").read_text())
hovers = json.loads((HERE / "hovers.json").read_text())

PAGES = [
    ("landing", "Landing", "/"),
    ("onboarding-1", "Onboarding · question 1", "/onboarding?step=1"),
    ("onboarding-5", "Onboarding · question 5", "/onboarding?step=5"),
    ("preview", "Roadmap preview", "/onboarding/preview"),
    ("save", "Save your roadmap (sign in)", "/signin"),
    ("home", "Home", "/app"),
    ("roadmap", "Roadmap", "/app/roadmap"),
    ("task", "Task", "/app/roadmap?task=T08"),
    ("settings", "Settings", "/settings"),
    ("settings-edit", "Settings · edit arrival date", "/settings?edit=arrivalDate"),
]


def half_width(name: str) -> int:
    out = subprocess.run(["sips", "-g", "pixelWidth", str(PNG / f"{name}.png")], capture_output=True, text=True).stdout
    return int(out.split()[-1]) // 2


def img(name: str, alt: str) -> str:
    if not (HERE / "img" / f"{name}.webp").exists():
        return '<span class="na">not captured</span>'
    return f'<img src="img/{name}.webp" width="{half_width(name)}" alt="{escape(alt)}" loading="lazy">'


def rgb(c: str) -> str:
    return f'<i class="sw" style="background:{c}"></i>'


# today's hover inventory, measured on the running app at 1440
inv = Counter()
for rows in hovers.values():
    for r in rows:
        if "Next.js" in r["label"]:
            continue
        a, b = r["rest"], r["hov"]
        if a == b:
            k = ("none", "", "")
        elif a["bg"] != b["bg"]:
            k = ("background", a["bg"], b["bg"])
        elif a["color"] != b["color"]:
            k = ("text colour", a["color"], b["color"])
        else:
            k = ("underline or shadow only", "", "")
        inv[k] += 1
inv_rows = "".join(
    f"<tr><td class=num>{n}</td><td>{escape(kind)}</td><td>{rgb(a) + ' ' if a else ''}{escape(a)}</td><td>{rgb(b) + ' ' if b else ''}{escape(b)}</td></tr>"
    for (kind, a, b), n in inv.most_common()
)


def page_section(key: str, title: str, path: str) -> str:
    rows_d = [c for c in crops if c["page"] == key and c["w"] == 1440]
    rows_p = [c for c in crops if c["page"] == key and c["w"] == 390]
    seen, desk = set(), ""
    for c in rows_d:
        if c["label"] in seen:
            continue
        seen.add(c["label"])
        b = f"{key}-1440-{c['j']}"
        desk += f"<div class=ctrl><h4>{escape(c['label'])}</h4><div class=figs><figure>{img(b + '-today-hover', 'today hover')}<figcaption>Today · hover</figcaption></figure><figure>{img(b + '-new-hover', 'proposed hover')}<figcaption>Proposed · hover</figcaption></figure><figure>{img(b + '-new-press', 'proposed pressed')}<figcaption>Proposed · pressed</figcaption></figure></div></div>"
    seen, phone = set(), ""
    for c in rows_p:
        if c["label"] in seen:
            continue
        seen.add(c["label"])
        b = f"{key}-390-{c['j']}"
        phone += f"<div class=ctrl><h4>{escape(c['label'])}</h4><div class=figs><figure>{img(b + '-today-press', 'today tap')}<figcaption>Today · tap</figcaption></figure><figure>{img(b + '-new-press', 'proposed tap')}<figcaption>Proposed · tap</figcaption></figure></div></div>"
    return f"""
<section class="page" id="p-{key}">
  <header><h3>{escape(title)}</h3><code>{escape(path)}</code></header>
  <div class="shots">
    <figure><img src="img/page-{key}-1440.webp" alt="{escape(title)} at 1440" loading="lazy" class="full d"><figcaption>1440 · today (at rest the proposed system draws the same)</figcaption></figure>
    <figure><img src="img/page-{key}-390.webp" alt="{escape(title)} at 390" loading="lazy" class="full m"><figcaption>390 · today</figcaption></figure>
  </div>
  <div class="tables">
    <div><h4 class="cap">Desktop: mouse over and press</h4>{desk}</div>
    <div><h4 class="cap">Phone: finger held down (phones have no hover)</h4>{phone}</div>
  </div>
</section>"""


pages = "".join(page_section(*p) for p in PAGES)
nav = "".join(f'<a href="#p-{k}">{escape(t)}</a>' for k, t, _ in PAGES)

ROLES = [
    ("fg", "#0F2A3A", "ink", "normal text"),
    ("fg-muted", "#4B6170", "muted", "secondary text"),
    ("fg-subtle", "#7A8F99", "control", "quietest text, radio rings"),
    ("surface", "#FFFFFF", "white", "page and cards"),
    ("surface-sunken", "#F6F8F8", "wash", "grey wells, disabled"),
    ("surface-selected", "#F3F9F8", "tint (+ avatar)", "chosen rows, current nav"),
    ("border-selected", "#CFE5E3", "tint-border", "chosen row edge"),
    ("surface-inverse", "#0F2A3A", "ink", "dark rail, toast, crisis card"),
    ("fg-on-inverse", "#A9BDC7", "rail-text", "text on dark"),
    ("action", "#0F2A3A", "ink", "primary button"),
    ("accent", "#0E7C7B", "teal", "brand, progress, focus ring"),
    ("accent-bright", "#3FC9B7", "mark", "decorative marks"),
    ("link", "#0A6463", "teal-text", "links"),
    ("link-hover", "#074B4A", "teal-hover", "links on hover"),
    ("link-on-inverse", "#7FE0D3", "toast-action", "links on dark"),
    ("danger", "#A3292B", "danger", "errors, delete"),
    ("danger-on-inverse", "#F2B8B5", "danger-on-ink", "delete on dark"),
    ("border", "#D5DFE2", "border", "control edges"),
    ("border-subtle", "#E3E8EA", "hairline", "dividers, card edges"),
    ("track", "#C9D3D7", "track", "progress track"),
]
roles = "".join(
    f"<tr><td><i class='sw lg' style='background:{h}'></i></td><td><code>{r}</code></td><td>{h}</td><td>{o}</td><td>{u}</td></tr>" for r, h, o, u in ROLES
)

HTML = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>LandedNZ design system: proposed</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root {{
  --ink:#0F2A3A; --muted:#4B6170; --control:#7A8F99; --border:#D5DFE2; --hairline:#E3E8EA; --wash:#F6F8F8;
  --teal:#0E7C7B; --teal-text:#0A6463; --teal-hover:#074B4A; --tint:#F3F9F8; --tint-border:#CFE5E3; --danger:#A3292B;
  --rail-text:#A9BDC7; --toast-action:#7FE0D3; --danger-on-ink:#F2B8B5;
  --h-light:6%; --p-light:10%; --h-dark:8%; --p-dark:12%; --floating:16px;
  --lift:0 1px 2px rgba(15,42,58,.04),0 16px 48px rgba(15,42,58,.08);
  --bar:0 0 0 1px rgba(15,42,58,.08),0 2px 4px rgba(15,42,58,.04),0 18px 40px -12px rgba(15,42,58,.28);
  --pane:0 0 0 1px rgba(15,42,58,.06),0 2px 4px rgba(15,42,58,.04),0 24px 64px -12px rgba(15,42,58,.18);
}}
:root[data-strength=b] {{ --h-light:8%; --p-light:12%; --h-dark:10%; --p-dark:16%; }}
:root[data-radius=r18] {{ --floating:18px; }}
* {{ box-sizing:border-box; }}
html {{ scroll-behavior:smooth; scroll-padding-top:72px; }}
@media (prefers-reduced-motion:reduce) {{ html {{ scroll-behavior:auto; }} }}
body {{ margin:0; font:14px/1.45 Geist, system-ui, sans-serif; color:var(--ink); background:#fff; font-feature-settings:'tnum' 1; -webkit-font-smoothing:antialiased; }}
::selection {{ background:var(--tint-border); }}
:focus-visible {{ outline:2px solid var(--teal); outline-offset:2px; }}
a {{ color:var(--teal-text); }} a:hover {{ color:var(--teal-hover); }}
code {{ font:12px/1.4 'Geist Mono', ui-monospace, monospace; color:var(--muted); }}
@media (max-width:860px) {{ .top {{ position:static !important; }} .ctl {{ margin-left:0; }} }}
.top {{ position:sticky; top:0; z-index:5; background:rgba(255,255,255,.94); backdrop-filter:blur(8px); border-bottom:1px solid var(--hairline); }}
.top .in {{ max-width:1248px; margin:0 auto; padding:12px 24px; display:flex; gap:24px; align-items:center; flex-wrap:wrap; }}
.top b {{ font-weight:600; }}
.ctl {{ display:flex; gap:16px; margin-left:auto; flex-wrap:wrap; }}
.seg {{ display:inline-flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }}
.seg button {{ font:inherit; font-size:12px; border:0; background:#fff; color:var(--muted); padding:6px 12px; min-height:32px; cursor:pointer; }}
.seg button[aria-pressed=true] {{ background:var(--ink); color:#fff; }}
.seg span {{ font-size:12px; color:var(--muted); padding:6px 8px 6px 12px; align-self:center; }}
main {{ max-width:1248px; margin:0 auto; padding:0 24px 96px; }}
h1 {{ font-size:24px; line-height:1.25; letter-spacing:-.015em; font-weight:600; margin:48px 0 8px; }}
h2 {{ font-size:18px; line-height:1.35; letter-spacing:-.01em; font-weight:600; margin:64px 0 8px; }}
h3 {{ font-size:16px; line-height:1.35; font-weight:600; margin:0; }}
p {{ font-size:16px; line-height:1.5; margin:0 0 12px; max-width:72ch; }}
.lede {{ color:var(--muted); }}
.facts {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin:24px 0; }}
.fact {{ border:1px solid var(--hairline); border-radius:12px; padding:16px; }}
.fact strong {{ display:block; font-size:16px; font-weight:600; margin-bottom:4px; }}
.fact span {{ color:var(--muted); }}
table {{ border-collapse:collapse; width:100%; }}
th, td {{ text-align:left; padding:8px 12px 8px 0; border-bottom:1px solid var(--hairline); vertical-align:middle; }}
thead th {{ font-size:12px; font-weight:500; color:var(--muted); }}
td.num {{ font-weight:600; width:48px; }}
.sw {{ display:inline-block; width:14px; height:14px; border-radius:4px; border:1px solid rgba(15,42,58,.15); vertical-align:-2px; }}
.sw.lg {{ width:28px; height:28px; border-radius:6px; }}
.grid2 {{ display:grid; grid-template-columns:1fr 1fr; gap:24px; }}
@media (max-width:860px) {{ .grid2 {{ grid-template-columns:1fr; }} }}
.panel {{ border:1px solid var(--hairline); border-radius:12px; padding:24px; }}
.panel.dark {{ background:var(--ink); border-color:var(--ink); color:#fff; }}
.panel h3 {{ margin-bottom:16px; }}
.row {{ display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:16px; }}
.lbl {{ font-size:12px; color:var(--muted); width:100%; margin:16px 0 8px; }}
.dark .lbl {{ color:var(--rail-text); }}

/* the proposed state layer: one rule for every control */
.st {{ --sb:transparent; --sl:var(--ink); --sh:var(--h-light); --sp:var(--p-light); background-color:var(--sb); cursor:pointer; }}
.st.inv {{ --sl:#fff; --sh:var(--h-dark); --sp:var(--p-dark); }}
@media (hover:hover) {{ .st:hover:not(:disabled) {{ background-color:color-mix(in oklab, var(--sb), var(--sl) var(--sh)); }} }}
.st:active:not(:disabled), .st.f-press {{ background-color:color-mix(in oklab, var(--sb), var(--sl) var(--sp)); }}
.st.f-hover {{ background-color:color-mix(in oklab, var(--sb), var(--sl) var(--sh)); }}
.st.f-focus {{ outline:2px solid var(--teal); outline-offset:2px; }}
.b {{ font:inherit; font-weight:500; display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:40px; padding:0 16px; border-radius:8px; border:1px solid transparent; color:var(--ink); }}
@media (max-width:560px) {{ .b {{ min-height:44px; }} }}
.b.primary {{ --sb:var(--ink); border-color:var(--ink); color:#fff; }}
.b.secondary {{ --sb:#fff; border-color:var(--border); }}
.b.ghost {{ --sb:transparent; }}
.b.danger {{ --sb:var(--danger); border-color:var(--danger); color:#fff; }}
.b.danger-ghost {{ --sb:transparent; color:var(--danger); }}
.b.inverse {{ --sb:transparent; color:#fff; border-color:rgba(255,255,255,.24); }}
.b.inverse-danger {{ --sb:transparent; color:var(--danger-on-ink); }}
.b.icon {{ width:40px; padding:0; }}
.b:disabled {{ --sb:var(--wash); background:var(--wash); border-color:var(--wash); color:var(--muted); cursor:default; }}
.t {{ font:inherit; font-weight:500; background:none; border:0; padding:0; color:var(--teal-text); cursor:pointer; text-underline-offset:3px; }}
@media (hover:hover) {{ .t:hover {{ color:var(--teal-hover); text-decoration:underline; }} }}
.t:active {{ color:var(--teal-hover); text-decoration:underline; }}
.dark .t {{ color:var(--toast-action); }} .dark .t:hover, .dark .t:active {{ color:#fff; }}
.field {{ font:inherit; font-size:16px; width:100%; min-height:44px; padding:0 12px; border:1px solid var(--border); border-radius:8px; color:var(--ink); background:#fff; }}
.field:focus, .field.f-focus {{ outline:2px solid var(--teal); outline-offset:2px; }}
.field.err {{ border-color:var(--danger); box-shadow:0 0 0 1px var(--danger); }}
.err-msg {{ color:var(--danger); font-size:12px; margin-top:4px; }}
.list {{ border:1px solid var(--hairline); border-radius:12px; overflow:hidden; }}
.li {{ display:flex; align-items:center; gap:12px; width:100%; font:inherit; font-size:14px; text-align:left; min-height:44px; padding:10px 16px; border:0; border-bottom:1px solid var(--hairline); color:var(--ink); }}
.li:last-child {{ border-bottom:0; }}
.li .ring {{ width:20px; height:20px; border-radius:50%; border:1.5px solid var(--control); flex:none; }}
.li small {{ margin-left:auto; color:var(--muted); font-size:12px; }}
.li.sel {{ --sb:var(--tint); box-shadow:inset 0 0 0 1px var(--teal); }}
.li.sel .ring {{ border:6px solid var(--teal); }}
.nav {{ display:flex; gap:4px; }}
.nav .b {{ min-height:36px; padding:0 12px; font-weight:500; color:var(--muted); }}
.nav .b[aria-current] {{ --sb:var(--tint); color:var(--ink); }}
.cards {{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }}
@media (max-width:860px) {{ .cards {{ grid-template-columns:1fr; }} }}
.card {{ border-radius:12px; padding:20px; background:#fff; min-height:96px; }}
.card.plain {{ border:1px solid var(--hairline); }}
.card.raised {{ border:1px solid var(--hairline); box-shadow:var(--lift); }}
.card.floating {{ border-radius:var(--floating); box-shadow:var(--bar); }}
.card.overlay {{ border-radius:var(--floating); box-shadow:var(--pane); }}
.card small {{ color:var(--muted); font-size:12px; display:block; margin-top:4px; }}
.ask {{ display:flex; align-items:center; gap:12px; max-width:640px; padding:8px 8px 8px 16px; border-radius:var(--floating); box-shadow:var(--bar); background:#fff; color:var(--muted); font-size:16px; }}
.ask .b {{ margin-left:auto; }}
.space {{ display:flex; align-items:flex-end; gap:16px; flex-wrap:wrap; }}
.space div {{ display:flex; flex-direction:column; align-items:center; gap:4px; font-size:12px; color:var(--muted); }}
.space i {{ display:block; background:var(--tint-border); border-radius:2px; }}
.decide li {{ margin-bottom:12px; font-size:16px; line-height:1.5; max-width:80ch; }}
.decide b {{ font-weight:600; }}
.rec {{ display:inline-block; font-size:12px; font-weight:500; color:var(--teal-text); background:var(--tint); border:1px solid var(--tint-border); border-radius:999px; padding:0 8px; margin-left:4px; }}
.pnav {{ display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 0; }}
.pnav a {{ font-size:12px; border:1px solid var(--hairline); border-radius:999px; padding:4px 10px; text-decoration:none; color:var(--ink); }}
.page {{ border-top:1px solid var(--hairline); padding:32px 0 8px; margin-top:32px; }}
.page header {{ display:flex; gap:12px; align-items:baseline; margin-bottom:16px; }}
.shots {{ display:flex; gap:24px; align-items:flex-start; overflow-x:auto; }}
.shots figure {{ margin:0; }}
.shots .full {{ display:block; border:1px solid var(--hairline); border-radius:8px; height:auto; }}
.shots .d {{ width:640px; max-width:70vw; }} .shots .m {{ width:200px; }}
figcaption {{ font-size:12px; color:var(--muted); margin-top:8px; }}
.tables {{ display:grid; grid-template-columns:3fr 2fr; gap:32px; margin-top:24px; align-items:start; }}
@media (max-width:1100px) {{ .tables {{ grid-template-columns:1fr; }} }}
h4 {{ margin:0; font-size:14px; font-weight:600; }}
h4.cap {{ margin-bottom:12px; }}
.ctrl {{ border-top:1px solid var(--hairline); padding:12px 0 16px; }}
.ctrl h4 {{ font-weight:500; color:var(--muted); font-size:12px; margin-bottom:8px; }}
.figs {{ display:flex; flex-wrap:wrap; gap:12px 16px; align-items:flex-end; }}
.figs figure {{ margin:0; max-width:100%; }}
.figs img {{ max-width:100%; height:auto; display:block; border-radius:4px; border:1px solid var(--hairline); }}
.figs figcaption {{ margin-top:4px; }}
.na {{ font-size:12px; color:var(--control); }}
.note {{ border-left:2px solid var(--teal); padding:4px 0 4px 16px; margin:24px 0; }}
</style></head>
<body>
<div class="top"><div class="in">
  <b>LandedNZ · design system</b>
  <a href="#system">System</a><a href="#pages">Every page</a><a href="#decide">Your decisions</a>
  <div class="ctl">
    <div class="seg" role="group" aria-label="State strength"><span>State strength</span>
      <button aria-pressed="true" data-k="strength" data-v="a">A · 6 / 10 %</button><button aria-pressed="false" data-k="strength" data-v="b">B · 8 / 12 %</button></div>
    <div class="seg" role="group" aria-label="Floating radius"><span>Floating radius</span>
      <button aria-pressed="true" data-k="radius" data-v="r16">16</button><button aria-pressed="false" data-k="radius" data-v="r18">18</button></div>
  </div>
</div></div>
<main>
<h1>One design system for the whole app</h1>
<p class="lede">Proposed for pieces 1 and 2 of the spec (<code>2026-10-31-design-system-design.md</code>). Everything on this page is live: hover and press the controls, and open this page on your phone to feel the tap feedback. Appearance only, no behaviour changes.</p>
<div class="facts">
  <div class="fact"><strong>10 hover reactions → 1 rule</strong><span>Measured on every page of the running app: 9 different hover changes, plus controls that do not react at all.</span></div>
  <div class="fact"><strong>18 of 21 phone controls: no tap feedback</strong><span>Enabled controls tested at 390 with a finger held down. Proposed: all 21 show a pressed state.</span></div>
  <div class="fact"><strong>At rest, pages look the same</strong><span>This organises the current look. The changes are in states, the merged radius and shadows, and one place for every value.</span></div>
</div>

<h2 id="system">Today: how controls react to the mouse</h2>
<p class="lede">Every visible control on the 10 pages at 1440, hovered by Playwright. Count, what changes, from, to.</p>
<table><thead><tr><th>Count</th><th>Change</th><th>From</th><th>To</th></tr></thead><tbody>{inv_rows}</tbody></table>
<p class="note">Rows with "none" include disabled Continue / Send (correct), the current nav item and the account avatar (no reaction today).</p>

<h2>Proposed: one state layer</h2>
<p>Hover and press lay a thin see-through layer over whatever the control already is. On light surfaces it is ink, so it always darkens; on dark surfaces it is white, so it always lightens. Model: Material 3 state layers (hover 8 %, pressed 10 %) and Carbon's translucent hover tokens. Switch strength A / B in the top bar.</p>
<div class="grid2">
  <div class="panel"><h3>Buttons on light surfaces</h3>
    <div class="lbl">Live: hover, press, Tab to focus</div>
    <div class="row"><button class="b st primary">Start task</button><button class="b st secondary">Ask about this</button><button class="b st ghost">Show 7 more</button><button class="b st danger">Delete account</button><button class="b st danger-ghost">Remove</button><button class="b st secondary icon" aria-label="Previous month">‹</button><button class="t">Open roadmap</button></div>
    <div class="lbl">Forced: rest · hover · pressed · focus · disabled</div>
    <div class="row"><button class="b st primary" tabindex="-1">Rest</button><button class="b st primary f-hover" tabindex="-1">Hover</button><button class="b st primary f-press" tabindex="-1">Pressed</button><button class="b st primary f-focus" tabindex="-1">Focus</button><button class="b st primary" disabled>Disabled</button></div>
    <div class="row"><button class="b st secondary" tabindex="-1">Rest</button><button class="b st secondary f-hover" tabindex="-1">Hover</button><button class="b st secondary f-press" tabindex="-1">Pressed</button><button class="b st secondary f-focus" tabindex="-1">Focus</button><button class="b st secondary" disabled>Disabled</button></div>
    <div class="row"><button class="b st ghost" tabindex="-1">Rest</button><button class="b st ghost f-hover" tabindex="-1">Hover</button><button class="b st ghost f-press" tabindex="-1">Pressed</button><button class="b st ghost f-focus" tabindex="-1">Focus</button><button class="b st ghost" disabled>Disabled</button></div>
  </div>
  <div class="panel dark"><h3>Buttons on dark surfaces (rail, crisis card, toast)</h3>
    <div class="lbl">Live</div>
    <div class="row"><button class="b st inv inverse">Change answers</button><button class="b st inv inverse-danger">Delete account…</button><button class="t">Change</button><button class="t">Manage</button></div>
    <div class="lbl">Forced: rest · hover · pressed · focus</div>
    <div class="row"><button class="b st inv inverse" tabindex="-1">Rest</button><button class="b st inv inverse f-hover" tabindex="-1">Hover</button><button class="b st inv inverse f-press" tabindex="-1">Pressed</button><button class="b st inv inverse f-focus" tabindex="-1">Focus</button></div>
  </div>
</div>

<h2>Selected rows, nav, inputs</h2>
<div class="grid2">
  <div class="panel"><h3>Rows: one hover, one "chosen" look</h3>
    <div class="list">
      <button class="li st"><span class="ring"></span>Get an NZ SIM card<small>15–30 minutes</small></button>
      <button class="li st sel"><span class="ring"></span>Open a bank account<small>chosen</small></button>
      <button class="li st"><span class="ring"></span>Apply for your IRD number<small>20–30 minutes</small></button>
    </div>
    <div class="lbl" style="margin-top:16px">Header nav: current page uses the selected surface; others get the layer</div>
    <div class="nav" style="margin-top:12px"><button class="b st" aria-current="page">Home</button><button class="b st">Roadmap</button><button class="b st">Settings</button></div>
  </div>
  <div class="panel"><h3>Inputs</h3>
    <div class="lbl">Rest</div><input class="field" value="Sat 31 Oct 2026" aria-label="Rest example">
    <div class="lbl" style="margin-top:12px">Focus (2 px teal ring, 2 px gap)</div><input class="field f-focus" value="Auckland" aria-label="Focus example">
    <div class="lbl" style="margin-top:12px">Error (ring from the danger role)</div><input class="field err" value="31/13/2026" aria-label="Error example"><div class="err-msg">Enter a real date, like 31 Oct 2026.</div>
    <p class="lede" style="font-size:12px;margin-top:12px">16 px text in fields at every width, so iPhones do not zoom in.</p>
  </div>
</div>

<h2>Surfaces, radius and elevation</h2>
<p class="lede">Four radius roles: control 8 · card 12 · floating · full. Three elevation levels instead of 13 shadows (lift and frame-top were the same shadow).</p>
<div class="cards">
  <div class="card plain"><b>Plain</b><small>hairline, no shadow · lists, settings</small></div>
  <div class="card raised"><b>Raised</b><small>card 12 · shadow-raised · Home cards</small></div>
  <div class="card overlay"><b>Overlay</b><small>floating radius · guide pane, phone sheet</small></div>
</div>
<div style="margin-top:24px" class="ask"><span>Ask about your first 90 days</span><button class="b st inv primary icon" aria-label="Send">↑</button></div>
<p class="lede" style="font-size:12px;margin-top:8px">Ask bar: floating radius + shadow-floating. Switch 16 / 18 in the top bar.</p>

<h2>Colour roles</h2>
<p class="lede">Pages use only these names. A new look later changes the palette values once; every page follows. Same colours as today.</p>
<table><thead><tr><th></th><th>Role</th><th>Value</th><th>Today's name</th><th>Used for</th></tr></thead><tbody>{roles}</tbody></table>

<h2>Spacing</h2>
<p class="lede">Today: 24 different spacing steps, many half steps (6, 10, 14 px). Proposed: one 4 px grid. Layout roles (page gutter, card padding, section gap, stack gap) get phone and desktop values; piece 3 uses them for the pages that feel empty on phones.</p>
<div class="space">{"".join(f'<div><i style="width:{v}px;height:{v}px"></i>{v}</div>' for v in [2,4,8,12,16,20,24,32,40,48,64,96])}</div>

<h2 id="pages">Every page: today vs proposed</h2>
<p class="lede">Real screenshots of the running app (test user, Auckland, AEWV). The proposed column is the state layer injected into the real page as a throwaway preview, at strength A. Phone column: finger held down on the control.</p>
<p class="note">Not captured: the guide pane and its answers (needs a live AI question), the delete dialog and toasts. They take the same rules; they get their own before/after in Task 9.</p>
<nav class="pnav" aria-label="Pages">{nav}</nav>
{pages}

<h2 id="decide">Your decisions</h2>
<ol class="decide">
  <li><b>State strength.</b> A: 6 % hover / 10 % pressed <span class="rec">recommended</span> (calm, close to today's wash shade) · B: 8 / 12 % (Material 3's values, more visible on phones).</li>
  <li><b>Floating radius</b> for ask bar, guide pane and phone sheet: 16 <span class="rec">recommended</span> (inside the 12–16 card range) · 18 (today's pane).</li>
  <li><b>Fold "avatar" into the selected surface</b> (#E8F2F1 → #F3F9F8): yes <span class="rec">recommended</span> · keep separate.</li>
  <li><b>Citation chip hover:</b> state layer like everything else <span class="rec">recommended</span> · keep today's solid teal fill.</li>
  <li><b>Pressed feedback everywhere on phones</b> (rows, nav, buttons, chips): yes <span class="rec">recommended</span>.</li>
</ol>
<p class="lede">Standards: Material 3 state layers m3.material.io/foundations/interaction/states/state-layers · Carbon colour tokens carbondesignsystem.com/elements/color/tokens · Apple HIG 44 pt targets · WCAG 2.2 SC 2.5.8. Full list with checked links goes in standards.md before build.</p>
</main>
<script>
document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {{
  const k = b.dataset.k
  document.documentElement.dataset[k] = b.dataset.v
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)))
}}))
</script>
</body></html>
"""
(HERE / "board.html").write_text(HTML)
print("wrote", HERE / "board.html")
