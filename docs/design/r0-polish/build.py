"""Generate the polish boards (Home x2, Settings, wrappers, sizing board) from one shared style."""
import json, pathlib

OUT = pathlib.Path(__file__).resolve().parent

CANVAS, CARD, LINE, CTRL = "#FFFFFF", "#FFFFFF", "#E3E8EA", "#7A8F99"
SHADOW = "0 1px 2px rgba(15,42,58,0.04), 0 16px 48px rgba(15,42,58,0.08)"

CSS = f"""
body{{margin:0}}
.ui{{container-type:inline-size;font-family:'Geist',system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#0F2A3A;background:{CANVAS};-webkit-font-smoothing:antialiased;min-height:100%;font-feature-settings:"ss01"}}
.ui h1,.ui h2,.ui h3,.ui p,.ui dl,.ui dd,.ui ol,.ui ul{{margin:0}}
.ui ol,.ui ul{{padding:0;list-style:none}}
.ui a{{color:#0A6463;text-decoration:none;transition:color .15s}}.ui a:hover{{color:#074B4A;text-decoration:underline}}
.ui :focus-visible{{outline:2px solid #0E7C7B;outline-offset:2px}}
.ui ::selection{{background:#CFE7E5}}
.t-page{{font-size:24px;line-height:1.25;font-weight:600;letter-spacing:-0.015em;text-wrap:balance}}
.t-task{{font-size:18px;line-height:1.35;font-weight:600;letter-spacing:-0.01em;text-wrap:balance}}
.t-card{{font-size:15px;line-height:1.4;font-weight:600}}
.t-small{{font-size:13px;line-height:1.45}}
.muted{{color:#4B6170}}
.tnum{{font-variant-numeric:tabular-nums}}
.btn{{font:inherit;font-weight:500;min-height:40px;padding:0 16px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;white-space:nowrap;box-sizing:border-box;transition:background-color .15s,border-color .15s,color .15s}}
.btn-sm{{min-height:32px;padding:0 12px;font-size:13px}}
.ui a.btn{{text-decoration:none}}
.btn-primary{{background:#0F2A3A;color:#FFFFFF;border:1px solid #0F2A3A}}.ui a.btn-primary{{color:#FFFFFF}}.btn-primary:hover{{background:#24465A}}.btn-primary:active{{background:#071C28}}
.btn-quiet{{background:#FFFFFF;color:#0F2A3A;border:1px solid #D5DFE2}}.ui a.btn-quiet{{color:#0F2A3A}}.btn-quiet:hover{{background:#F6F8F8;border-color:{CTRL}}}.btn-quiet:active{{background:#E3E8EA}}
.hdr{{background:#FFFFFF;border-bottom:1px solid #E4E9EB}}
.ftr{{border-top:1px solid #E4E9EB;margin-top:8px}}
.wrap{{max-width:1120px;margin:0 auto;box-sizing:border-box;padding:0 24px}}
.nav{{display:flex;gap:24px;align-self:stretch}}
.nav a{{display:flex;align-items:center;color:#4B6170;font-weight:500;border-bottom:2px solid transparent;margin-bottom:-1px}}
.ui .nav a:hover{{color:#0F2A3A;text-decoration:none}}
.nav a[aria-current="page"]{{color:#0F2A3A;border-bottom-color:#0F2A3A}}
.avatar{{width:32px;height:32px;border-radius:50%;background:#E8F2F1;color:#0A6463;font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;flex:none}}
.card{{background:{CARD};border:1px solid {LINE};border-radius:12px;box-shadow:{SHADOW};padding:20px;display:flex;flex-direction:column;gap:14px;min-width:0;box-sizing:border-box}}
.card-head{{display:flex;align-items:baseline;justify-content:space-between;gap:16px}}
.card-foot{{margin-top:auto}}
.card-head a,a.card-foot,.ftr a{{display:inline-flex;align-items:center;min-height:24px}}
.btn-primary:disabled{{background:#E3E8EA;border-color:#E3E8EA;color:#4B6170;cursor:not-allowed}}
.rows > li{{margin:0 -20px;border-top:1px solid {LINE}}}
.row{{display:flex;align-items:center;gap:12px;min-height:40px;padding:8px 20px;box-sizing:border-box;transition:background-color .15s}}
.ui a.row{{color:#0F2A3A;text-decoration:none}}.ui a.row:hover{{background:rgba(15,42,58,.035)}}.ui a.row:active{{background:rgba(15,42,58,.07)}}
.ellip{{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.wp{{flex:none;box-sizing:border-box;width:10px;height:10px;border-radius:50%;background:#FFFFFF;border:1.5px solid {CTRL}}}
.wp-now{{width:14px;height:14px;border:2px solid #0F2A3A}}
.wp-done{{background:#0E7C7B;border-color:#0E7C7B}}
.grid{{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px}}
.legs{{display:flex;gap:20px}}
.leg{{display:flex;flex-direction:column;gap:10px;min-width:max-content}}
.track{{height:14px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient({LINE},{LINE}) center/100% 2px no-repeat}}
.leg-label{{display:flex;flex-direction:column;white-space:nowrap}}
.hero-foot{{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}}
.hero-btns{{display:flex;gap:8px}}
.plan{{display:grid;grid-template-columns:72px minmax(0,1fr);gap:8px 12px;align-items:baseline}}
.plan dt{{font-size:13px;color:#4B6170}}.plan dd{{font-weight:500}}
.tick{{flex:none;width:16px;height:16px;border-radius:50%;background:#E8F2F1;display:flex;align-items:center;justify-content:center}}
.label{{font-size:13px;font-weight:500}}
.field{{font:inherit;font-size:15px;height:40px;padding:8px 12px;border-radius:8px;border:1px solid {CTRL};background:#FFFFFF;color:#0F2A3A;box-sizing:border-box;width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px}}
.form{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 20px}}
.form > div{{display:flex;flex-direction:column;gap:6px;min-width:0}}
@container (max-width: 860px){{.grid{{grid-template-columns:minmax(0,1fr)}}.span2{{grid-row:auto!important}}}}
@container (max-width: 560px){{
.wrap{{padding:0 16px}}.t-page{{font-size:22px}}
.btn{{min-height:44px}}.btn-sm{{min-height:44px}}.field{{height:44px;font-size:16px}}
.card{{padding:16px}}.rows > li{{margin:0 -16px}}.row{{padding:8px 16px;min-height:44px}}
.legs{{gap:8px}}.leg{{min-width:0}}.leg-off .leg-label{{display:none}}.wp{{width:8px;height:8px}}.wp-now{{width:12px;height:12px}}
.hero-btns{{width:100%;flex-direction:column-reverse}}.hero-btns .btn{{width:100%}}
.form{{grid-template-columns:minmax(0,1fr)}}.ellip{{white-space:normal}}
.wordmark,.kbd,.hide-sm{{display:none}}.nav{{gap:16px}}
}}
"""

LOGO = '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#0F2A3A"></rect><path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"></path><path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round"></path><circle cx="16.5" cy="7.5" r="2" fill="#3FC9B7"></circle></svg>'
TICK = '<span class="tick" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.2 5.2 4.2 7.1 7.8 3" stroke="#0A6463" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
CHEV = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 6.5 8 9.5l3-3" stroke="#4B6170" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CAL = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="#4B6170" stroke-width="1.3"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="#4B6170" stroke-width="1.3" stroke-linecap="round"/></svg>'


def page(title, body, w, h):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;display=swap" rel="stylesheet">
<style>{CSS}{ROUTE_CSS}{STATE_CSS}</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""


def header(current):
    links = "".join(
        f'<a href="#"{" aria-current=\"page\"" if n == current else ""}>{n}</a>' for n in ("Home", "Roadmap"))
    return f"""<header class="hdr">
    <div class="wrap" style="height: 56px; display: flex; align-items: center; gap: 32px">
      <a href="#" aria-label="LandedNZ home" style="display: flex; align-items: center; gap: 8px; color: #0F2A3A; text-decoration: none">{LOGO}<span class="wordmark" style="font-weight: 600; letter-spacing: -0.01em">LandedNZ</span></a>
      <nav class="nav" aria-label="Main">{links}</nav>
      <div style="margin-left: auto; display: flex; align-items: center; gap: 4px">
        <button class="btn btn-quiet btn-sm">Ask<span class="kbd muted" aria-hidden="true" style="border: 1px solid #E4E9EB; border-radius: 4px; padding: 0 5px; font-size: 13px; line-height: 16px">/</span></button>
        <button aria-haspopup="menu" aria-label="Account, Aleksandra Wiśniewska-Kowalczyk" style="font: inherit; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer"><span class="avatar" aria-hidden="true">AW</span></button>
      </div>
    </div>
  </header>"""


FOOTER = """<footer class="ftr"><div class="wrap t-small muted" style="height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 16px"><span>General information, not legal or tax advice.</span><span style="display: flex; gap: 20px"><a href="#">Privacy</a><a href="#">Terms</a></span></div></footer>"""


def legs(spec):
    out = []
    for name, total, done, when, now in spec:
        dots = []
        for i in range(total):
            cls = "wp-done" if i < done else ("wp-now" if now and i == done else "")
            dots.append(f'<span class="wp {cls}"></span>')
        off = "" if now else " leg-off"
        color = "#0F2A3A" if now else "#4B6170"
        out.append(f"""<li class="leg{off}" style="flex: {total} 1 0">
              <div class="track" aria-hidden="true">{''.join(dots)}</div>
              <div class="leg-label t-small tnum"><span style="font-weight: 500; color: {color}">{name}</span><span class="muted">{done} of {total} · {when}</span></div>
            </li>""")
    return "".join(out)


def task_rows(items):
    return "".join(f"""<li><a href="#" class="row"><span class="wp" aria-hidden="true"></span><span class="ellip" style="font-weight: 500" title="{t}">{t}</span><span class="t-small muted tnum hide-sm">{d}</span></a></li>""" for t, d in items)


TEAL, GREY = "#0E7C7B", "#C9D3D7"
ROUTE_CSS = """
.rv{position:relative}
.rv > svg{position:absolute;inset:0;width:100%;overflow:visible}
.pin{position:absolute;transform:translate(-50%,-50%)}
.stages{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.stage{display:flex;flex-direction:column;align-items:center;text-align:center}
.you{display:flex;flex-direction:column;align-items:center;gap:4px}
.you-tag{font-size:13px;font-weight:600;color:#FFFFFF;background:#0F2A3A;border-radius:999px;padding:2px 10px;white-space:nowrap}
.you-dot{width:14px;height:14px;border-radius:50%;background:#FFFFFF;border:3px solid #0F2A3A;box-sizing:border-box;box-shadow:0 0 0 6px rgba(15,42,58,.08)}
.tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.tile{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #E3E8EA;border-radius:10px;min-width:0}
.tile-now{border-color:#0F2A3A;box-shadow:inset 0 0 0 1px #0F2A3A}
.tile-off{background:#FAFBFB}
.stage-sum{display:none;font-size:13px}
@container (max-width: 560px){
.stages{display:none}.stage-sum{display:block}
.tiles{gap:6px}.tile{padding:8px 0;justify-content:center}.tile-text{display:none!important}
}
"""


def stage_sum(s):
    name, total, done, when, now = next(l for l in s["legs"] if l[4])
    return f'<p class="stage-sum tnum"><b style="font-weight: 600">{name}</b> <span class="muted">· {s["now_left"]}</span></p>'


def stage_labels(spec):
    out = []
    for i, (name, total, done, when, now) in enumerate(spec):
        cls = "" if now else " stage-off"
        if i in (0, len(spec) - 1):
            cls += " edge"
        state = "done ✓" if done == total else f"{done} of {total} · {when}"
        color = "#0F2A3A" if now else "#4B6170"
        out.append(f'<li class="stage t-small tnum{cls}"><span style="font-weight: {600 if now else 500}; color: {color}">{name}</span><span class="muted">{state}</span></li>')
    return f'<ol class="stages">{"".join(out)}</ol>'


def you_pin(x, y, label):
    return f'<div class="pin you" style="left: {x}%; top: {y}px; transform: translate(-50%, calc(-100% + 7px))"><span class="you-tag">{label}</span><span class="you-dot"></span></div>'


PLANE = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z" fill="#0E7C7B"/></svg>'


def route_flight(s):
    """Concept A: the flight. Ground at home, a flight arc, touchdown in NZ, then the road ahead."""
    H, G = 92, 74  # area height, ground line y
    arc = f"M0,{G} L200,{G} C250,{G} 255,18 300,18 C345,18 350,{G} 400,{G}"
    ahead = f"M400,{G} L1000,{G}"
    done_x = s["route_x"]
    return f"""<div class="rv" style="height: {H}px" aria-hidden="true">
        <svg viewBox="0 0 1000 {H}" preserveAspectRatio="none" height="{H}">
          <path d="{arc}" stroke="{TEAL if done_x >= 400 else GREY}" stroke-width="2.5" fill="none" vector-effect="non-scaling-stroke" {'' if done_x >= 400 else 'stroke-dasharray="4 5"'}/>
          <path d="{ahead}" stroke="{GREY}" stroke-width="2.5" fill="none" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/>
          {'<path d="M400,%d L%d,%d" stroke="%s" stroke-width="2.5" fill="none" vector-effect="non-scaling-stroke"/>' % (G, done_x, G, TEAL) if done_x > 400 else ''}
          <path d="M600,{G - 5} V{G + 5} M800,{G - 5} V{G + 5}" stroke="{GREY}" stroke-width="2" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="pin" style="left: 30%; top: 18px; transform: translate(-50%, -50%) rotate(90deg)">{PLANE}</div>
        {you_pin(s["route_x"] / 10, G, s["you"])}
      </div>
      {stage_labels(s["legs"])}{stage_sum(s)}"""


def terrain_y(x):
    import math
    return 54 - 20 * math.sin(x / 1000 * math.pi * 2.6 + 0.3) - 9 * math.sin(x / 1000 * math.pi * 6.3)


def route_track(s, H=96):
    """Concept B: a tramping track. A hill profile like a Great Walk map, walked part filled, track markers at each stage."""
    pts = [(x, terrain_y(x)) for x in range(0, 1001, 20)]
    line = "M" + " L".join(f"{x},{y:.1f}" for x, y in pts)
    dx = s["route_x"]
    walked = [(x, y) for x, y in pts if x <= dx] + [(dx, terrain_y(dx))]
    wline = "M" + " L".join(f"{x},{y:.1f}" for x, y in walked)
    fill = wline + f" L{dx},{H} L0,{H} Z"
    contours = "".join(
        f'<path d="M' + " L".join(f"{x},{y + off:.1f}" for x, y in pts) + f'" stroke="#E3E8EA" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>'
        for off in (12, 24))
    posts = "".join(
        f'<div class="pin" style="left: {x / 10}%; top: {terrain_y(x) - 10:.0f}px"><svg aria-hidden="true" width="10" height="20" viewBox="0 0 10 20"><path d="M1 20V1l8 4-8 4" fill="{TEAL if x <= dx else "#FFFFFF"}" stroke="{TEAL if x <= dx else "#7A8F99"}" stroke-width="1.5" stroke-linejoin="round"/></svg></div>'
        for x in (200, 400, 600, 800, 1000))
    return f"""<div class="rv" style="height: {H}px; margin-top: 18px" aria-hidden="true">
        <svg viewBox="0 0 1000 {H}" preserveAspectRatio="none" height="{H}">
          <defs><linearGradient id="walk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{TEAL}" stop-opacity=".22"/><stop offset="1" stop-color="{TEAL}" stop-opacity="0"/></linearGradient></defs>
          {contours}
          <path d="{fill}" fill="url(#walk)"/>
          <path d="{line}" stroke="{GREY}" stroke-width="2" fill="none" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>
          <path d="{wline}" stroke="{TEAL}" stroke-width="2.5" fill="none" vector-effect="non-scaling-stroke"/>
        </svg>
        {posts}
        {you_pin(dx / 10, terrain_y(dx), s["you"])}
      </div>
      {stage_labels(s["legs"])}{stage_sum(s)}"""


def ring(done, total, size=40):
    r = (size - 5) / 2
    c = 2 * 3.14159 * r
    frac = done / total
    col = TEAL if done else GREY
    inner = (f'<path d="M{size/2-5},{size/2} l3.5,3.5 l6.5,-7" stroke="{TEAL}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
             if done == total else
             f'<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#0F2A3A" font-family="Geist, system-ui">{done}/{total}</text>')
    return f"""<svg aria-hidden="true" width="{size}" height="{size}" viewBox="0 0 {size} {size}" style="flex: none">
          <circle cx="{size/2}" cy="{size/2}" r="{r}" stroke="#E3E8EA" stroke-width="3.5" fill="none"/>
          <circle cx="{size/2}" cy="{size/2}" r="{r}" stroke="{col}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="{c * frac:.1f} {c:.1f}" transform="rotate(-90 {size/2} {size/2})"/>
          {inner}
        </svg>"""


def route_tiles(s):
    """Concept C: stage tiles. One tile per stage with a progress ring; the stage you're in is outlined and says how long is left."""
    out = []
    for name, total, done, when, now in s["legs"]:
        cls = " tile-now" if now else (" tile-off" if done == 0 else "")
        sub = s["now_left"] if now else ("Done" if done == total else when)
        out.append(f"""<li class="tile{cls}">{ring(done, total)}<span style="display: flex; flex-direction: column; min-width: 0" class="t-small tnum tile-text"><span style="font-weight: {600 if now else 500}; white-space: nowrap; color: {'#0F2A3A' if now or done else '#4B6170'}">{name}</span><span class="muted" style="white-space: nowrap">{sub}</span></span></li>""")
    return f'<ol class="tiles">{"".join(out)}</ol>{stage_sum(s)}'


ROUTES = {"dots": lambda s: f'<ol class="legs">{legs(s["legs"])}</ol>', "flight": route_flight, "track": route_track, "tiles": route_tiles}


def home(s, route="dots"):
    done_body = (
        f"""<ol class="rows">{''.join(f'<li><a href="#" class="row">{TICK}<span class="ellip" title="{t}">{t}</span><span class="t-small muted tnum">{d}</span></a></li>' for t, d in s["done"])}</ol>
            <a href="#" class="card-foot t-small" style="font-weight: 500">See all {s['done_total']} done</a>"""
        if s["done"] else
        """<p class="muted">Nothing yet. Tasks you finish show up here, newest first.</p>
            <a href="#" class="card-foot t-small" style="font-weight: 500">Already done some? Tick them off</a>""")
    return f"""<div class="ui">
  {header("Home")}
  <main class="wrap" style="padding-top: 24px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 16px">
    <section aria-labelledby="hello" style="display: flex; flex-direction: column; gap: 4px">
      <h1 id="hello" class="t-page">{s['hello']}</h1>
      <p class="muted tnum">{s['sub']}</p>
    </section>
    <section class="card" aria-labelledby="route">
      <div class="card-head">
        <h2 id="route" class="t-card">Your roadmap</h2>
        <a href="#" class="t-small tnum" style="font-weight: 500">{s['progress']} · Open roadmap</a>
      </div>
      {ROUTES[route](s)}
    </section>
    <div class="grid">
      <section class="card" aria-labelledby="next">
        <div class="card-head">
          <h2 id="next" class="t-card">Up next</h2>
          <span class="t-small muted tnum">{s['next_meta']}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px">
          <h3 class="t-task">{s['next_title']}</h3>
          <p class="muted" style="max-width: 64ch">{s['next_text']}</p>
        </div>
        <div class="hero-foot card-foot">
          <span class="t-small muted tnum">{s['next_time']}</span>
          <div class="hero-btns">
            <a href="#" class="btn btn-quiet">Ask about this</a>
            <a href="#" class="btn btn-primary">Start task</a>
          </div>
        </div>
      </section>
      <section class="card" aria-labelledby="plan">
        <div class="card-head">
          <h2 id="plan" class="t-card">Your plan</h2>
          <a href="#" class="t-small" style="font-weight: 500" aria-label="Edit your plan">Edit</a>
        </div>
        <dl class="plan">
          <dt>Visa</dt><dd>Partner work visa</dd>
          <dt>City</dt><dd>Christchurch</dd>
          <dt>Moving</dt><dd>Me, my partner and our children</dd>
          <dt>Work</dt><dd>Teaching</dd>
          <dt>Arriving</dt><dd class="tnum">1 March 2027</dd>
        </dl>
      </section>
      <section class="card" aria-labelledby="week">
        <div class="card-head">
          <h2 id="week" class="t-card">Also this week</h2>
          <span class="t-small muted tnum">{s['week_count']}</span>
        </div>
        <ol class="rows">{task_rows(s['week'])}</ol>
        <p class="card-foot t-small muted">{s['week_foot']}</p>
      </section>
      <section class="card" aria-labelledby="done">
        <div class="card-head">
          <h2 id="done" class="t-card">Recently done</h2>
          {'<span class="t-small muted tnum">' + str(s['done_total']) + ' done</span>' if s['done'] else ''}
        </div>
        {done_body}
      </section>
    </div>
  </main>
  {FOOTER}
</div>"""


EARLY = dict(
    route_x=40, you="You · 124 days to go", now_left="0 of 10 · by 1 Mar",
    hello="Welcome, Aleksandra",
    sub="124 days until you land on 1 March 2027.",
    progress="0 of 25 done",
    legs=[("Before you fly", 10, 0, "by 1 Mar", True), ("Arrival", 4, 0, "1–2 Mar", False),
          ("Week 1", 5, 0, "to 8 Mar", False), ("Month 1", 5, 0, "to 31 Mar", False), ("Later", 1, 0, "from April", False)],
    next_meta="Before you fly · task 1 of 10",
    next_title="Choose where to live",
    next_text="Immigration New Zealand says where you live might depend on your job or where you want to study, and other things can affect the decision too.",
    next_time="About 2–3 hours",
    week_count="2 tasks",
    week=[("Book temporary accommodation", "1–2 hours"),
          ("Check whether you need a qualification assessment", "2–4 hours, then NZQA")],
    week_foot="After you land: an NZ SIM card, a bank account, your IRD number and your visa conditions.",
    done=[], done_total=0,
)

LATER = dict(
    route_x=430, you="You · day 3", now_left="0 of 5 · 6 days left",
    hello="Welcome to Christchurch, Aleksandra",
    sub="Day 3 in Christchurch · 14 of 25 tasks done.",
    progress="14 of 25 done",
    legs=[("Before you fly", 10, 10, "done", False), ("Arrival", 4, 4, "done", False),
          ("Week 1", 5, 0, "to 8 Mar", True), ("Month 1", 5, 0, "to 31 Mar", False), ("Later", 1, 0, "from April", False)],
    next_meta="Week 1 · task 1 of 5",
    next_title="Apply for your IRD number",
    next_text="Inland Revenue says you need an IRD number before you start work, so your employer can take the right amount of tax.",
    next_time="About 30 minutes",
    week_count="4 more tasks",
    week=[("Register with a GP for the whole family", "1 hour"),
          ("Enrol your children at a local school", "2–3 hours"),
          ("Check your visa conditions in your eVisa record", "20 minutes")],
    week_foot='<a href="#" style="font-weight: 500">1 more this week · Open roadmap</a>',
    done=[("Open an NZ bank account", "2 Mar"), ("Get an NZ SIM card", "2 Mar"), ("Collect your bags and clear biosecurity", "1 Mar")],
    done_total=14,
)


def field(label, value, icon=CHEV, fid=""):
    return f"""<div><span class="label" id="{fid}">{label}</span><span class="field" role="button" aria-labelledby="{fid}"><span class="ellip">{value}</span>{icon}</span></div>"""


SETTINGS = f"""<div class="ui">
  {header("")}
  <main class="wrap" style="padding-top: 24px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 16px">
    <h1 class="t-page">Settings</h1>
    <div class="grid">
      <section class="card span2" aria-labelledby="plan" style="grid-row: span 2; gap: 20px">
        <div style="display: flex; flex-direction: column; gap: 4px">
          <h2 id="plan" class="t-card">Your plan</h2>
          <p class="t-small muted" style="max-width: 60ch">Your roadmap is built from these answers. Change one and it's rebuilt; tasks you've done stay done.</p>
        </div>
        <div class="form">
          {field("Visa", "Partner work visa", fid="f1")}
          {field("City", "Greater Christchurch", fid="f2")}
          {field("Who's moving with you", "Me, my partner and our children", fid="f3")}
          {field("Work", "Teaching", fid="f4")}
          {field("Arrival date", "1 March 2027", CAL, "f5")}
        </div>
        <div class="card-foot" style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; border-top: 1px solid {LINE}; margin: 0 -20px -4px; padding: 16px 20px 0">
          <span class="t-small muted">No unsaved changes</span>
          <button class="btn btn-primary" disabled>Save changes</button>
        </div>
      </section>
      <section class="card" aria-labelledby="acct">
        <h2 id="acct" class="t-card">Account</h2>
        <div style="display: flex; gap: 12px; align-items: flex-start">
          <span class="avatar" aria-hidden="true" style="width: 40px; height: 40px; font-size: 13px">AW</span>
          <div style="min-width: 0; display: flex; flex-direction: column">
            <span style="font-weight: 500; overflow-wrap: anywhere">Aleksandra Wiśniewska-Kowalczyk</span>
            <span class="t-small muted" style="overflow-wrap: anywhere">aleksandra.wk@example.com</span><span class="t-small muted">Signs in with email</span>
          </div>
        </div>
        <button class="btn btn-quiet card-foot" style="align-self: flex-start">Sign out</button>
      </section>
      <section class="card" aria-labelledby="del" style="gap: 12px">
        <h2 id="del" class="t-card">Delete account</h2>
        <p class="t-small muted">Removes your answers, your roadmap and your questions to the assistant. This can't be undone.</p>
        <button class="btn btn-quiet card-foot" style="align-self: flex-start; color: #A3292B">Delete my account</button>
      </section>
    </div>
  </main>
  {FOOTER}
</div>"""


def sample(size, weight, role, use, text, extra=""):
    return f"""<div style="display: grid; grid-template-columns: 120px minmax(0,1fr); gap: 16px; align-items: baseline; padding: 10px 0; border-top: 1px solid {LINE}">
      <span class="t-small muted tnum">{size} / {weight}<br>{role}</span>
      <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: {size}px; font-weight: {weight}; line-height: 1.3; {extra}">{text}</span><span class="t-small muted">{use}</span></div>
    </div>"""


SIZING = f"""<div class="ui" style="padding: 40px; box-sizing: border-box; height: 100%">
  <div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 16px; align-items: stretch">
    <section class="card" aria-labelledby="ty" style="gap: 8px">
      <h2 id="ty" class="t-card">Type: one family, four sizes</h2>
      <p class="t-small muted" style="margin-bottom: 8px">Geist stays. It's a clean product sans with tabular figures; a second family would only add noise. Steps are about 1.2× apart, so roles read clearly without anything shouting. The old 32 px titles and 48 px numbers are gone.</p>
      {sample(24, 600, "Page title", "One per page, task titles too. 22 px on phones.", "Welcome to Christchurch", "letter-spacing:-0.015em")}
      {sample(18, 600, "Section title", "The Up next task and task-page sections.", "Apply for your IRD number", "letter-spacing:-0.01em")}
      {sample(15, 600, "Card title", "Same size as body; weight does the work.", "Your plan")}
      {sample(15, 400, "Body", "Everything you read. Inputs are 16 px on phones.", "Me, my partner and our children")}
      {sample(13, 400, "Meta", "Dates, counts, hints. Only citation numbers go smaller (12 px, 24 px tap area).", "2 Mar · 14 of 25 done")}
    </section>
    <section class="card" aria-labelledby="ct">
      <h2 id="ct" class="t-card">Controls: two heights</h2>
      <p class="t-small muted">40 px on desktop. On phones every button, chip and field is 44 px. Small buttons (32 px) only in desktop headers and task nav. Text links get at least a 24 px tap area. Radius 8.</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
        <span class="btn btn-primary">Save changes</span><span class="btn btn-quiet">Ask about this</span><span class="btn btn-quiet btn-sm">Previous</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px"><span class="label">City</span><span class="field"><span>Greater Christchurch</span>{CHEV}</span></div>
      <p class="t-small muted">Fields are as wide as their column, never the full page. Labels sit above, 13 px medium.</p>
      <div style="display: grid; grid-template-columns: auto repeat(4, auto); gap: 8px; align-items: center; justify-content: start; font-size: 13px; color: #4B6170">
        <span></span><span>Rest</span><span>Hover</span><span>Pressed</span><span>Busy</span>
        <span>Primary</span>
        <span class="btn btn-sm" style="background:#0F2A3A;color:#fff;border:1px solid #0F2A3A">Done</span>
        <span class="btn btn-sm" style="background:#24465A;color:#fff;border:1px solid #24465A">Done</span>
        <span class="btn btn-sm" style="background:#071C28;color:#fff;border:1px solid #071C28">Done</span>
        <span class="btn btn-sm" style="background:#24465A;color:#fff;border:1px solid #24465A">Saving…</span>
      </div>
    </section>
    <section class="card" aria-labelledby="sf">
      <h2 id="sf" class="t-card">Surfaces and spacing</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px">
        <div style="display: flex; flex-direction: column; gap: 6px"><div style="height: 56px; border-radius: 12px; background: {CARD}; border: 1px solid {LINE}; box-shadow: {SHADOW}"></div><span class="t-small"><b style="font-weight:500">Card</b> <span class="muted">white, border #E3E8EA, landing lift shadow</span></span></div>
      </div>
      <p class="t-small muted">The page is plain white, like the landing page. Cards are the landing-page card exactly: bright white, hairline #E3E8EA border and the same lift shadow, so they float off the page. Radius 12, 20 px padding (16 on phones).</p>
      <p class="t-small muted">Every page ends with the same footer as the landing page.</p>
      <p class="t-small muted">Spacing on a 4 px base: 4 · 8 · 12 · 16 · 20 · 24. 16 between cards and between page sections.</p>
      <p class="t-small muted">Cards in the same row share a height; columns keep their own width (main grows, side is 360 px on every page). Home lists cap at 3 rows and link to the rest, so a card never grows with your data. Sources always list every source the page cites.</p>
    </section>
  </div>
</div>"""

WEEK1 = [("Apply for your IRD number", "30 minutes", "now"),
         ("Register with a GP for the whole family", "1 hour", ""),
         ("Enrol your children at a local school", "2–3 hours", ""),
         ("Check your visa conditions in your eVisa record", "20 minutes", ""),
         ("Find settlement support and English classes", "1 hour", "")]


def stage_card(name, meta, rows=None, show=None, now=False):
    head = f"""<div class="card-head"><h2 class="t-card" style="display: flex; align-items: center; gap: 10px">{name}</h2><span class="t-small muted tnum">{meta}</span></div>"""
    if rows is None:
        return f"""<section class="card stage-c">{head}<a href="#" class="t-small" style="font-weight: 500">{show}</a></section>"""
    body = "".join(
        f'<li><a href="#" class="row"><span class="wp{" wp-now" if st else ""}" aria-hidden="true"></span><span class="ellip" style="font-weight: {600 if st else 500}">{t}</span>{"<span class=\'t-small tnum\' style=\'font-weight: 500; color: #0A6463\'>Up next</span>" if st else ""}<span class="t-small muted tnum hide-sm">{d}</span></a></li>'
        for t, d, st in rows)
    return f"""<section class="card{' card-now' if now else ''}">{head}<ol class="rows">{body}</ol></section>"""


def roadmap(s):
    return f"""<div class="ui">
  {header("Roadmap")}
  <main class="wrap" style="padding-top: 24px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 16px">
    <section style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px">
      <h1 class="t-page">Your roadmap</h1>
      <p class="muted tnum">{s['progress']} · landed 1 March 2027</p>
    </section>
    <section class="card" aria-label="Where you are">
      {route_track(s, 120)}
    </section>
    <div class="grid">
      <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
        {stage_card("Week 1", "0 of 5 · to 8 Mar · 6 days left", WEEK1, now=True)}
        <section class="card" aria-labelledby="os">
          <h2 id="os" class="t-card">Other stages</h2>
          <ol class="rows">{"".join(f'<li><div class="row"><span class="wp{" wp-done" if d else ""}" aria-hidden="true"></span><span class="ellip" style="font-weight: 500">{n}</span><span class="t-small muted tnum hide-sm">{m}</span><button class="btn btn-quiet btn-sm" aria-expanded="false">Show<span class="vh"> {n} tasks</span></button></div></li>' for n, m, d in (("Month 1", "5 tasks · to 31 Mar", 0), ("Later", "1 task · from April", 0), ("Before you fly", "10 of 10 done", 1), ("Arrival", "4 of 4 done", 1)))}</ol>
        </section>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
        <section class="card" aria-labelledby="rn">
          <div class="card-head"><h2 id="rn" class="t-card">Up next</h2><span class="t-small muted tnum">About 30 minutes</span></div>
          <h3 class="t-task">Apply for your IRD number</h3>
          <p class="muted">You need it before you start work, so your employer can take the right amount of tax.</p>
          <a href="#" class="btn btn-primary" style="align-self: flex-start">Start task</a>
        </section>
        <section class="card" aria-labelledby="kd">
          <h2 id="kd" class="t-card">Key dates</h2>
          <dl class="plan" style="grid-template-columns: 96px minmax(0,1fr)">
            <dt class="tnum">1 Mar</dt><dd>You landed</dd>
            <dt class="tnum">8 Mar</dt><dd>Week 1 ends</dd>
            <dt class="tnum">31 Mar</dt><dd>Month 1 ends</dd>
          </dl>
          <a href="#" class="t-small card-foot" style="font-weight: 500">Change your arrival date</a>
        </section>
      </div>
    </div>
  </main>
  {FOOTER}
</div>"""


def state(label, inner, note=""):
    return f"""<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0">
      <p class="t-small" style="font-weight: 600">{label}</p>
      {inner}
      {f'<p class="t-small muted">{note}</p>' if note else ''}
    </div>"""


BAR = lambda w, h=12: f'<span class="sk" style="width: {w}; height: {h}px"></span>'
STATES = f"""<div class="ui" style="padding: 40px; box-sizing: border-box">
  <div style="display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 40px 32px; align-items: start">
    {state("Loading", f'<section class="card" aria-busy="true">{BAR("40%", 14)}{BAR("100%")}{BAR("85%")}{BAR("60%")}</section>', "Grey blocks in the shape of the cards. They pulse gently, and not at all with reduced motion. Shown after 300 ms, never as a full-page spinner.")}
    {state("Can't reach LandedNZ", '<section class="card" role="alert" style="gap: 12px"><h2 class="t-card">Can&apos;t reach LandedNZ</h2><p class="muted">Your progress is saved. Check your connection, then try again.</p><button class="btn btn-primary" style="align-self: flex-start">Try again</button></section>', "The same card on every page. One way forward.")}
    {state("Field error", f'<section class="card" style="gap: 6px"><span class="label" id="ad">Arrival date</span><span class="field field-err" role="button" aria-labelledby="ad" aria-describedby="ade"><span>28 February 2026</span>{CAL}</span><p id="ade" class="t-small err">Pick a date from today onwards.</p></section>', "Says what to do, under the field. Shown on save, not while typing.")}
    {state("Saved", f'<div class="toast" role="status">{TICK}<span>Plan saved. Your roadmap was rebuilt.</span><button class="toast-btn">Undo</button></div>', "Bottom centre, 6 seconds, stays while hovered or focused. Undo puts the old answers back.")}
    {state("Task done", f'<section class="card" style="gap: 0"><ol class="rows" style="margin-top: -14px"><li style="border-top: 0"><span class="row">{TICK}<span class="ellip muted">Apply for your IRD number</span><button class="toast-btn" style="color: #0A6463">Undo</button></span></li></ol></section>', "The row stays in place with a tick and Undo for 6 seconds, then moves to Recently done.")}
    {state("Saving", '<section class="card" style="gap: 12px; flex-direction: row; justify-content: flex-end; align-items: center"><button class="btn btn-primary" aria-busy="true" style="background: #24465A; border-color: #24465A">Saving…</button></section>', "The button keeps its width and says what it&apos;s doing. No spinner icon.")}
    {state("Ask: thinking", '<section class="card" style="gap: 12px"><p class="t-small muted">You asked</p><p style="font-weight: 500">Can my partner work while I study?</p><p class="t-small muted" role="status" style="display: flex; align-items: center; gap: 8px"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>Checking official sources…</p></section>')}
    {state("Ask: couldn&apos;t answer", '<section class="card" style="gap: 12px"><p style="font-weight: 500">Can my partner work while I study?</p><p class="muted" role="alert">That didn&apos;t work. Your question is still here, so you can send it again.</p><div style="display: flex; gap: 8px"><button class="btn btn-quiet">Try again</button></div></section>', "Keeps the question. Over the daily limit it says when Ask opens again.")}
    {state("Delete account", '<div class="dialog" role="dialog" aria-labelledby="dt" aria-modal="true"><h2 id="dt" class="t-card">Delete your account?</h2><p class="t-small muted">This removes your answers, your roadmap and your questions to the assistant. It can&apos;t be undone.</p><div style="display: flex; justify-content: flex-end; gap: 8px"><button class="btn btn-quiet">Keep my account</button><button class="btn btn-danger">Delete account</button></div></div>', "Focus starts on Keep my account. Escape closes it.")}
    {state("Empty: nothing this week", '<section class="card" style="gap: 8px"><h2 class="t-card">Also this week</h2><p class="muted">Nothing else this week. Next week starts on 9 March.</p></section>', "Empty cards say what happens next, never just &quot;No items&quot;.")}
    {state("Focus", '<section class="card" style="flex-direction: row; gap: 12px; align-items: center"><button class="btn btn-primary" style="outline: 2px solid #0E7C7B; outline-offset: 2px">Start task</button><a href="#" class="t-small" style="font-weight: 500; outline: 2px solid #0E7C7B; outline-offset: 2px; border-radius: 4px">Open roadmap</a></section>', "Teal 2 px ring, 2 px gap, on every control. Keyboard only.")}
    {state("Disabled", '<section class="card" style="flex-direction: row; gap: 12px; align-items: center; justify-content: flex-end"><span class="t-small muted">No unsaved changes</span><button class="btn btn-primary" disabled>Save changes</button></section>', "Disabled controls say why, next to them.")}
  </div>
</div>"""

STATE_CSS = """
.sk{display:block;border-radius:6px;background:#EEF2F3}
.err{color:#A3292B}
.field-err{border-color:#A3292B;box-shadow:0 0 0 1px #A3292B}
.toast{display:flex;align-items:center;gap:12px;align-self:flex-start;background:#0F2A3A;color:#FFFFFF;border-radius:10px;padding:10px 10px 10px 14px;box-shadow:0 8px 24px rgba(15,42,58,.18)}
.toast-btn{font:inherit;font-weight:600;background:transparent;border:0;color:#7FE0D3;cursor:pointer;min-height:32px;padding:0 8px;border-radius:6px}
.dots{display:inline-flex;gap:3px}.dots i{width:5px;height:5px;border-radius:50%;background:#0E7C7B;opacity:.4}
.dialog{background:#FFFFFF;border:1px solid #E3E8EA;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 2px rgba(15,42,58,.06),0 24px 64px rgba(15,42,58,.18)}
.btn-danger{background:#A3292B;color:#FFFFFF;border:1px solid #A3292B}
.card-now{border-color:#0F2A3A}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
"""


def wrapper(title, name, h):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;display=swap" rel="stylesheet">
<style>body{{margin:0}}</style>
</helmet>
<div style="width: 390px; background: {CANVAS}; font-family: 'Geist', system-ui, sans-serif; color: #0F2A3A">
  <dc-import name="{name}" hint-size="390px,{h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""


def image(title, src, w, h):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>body{{margin:0}}</style>
</helmet>
<div style="width: {w}px; height: {h}px; background: #FFFFFF">
  <img src="{src}" alt="{title}" style="display: block; width: {w}px; height: {h}px">
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""


files = {
    "Main.dc.html": page("Home, polished", home(EARLY, "track"), 1440, 938),
    "HomeLater.dc.html": page("Home, later in the journey", home(LATER, "track"), 1440, 984),
    "Roadmap.dc.html": page("Roadmap page, polished", roadmap(LATER), 1440, 1036),
    "RoadmapPhone.dc.html": wrapper("Roadmap page on a phone", "Roadmap", 1553),
    "States.dc.html": page("States", STATES, 1440, 949),
    "Settings.dc.html": page("Settings, polished", SETTINGS, 1440, 642),
    "Details.dc.html": page("Sizing rules", SIZING, 1440, 580),
    "HomePhone.dc.html": wrapper("Home on a phone, polished", "HomeLater", 1595),
    "SettingsPhone.dc.html": wrapper("Settings on a phone, polished", "Settings", 1200),
    "SettingsBefore.dc.html": image("Settings as built today, 1440 px", "/_blob/a45ca222065a146b8426304107b7be75", 1440, 1167),
    "SettingsPhoneBefore.dc.html": image("Settings as built today, 390 px", "/_blob/9b7044f42b591ce46e6eb67161e099b8", 390, 1467),
}
for name, text in files.items():
    (OUT / name).write_text(text)

R = {"home": 0, "settings": 4400, "task": 6000, "rules": 11000, "roadmap": 2300, "states": 9700}
canvas = {
    "v": 3, "createdOnFiles": {"v": 1, "at": "2026-10-28T09:00:00Z"}, "title": "LandedNZ polish boards",
    "launch": {"view": "canvas"}, "pages": [],
    "boards": {
        "HomeBefore.dc.html": {"x": 0, "y": R["home"], "w": 1440, "h": 1139, "title": "Home, now (1440)"},
        "Main.dc.html": {"x": 1520, "y": R["home"], "w": 1440, "h": 938, "title": "Home, polished: first visit (1440)"},
        "HomeLater.dc.html": {"x": 1520, "y": R["home"] + 1040, "w": 1440, "h": 984, "title": "Home, polished: day 3 after landing, lists capped (1440)"},
        "HomePhoneBefore.dc.html": {"x": 3040, "y": R["home"], "w": 390, "h": 1820, "title": "Home, now (390)"},
        "HomePhone.dc.html": {"x": 3510, "y": R["home"], "w": 390, "h": 1595, "title": "Home, polished: day 3 (390)"},
        "Roadmap.dc.html": {"x": 1520, "y": R["roadmap"], "w": 1440, "h": 1036, "title": "Roadmap page, polished: day 3 (1440)"},
        "RoadmapPhone.dc.html": {"x": 3510, "y": R["roadmap"], "w": 390, "h": 1553, "title": "Roadmap page, polished (390)"},
        "States.dc.html": {"x": 0, "y": R["states"], "w": 1440, "h": 949, "title": "States: loading, errors, saved, undo, Ask, dialogs, empty, focus"},
        "SettingsBefore.dc.html": {"x": 0, "y": R["settings"], "w": 1440, "h": 1167, "title": "Settings, now (1440)"},
        "Settings.dc.html": {"x": 1520, "y": R["settings"], "w": 1440, "h": 642, "title": "Settings, polished (1440)"},
        "SettingsPhoneBefore.dc.html": {"x": 3040, "y": R["settings"], "w": 390, "h": 1467, "title": "Settings, now (390)"},
        "SettingsPhone.dc.html": {"x": 3510, "y": R["settings"], "w": 390, "h": 1200, "title": "Settings, polished (390)"},
        "TaskBefore.dc.html": {"x": 0, "y": R["task"], "w": 1440, "h": 1591, "title": "Task page, now (1440)"},
        "TaskPage.dc.html": {"x": 1520, "y": R["task"], "w": 1440, "h": 1640, "expand": "fill", "title": "Task page, polished (1440)"},
        "TaskPhoneBefore.dc.html": {"x": 3040, "y": R["task"], "w": 390, "h": 2615, "title": "Task page, now (390)"},
        "TaskPhone.dc.html": {"x": 3510, "y": R["task"], "w": 390, "h": 3120, "title": "Task page, polished (390)"},
        "Details.dc.html": {"x": 0, "y": R["rules"], "w": 1440, "h": 580, "title": "Sizing rules"},
    },
    "order": ["Main.dc.html", "HomeLater.dc.html", "HomeBefore.dc.html", "HomePhoneBefore.dc.html", "HomePhone.dc.html",
              "Roadmap.dc.html", "RoadmapPhone.dc.html", "States.dc.html", "SettingsBefore.dc.html", "Settings.dc.html", "SettingsPhoneBefore.dc.html", "SettingsPhone.dc.html",
              "TaskBefore.dc.html", "TaskPage.dc.html", "TaskPhoneBefore.dc.html", "TaskPhone.dc.html", "Details.dc.html"],
    "notes": {
        "t1": {"x": 0, "y": R["home"] - 300, "text": "Home: now vs polished (same long-name profile)", "kind": "title1", "maxW": 3900},
        "t6": {"x": 0, "y": R["roadmap"] - 300, "text": "Roadmap page: the track, then one card per stage", "kind": "title1", "maxW": 3900},
        "t7": {"x": 0, "y": R["states"] - 300, "text": "States every screen uses", "kind": "title1", "maxW": 1440},
        "t4": {"x": 0, "y": R["settings"] - 300, "text": "Settings: now vs polished", "kind": "title1", "maxW": 3900},
        "t2": {"x": 0, "y": R["task"] - 300, "text": "Task page: now vs polished", "kind": "title1", "maxW": 3900},
        "t3": {"x": 0, "y": R["rules"] - 300, "text": "Sizing rules behind every screen", "kind": "title1", "maxW": 1440},
    },
    "designSystems": [],
}
(OUT / "canvas.json").write_text(json.dumps(canvas, indent=1, ensure_ascii=False))
print("wrote", len(files) + 1, "files")
