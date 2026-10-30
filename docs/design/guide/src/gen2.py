"""Guide direction D: modern premium assistant pane. Host pages reuse r1-final parts from gen.py."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen import CSS as BASE, ic, header, tabs, home_main, task_main, roadmap_main, settings_memory

CSS = BASE + r"""
/* ---------- D: assistant pane ---------- */
.d{zoom:.85}
.m{zoom:1}
.page{max-width:1280px}
.stage{display:grid;grid-template-columns:minmax(0,1fr) 484px;grid-template-rows:minmax(0,1fr);height:836px;background:var(--wash)}
.stage>.wrap{overflow:hidden}
.stage .wrap{padding:24px 32px 0 120px;background:var(--white)}
.stage.open .wrap{padding-left:56px}
.pane{margin:12px 12px 12px 12px;background:var(--white);border-radius:18px;
  box-shadow:0 0 0 1px rgba(15,42,58,.06),0 2px 4px rgba(15,42,58,.04),0 24px 64px -12px rgba(15,42,58,.18);
  display:flex;flex-direction:column;min-height:0;overflow:hidden;position:relative}
.pn-hd{display:flex;align-items:center;gap:6px;padding:14px 14px 10px 20px}
.pn-hd .who{display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px}
.mark{width:22px;height:22px;border-radius:7px;background:var(--ink);display:grid;place-items:center}
.ib{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;color:var(--muted)}
.ib:hover{background:var(--wash)}
.pn-hd .sp{flex:1}
.pn-body{flex:1;overflow:hidden;padding:8px 24px 0;display:flex;flex-direction:column;gap:28px}
.pn-ft{padding:10px 14px 14px}
.pn-body,.fv-col{-webkit-mask-image:linear-gradient(#000 calc(100% - 36px),transparent);mask-image:linear-gradient(#000 calc(100% - 36px),transparent)}

/* turn: question as heading, answer as reading text */
.turn{display:flex;flex-direction:column;gap:14px}
.ask{font-size:18px;line-height:1.35;letter-spacing:-.012em;font-weight:600;text-wrap:balance;color:var(--ink)}
.ask small{display:block;font-size:12px;font-weight:400;letter-spacing:0;color:var(--muted);margin-top:4px}
.prov{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--teal-text);font-weight:500}
.favs{display:flex}
.favs i{width:20px;height:20px;border-radius:50%;background:var(--white);box-shadow:0 0 0 2px var(--white),inset 0 0 0 1px var(--border);display:grid;place-items:center;font:600 9px/1 var(--font);font-style:normal;color:var(--ink);margin-left:-5px}
.favs i:first-child{margin-left:0}
.prov .cnt{color:var(--muted);font-weight:400}
.read{font-size:16px;line-height:1.65;color:var(--ink);display:flex;flex-direction:column;gap:12px}
.read p{max-width:62ch}
.cite{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:6px;background:var(--tint);color:var(--teal-text);font-size:11px;font-weight:600;vertical-align:2px;margin-left:3px;line-height:1}
.cite.hot{background:var(--teal);color:var(--white)}
.read ol{display:flex;flex-direction:column;gap:8px;counter-reset:s;padding:0}
.read ol li{list-style:none;display:grid;grid-template-columns:26px 1fr;counter-increment:s}
.read ol li::before{content:counter(s);width:20px;height:20px;border-radius:50%;background:var(--wash);font-size:12px;font-weight:600;display:grid;place-items:center;margin-top:3px;color:var(--ink)}
.read h5{font-size:13px;font-weight:600;color:var(--muted);letter-spacing:0;margin-top:4px}
.limits{display:grid;grid-template-columns:20px 1fr;gap:8px;font-size:14px;line-height:1.55;color:var(--muted);padding-top:2px}
.limits b{color:var(--ink);font-weight:600;display:block}
.trow{color:var(--ink);display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:var(--wash);transition:background .2s}
.trow:hover{background:var(--tint)}
.trow .bead{width:12px;height:12px;border-radius:50%;border:2px solid var(--teal);background:var(--white);flex:none}
.trow span{display:flex;flex-direction:column;line-height:1.3;flex:1}
.trow b{font-weight:600;font-size:14px}
.trow small{font-size:12px;color:var(--muted)}
.bar{display:flex;align-items:center;gap:4px;color:var(--muted);font-size:13px}
.bar .sp{flex:1}
.chipbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:9px;color:var(--muted);font-size:13px}
.chipbtn:hover{background:var(--wash)}
.fup{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--ink);padding:10px 0;border-top:1px solid var(--hairline)}
.fup svg{color:var(--teal)}
.kept{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;background:var(--tint);border-radius:999px;padding:5px 6px 5px 12px;font-size:13px;color:var(--teal-text)}
.kept button{background:var(--white);border-radius:999px;padding:2px 10px;font-weight:500;font-size:12px;color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint-border)}
.check{font-size:13px;line-height:1.5;color:#6B4510;display:grid;grid-template-columns:18px 1fr;gap:8px;background:#FFF8EC;border-radius:12px;padding:10px 12px}
.srclist{display:flex;flex-direction:column;gap:2px;border-radius:12px;background:var(--wash);padding:6px}
.srclist a{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;padding:7px 8px;border-radius:8px;font-size:13px;color:var(--ink)}
.srclist a:hover{background:var(--white)}
.srclist a small{color:var(--muted);font-size:12px}
.srclist .n{width:18px;height:18px;border-radius:6px;background:var(--white);display:grid;place-items:center;font-size:11px;font-weight:600;color:var(--teal-text)}
.pop{position:absolute;width:300px;background:var(--white);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:6px;z-index:3;
  box-shadow:0 0 0 1px rgba(15,42,58,.08),0 16px 40px -8px rgba(15,42,58,.22)}
.pop small{color:var(--muted);font-size:12px}
.pop b{font-weight:600;font-size:14px;line-height:1.35}
.pop p{font-size:13px;color:var(--muted);line-height:1.5}
.sentence-in{animation:sin .5s cubic-bezier(.16,1,.3,1) both}
@keyframes sin{from{opacity:.25;filter:blur(2px)}to{opacity:1;filter:none}}
.live{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.live .ring{width:14px;height:14px;border-radius:50%;border:2px solid var(--tint-border);border-top-color:var(--teal);animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* composer */
.cmp{position:relative;border-radius:18px;background:var(--white);box-shadow:0 0 0 1px var(--border),0 1px 2px rgba(15,42,58,.04);padding:12px 12px 10px 16px;display:flex;flex-direction:column;gap:10px}
.cmp.focus{box-shadow:0 0 0 1px var(--teal),0 0 0 4px rgba(14,124,123,.12)}
.cmp.writing{box-shadow:none}
.cmp.writing::before{content:"";position:absolute;inset:-1.5px;border-radius:19.5px;background:linear-gradient(90deg,#3FC79A,#5AAED6,#8B78F0,#5AAED6,#3FC79A);background-size:200% 100%;animation:aurora 3s linear infinite;z-index:-1}
.cmp.writing{isolation:isolate}
.cmp.writing::after{content:"";position:absolute;inset:0;border-radius:18px;background:var(--white);z-index:-1}
.cmp .txt{font-size:15px;color:var(--muted);min-height:24px}
.cmp .txt.val{color:var(--ink)}
.cmp .row3{display:flex;align-items:center;gap:8px}
.ctxchip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 10px;border-radius:8px;background:var(--wash);font-size:12px;font-weight:500;color:var(--ink)}
.ctxchip .xx{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;color:var(--muted)}
.cmp .left{margin-left:auto;font-size:12px;color:var(--muted)}
.send{width:34px;height:34px;border-radius:50%;background:var(--ink);display:grid;place-items:center;flex:none}
.send.off{background:var(--track,#C9D3D7)}
.cmp.dis{background:var(--wash);box-shadow:0 0 0 1px var(--hairline)}
@media (prefers-reduced-motion:reduce){.cmp.writing::before,.sentence-in,.live .ring{animation:none}}

/* ask bar: the only entry, on Home, Roadmap and Task */
.abar{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);width:440px;height:52px;display:flex;align-items:center;gap:12px;padding:0 10px 0 12px;background:var(--white);border-radius:16px;
  box-shadow:0 0 0 1px rgba(15,42,58,.08),0 2px 4px rgba(15,42,58,.04),0 18px 40px -12px rgba(15,42,58,.28);font-size:15px;color:var(--muted);z-index:4}
.abar span.t{flex:1}
.abar .go2{width:32px;height:32px;border-radius:10px;background:var(--ink);display:grid;place-items:center}
.abar:hover{box-shadow:0 0 0 1px rgba(14,124,123,.35),0 2px 4px rgba(15,42,58,.04),0 18px 40px -12px rgba(15,42,58,.28)}
.abar.dot2::after{content:"";position:absolute;top:10px;left:34px;width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 2px var(--white)}
.m .abar{left:12px;right:12px;width:auto;transform:none;bottom:76px;height:48px}
.padb{padding-bottom:110px}
/* opening */
.hello{display:flex;flex-direction:column;gap:8px;padding-top:28px}
.hello h3{font-size:24px;line-height:1.2;letter-spacing:-.02em;font-weight:600}
.hello p{font-size:16px;line-height:1.55;color:var(--muted);max-width:40ch}
.starts{display:flex;flex-direction:column;margin-top:18px}
.starts button{display:flex;align-items:center;gap:12px;text-align:left;padding:12px 4px;border-top:1px solid var(--hairline);font-size:15px}
.starts button:last-child{border-bottom:1px solid var(--hairline)}
.starts button svg{margin-left:auto;color:var(--control)}
.earlier2{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--muted)}
.earlier2 a{font-weight:500}

/* states */
.gnote{display:grid;grid-template-columns:20px 1fr;gap:10px;font-size:14px;line-height:1.55;color:var(--ink)}
.gnote.err svg{color:var(--danger)}
.gnote .act{display:flex;gap:8px;margin-top:8px}
.gnote .act span{height:30px;padding:0 12px;border-radius:9px;background:var(--ink);color:var(--white);display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500}
.gnote .act span.ghost{background:var(--wash);color:var(--ink)}
.cut{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px}
.cut::after{content:"";flex:1;height:1px;background:var(--hairline)}
.help{border-radius:16px;background:var(--ink);color:var(--white);padding:18px;display:flex;flex-direction:column;gap:12px}
.help p{color:#D9E4E8;font-size:14px;line-height:1.55}
.help a{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;background:rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;color:var(--white)}
.help a b{font-size:18px;font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.help a small{color:#A9BDC7;font-size:12px;line-height:1.35}
.help a svg{color:var(--mark)}

/* expanded focus view */
.focusv{display:grid;grid-template-columns:280px minmax(0,1fr);height:836px;background:var(--white)}
.fv-side{padding:20px 16px;display:flex;flex-direction:column;gap:18px;border-right:1px solid var(--hairline);background:var(--wash)}
.fv-side h6{font-size:12px;font-weight:600;color:var(--muted);padding:0 10px}
.fv-side .th{display:flex;flex-direction:column;gap:2px}
.fv-side .th a{display:flex;justify-content:space-between;padding:8px 10px;border-radius:9px;font-size:14px;color:var(--ink)}
.fv-side .th a.on{background:var(--white);box-shadow:0 1px 2px rgba(15,42,58,.06),0 0 0 1px var(--hairline);font-weight:500}
.fv-side .th small{color:var(--muted);font-size:12px}
.fv-main{display:flex;flex-direction:column;min-height:0;position:relative}
.fv-top{display:flex;align-items:center;gap:8px;padding:14px 20px}
.fv-col{width:720px;margin:0 auto;flex:1;overflow:hidden;display:flex;flex-direction:column;gap:32px;padding-top:12px}
.fv-col .ask{font-size:26px;letter-spacing:-.02em}
.fv-col .read{font-size:17px}
.fv-ft{width:720px;margin:0 auto;padding:12px 0 22px}

/* quick ask (/ or Ask) */
.qa-scrim{position:absolute;inset:0;background:rgba(15,42,58,.22);backdrop-filter:blur(2px)}
.qa{position:absolute;left:50%;top:120px;transform:translateX(-50%);width:640px;background:var(--white);border-radius:20px;
  box-shadow:0 0 0 1px rgba(15,42,58,.08),0 32px 80px -16px rgba(15,42,58,.35);padding:8px}
.qa .cmp{box-shadow:none;padding:14px 14px 10px 18px}
.qa .cmp .txt{font-size:18px}
.qa .starts{margin:4px 10px 6px}
.qa .starts button{font-size:14px;padding:11px 4px}
.qa .starts button:first-child{border-top:1px solid var(--hairline)}

/* phone sheet */
.m .sheet2{position:absolute;left:0;right:0;bottom:0;top:36px;background:var(--white);border-radius:22px 22px 0 0;box-shadow:0 -1px 0 rgba(15,42,58,.06),0 -24px 48px -12px rgba(15,42,58,.25);display:flex;flex-direction:column}
.m .sheet2 .grab{margin-top:8px}
.m .pn-body{padding:4px 18px 0}
.m .pn-ft{padding:8px 10px 12px}
.m .hello{padding-top:8px}
.m .hello h3{font-size:22px}
.m .read{font-size:16px}

.states2{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(460px,100%),460px));gap:28px}

.paneonly{width:min(460px,100%);height:640px;margin:0;background:var(--white)}
.paneonly.tall{height:820px}
.hero-fig figcaption{max-width:860px}
figure{min-width:0;max-width:100%}
"""

GLYPH = '<span class="mark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3FC9B7" stroke-width="2.6" stroke-linecap="round"><path d="M3 15c3-3 6-3 9 0s6 3 9 0"/></svg></span>'

def ic2(name, size=16):
    extra = {
        "expand": '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
        "collapse": '<path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>',
        "history": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
        "copy": '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        "turn": '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/>',
        "lock": '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        "msg": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
        "heart": '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    }
    if name in extra:
        return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{extra[name]}</svg>'
    return ic(name, size)

def cite(n, hot=False):
    return f'<span class="cite{" hot" if hot else ""}">{n}</span>'

def prov(kind="guide", n=3):
    label = "LandedNZ's checked guide" if kind == "guide" else "Official sites, checked today"
    return f'<div class="prov">{ic("shield", 15)}{label}<span class="cnt">ird.govt.nz · {n} source{"s" if n != 1 else ""}</span></div>'

def composer(state="idle", text=None, ctx="Apply for your IRD number", left="14 left today"):
    cls = {"idle": "cmp", "focus": "cmp focus", "writing": "cmp writing", "dis": "cmp dis"}[state]
    if state == "writing":
        btn = f'<span class="send" aria-label="Stop">{ic("stop", 14, "#fff")}</span>'
        t = '<span class="txt">Writing the answer…</span>'
    elif state == "dis":
        ctx = None
        btn = f'<span class="send off">{ic("up", 16, "#fff")}</span>'
        t = f'<span class="txt">{text}</span>'
    else:
        btn = f'<span class="send{" off" if not text else ""}">{ic("up", 16, "#fff")}</span>'
        t = f'<span class="txt val">{text}</span>' if text else f'<span class="txt">Ask anything about settling in</span>'
    chip = f'<span class="ctxchip">{ic("route", 13)}{ctx}<span class="xx">{ic("x", 12)}</span></span>' if ctx else ""
    lft = f'<span class="left">{left}</span>' if left else '<span class="left"></span>'
    return f'<div class="{cls}">{t}<div class="row3">{chip}{lft}{btn}</div></div>'

def pane_head(expand=True):
    ex = f'<button class="ib" aria-label="Expand">{ic2("expand")}</button>' if expand else f'<button class="ib" aria-label="Back to the side">{ic2("collapse")}</button>'
    return f'<div class="pn-hd"><span class="who">{GLYPH}Guide</span><span class="sp"></span><button class="ib" aria-label="History">{ic2("history")}</button>{ex}<button class="ib" aria-label="Close">{ic("x")}</button></div>'

def answer(full=True, pop=False, kept=True, check=False, sources_open=False, follow=True, link=True):
    c1 = cite(1, hot=pop)
    popc = '<div class="pop" style="right:4px;top:150px"><small>ird.govt.nz · checked 25 Oct 2026</small><b>Tax code declaration (IR330)</b><p>Inland Revenue\'s form for telling your employer your tax code.</p><a class="small" style="font-weight:500">Open on ird.govt.nz ' + ic("ext", 12) + '</a></div>' if pop else ""
    body = [f'<p>Yes, you can start work before it arrives. Until your employer has your IRD number and a tax code declaration, they deduct tax at 45% plus the earners\' levy.{c1}</p>']
    if full:
        body.append(f'<h5>What to do</h5><ol><li><span>Register for myIR. You don\'t need an IRD number for this.{cite(3)}</span></li><li><span>In myIR, apply as a new arrival.{cite(2)}</span></li><li><span>When your number comes, give it to your employer with a completed IR330.{cite(1)}</span></li></ol>')
    parts = [prov(), f'<div class="read">{"".join(body)}</div>']
    if full:
        parts.append(f'<div class="limits">{ic("info", 16)}<span><b>What I can\'t tell you</b>How long your own application will take beyond the usual 2 days. Inland Revenue can, on 0800 227 774.</span></div>')
        if check:
            parts.append(f'<div class="check">{ic("alert", 15)}<span>Double-check "the usual 2 days". I couldn\'t match it to a source; Inland Revenue\'s new arrival page has the current timing.</span></div>')
        if link:
            parts.append(f'<a class="trow"><i class="bead"></i><span><b>Apply for your IRD number</b><small>Your task · Arrival · 20–30 minutes</small></span>{ic("arrow", 16)}</a>')
        if sources_open:
            parts.append('<div class="srclist"><a><span class="n">1</span><span>Tax code declaration (IR330)</span><small>ird.govt.nz</small></a><a><span class="n">2</span><span>New arrival: IRD number application</span><small>ird.govt.nz</small></a><a><span class="n">3</span><span>Register for a myIR account</span><small>ird.govt.nz</small></a></div>')
        if kept:
            parts.append(f'<span class="kept">{ic("check", 13)}Remembered: you start work on 9 November<button>Undo</button></span>')
        parts.append(f'<div class="bar"><span class="chipbtn">{ic2("copy", 14)} Copy</span><span class="chipbtn">{"Hide sources" if sources_open else "3 sources"}</span><span class="sp"></span></div>')
        if follow:
            parts.append(f'<a class="fup">{ic2("turn", 16)}What goes on the tax code declaration?</a>')
    return '<div class="turn" style="position:relative">' + f'<div class="ask">Can I start work before my IRD number arrives?</div>' + "".join(parts) + popc + "</div>"

def streaming():
    return f'''<div class="turn"><div class="ask">Which tasks can I do before I have an address?</div>{prov(n=2)}<div class="read"><p>Most Arrival tasks don't need an address yet. You can get a SIM card and register for myIR straight away.{cite(2)} <span class="sentence-in">A bank account is the one that usually asks for proof of address</span></p></div><div class="live"><span class="ring"></span>Checking ird.govt.nz</div></div>'''

def earlier_turn():
    return f'''<div class="earlier2"><a>Show all 14 messages</a></div><div class="turn"><div class="ask">Do I need a bank account first?<small>Asked on this task · 29 Oct</small></div>{prov(n=1)}<div class="read"><p>Only on a work or student visa. Then you need a New Zealand bank account or a customer due diligence form (IR997).{cite(4)}</p></div></div>'''

def hello(ctx="home"):
    if ctx == "home":
        h, p, st = "Day 1 in Auckland.", "Next up is choosing where to live. Three Arrival tasks are due this week.", ["Do I need an IRD number before I start work?", "What do I need to open a bank account?", "Where can I get a SIM card on my first day?"]
    else:
        h, p, st = "Arrival, 0 of 4 done.", "Your IRD number comes after your bank account.", ["Can I start work before my IRD number arrives?", "Do I need a bank account before I apply?", "What happens after my arrival date passes?"]
    b = "".join(f"<button>{s}{ic('arrow', 15)}</button>" for s in st)
    return f'<div class="hello"><h3>{h}</h3><p>{p}</p><div class="starts">{b}</div></div>'

def askbar(text, last=False, mobile=False):
    k = "" if mobile else "<kbd>/</kbd>"
    return f'<div class="abar{" dot2" if last else ""}" role="button" aria-label="Open the guide">{GLYPH}<span class="t">{text}</span>{k}<span class="go2">{ic("up", 15, "#fff")}</span></div>'

def pane(body, foot, expand=True, style=""):
    return f'<div class="pane" style="{style}">{pane_head(expand)}<div class="pn-body">{body}</div><div class="pn-ft">{foot}</div></div>'

def stage(active, main, pane_html):
    return f'<div class="frame d">{header(active, "none")}<div class="stage open"><div class="wrap">{main}</div>{pane_html}</div></div>'

STATES = [
    ("Streaming", "Sentences settle in from a soft blur; the composer's edge runs the aurora while writing; Send becomes Stop.", lambda: streaming(), "writing"),
    ("Source preview", "Hover or tap a citation for its page, domain and checked date.", lambda: answer(full=True, pop=True, kept=False, follow=False, link=False), "idle"),
    ("Sources open, with a check note", "3 sources expands the list in place. A check note is added under the answer, never instead of it.", lambda: answer(full=True, kept=False, check=True, sources_open=True, follow=False, link=False), "idle"),
    ("Interrupted", "What arrived stays.", lambda: f'<div class="turn"><div class="ask">Can I start work before my IRD number arrives?</div>{prov()}<div class="read"><p>Yes, you can start work before it arrives. Until your employer has your IRD number and a tax code declaration, they deduct tax at 45% plus the earners\' levy.{cite(1)}</p></div><div class="gnote">{ic("info", 16)}<span>The answer stopped partway.<div class="act"><span>{ic("retry", 13)} Retry</span></div></span></div></div>', "idle"),
    ("Failed", "Nothing arrived, so the question isn't counted.", lambda: f'<div class="turn"><div class="ask">Can I start work before my IRD number arrives?</div><div class="gnote err">{ic("alert", 16)}<span>Something went wrong before the answer started. This question wasn\'t counted.<div class="act"><span>{ic("retry", 13)} Retry</span></div></span></div></div>', "idle"),
    ("Busy in another window", "", lambda: f'<div class="turn"><div class="ask">What\'s an IR330?</div><div class="gnote">{ic("clock", 16)}<span>An answer is still coming in another window. You can ask here once it\'s done.</span></div></div>', "dis:Waiting for the other window"),
    ("Daily limit reached", "Earlier answers stay readable above.", lambda: answer(full=False) + f'<div class="gnote">{ic("clock", 16)}<span>That\'s the 20 questions for today. You can ask again after midnight.</span></div>', "dis:You can ask again after midnight"),
    ("Nothing found", "", lambda: f'<div class="turn"><div class="ask">Can I claim my moving costs back?</div><div class="gnote">{ic2("search", 16)}<span>I couldn\'t find this in checked sources. Inland Revenue is the right place to ask.<div class="act"><span class="ghost">ird.govt.nz {ic("ext", 12)}</span></div></span></div></div>', "idle"),
    ("Official sites unavailable", "", lambda: f'<div class="turn"><div class="ask">Is myIR down today?</div><div class="cut">Official sites didn\'t respond. Answering from the checked guide only.</div>{prov(n=1)}<div class="read"><p>The guide has no outage information. Inland Revenue posts service updates on its website.{cite(1)}</p></div></div>', "idle"),
    ("Cut short", "The answer ends at the last full sentence and offers the rest.", lambda: f'<div class="turn"><div class="ask">What should I sort out in my first week?</div>{prov(n=2)}<div class="read"><p>Start with a SIM card, then your bank account and IRD number, in that order.{cite(1)}</p></div><div class="cut">This answer was cut short.</div><a class="fup">{ic2("turn", 16)}Want the rest?</a></div>', "idle"),
    ("Stopped before any text", "The question is given back to the composer and isn\'t counted.", lambda: f'<div class="turn"><div class="ask" style="color:var(--muted)">Can I start work before my IRD number arrives?</div><div class="gnote">{ic("info", 16)}<span>Stopped. This question wasn\'t counted.</span></div></div>', "text:Can I start work before my IRD number arrives?"),
    ("Stopped after some text", "What arrived stays; the question counts.", lambda: f'<div class="turn"><div class="ask">Can I start work before my IRD number arrives?</div>{prov()}<div class="read"><p>Yes, you can start work before it arrives.{cite(1)}</p></div><div class="cut">You stopped this answer.</div></div>', "idle"),
    ("Can\'t help with that one", "An honest no, and who can help.", lambda: f'<div class="turn"><div class="ask">Can you fill in my visa application for me?</div><div class="gnote">{ic("info", 16)}<span>I can\'t help with that one. Immigration New Zealand can, through its website.<div class="act"><span class="ghost">immigration.govt.nz {ic("ext", 12)}</span></div></span></div></div>', "idle"),
    ("Distress, with crisis text", "Crisis text comes first and is never animated away.", lambda: f'<div class="turn"><div class="ask">I\'m not coping, everything here is too much</div><div class="help"><p>If you\'re struggling, you don\'t have to carry it alone.</p><a>{ic("phone", 18)}<span><b>1737</b><br><small>Free call or text, any time. Need to Talk?</small></span>{ic("arrow", 15)}</a><a>{ic("phone", 18)}<span><b>0800 543 354</b><br><small>Lifeline</small></span>{ic("arrow", 15)}</a><a>{ic("alert", 18)}<span><b>111</b><br><small>In an emergency</small></span>{ic("arrow", 15)}</a></div><div class="read"><p>That sounds like a lot at once. Arriving somewhere new is hard, and it\'s okay to take the next step slowly.</p></div></div>', "idle"),
]

def states_grid():
    out = []
    for name, cap, f, cs in STATES:
        if cs.startswith("text:"):
            foot = composer("idle", text=cs[5:])
        elif cs.startswith("dis:"):
            foot = composer("dis", text=cs[4:], left="0 left today" if "midnight" in cs else "14 left today")
        else:
            foot = composer(cs)
        tall = " tall" if name.startswith("Source") or name.startswith("Distress") else ""
        out.append(f'<figure><div class="pane paneonly{tall}">{pane_head()}<div class="pn-body">{f()}</div><div class="pn-ft">{foot}</div></div><figcaption><b>{name}</b>{". " + cap if cap else ""}</figcaption></figure>')
    return '<div class="states2">' + "".join(out) + "</div>"

def build():
    hero = stage("Roadmap", task_main(side=True), pane(earlier_turn() + answer(), composer()))
    home = stage("Home", home_main(narrow=True), pane(hello("home"), composer("focus", ctx="Choose where to live")))
    road = stage("Roadmap", roadmap_main(), pane(streaming(), composer("writing", ctx="Roadmap")))
    quick = f'<div class="frame d">{header("Home", "none")}<div class="wrap">{home_main()}</div><div class="qa-scrim"></div><div class="qa">{composer("focus", text="Do I need a car to get around Auckland", ctx="Home", left="")}<div class="starts"><button>Do I need an IRD number before I start work?{ic("arrow", 15)}</button><button>What do I need to open a bank account?{ic("arrow", 15)}</button></div></div></div>'
    side = f'''<div class="fv-side"><span class="btn sm" style="align-self:flex-start">{ic("left", 14)} Back to your task</span><div><h6>This conversation, by task</h6><div style="height:6px"></div><div class="th"><a class="on">Apply for your IRD number <small>3</small></a><a>Open a bank account <small>2</small></a><a>Choose where to live <small>4</small></a><a>Everything <small>14</small></a></div></div><p class="small muted" style="margin-top:auto;padding:0 10px">One conversation, on every device.</p></div>'''
    focus = f'''<div class="frame d">{header("Roadmap", "none")}<div class="focusv">{side}<div class="fv-main"><div class="fv-top"><span class="who" style="display:flex;gap:8px;align-items:center;font-weight:600">{GLYPH}Guide</span><span style="flex:1"></span><button class="ib">{ic2("collapse")}</button><button class="ib">{ic("x")}</button></div><div class="fv-col">{earlier_turn()}{answer(kept=False, sources_open=True)}</div><div class="fv-ft">{composer()}</div></div></div></div>'''
    closed = f'<div class="frame d">{header("Roadmap", "none")}<div class="wrap">{task_main()}</div>{askbar("Ask about your IRD number")}</div>'
    e_home = f'<div class="frame d">{header("Home", "none")}<div class="wrap">{home_main()}</div>{askbar("Ask about your first 90 days")}</div>'
    e_road = f'<div class="frame d">{header("Roadmap", "none")}<div class="wrap">{roadmap_main()}</div>{askbar("Ask about your roadmap", last=True)}</div>'
    e_set = f'<div class="frame d">{header("Settings", "none")}' + settings_memory(entry="none").split(header("Settings", "none"), 1)[1]
    m_ehome = f'<div class="frame m">{header("Home", "none", True)}<div class="wrap">{home_main(narrow=True)}</div>{askbar("Ask about your first 90 days", mobile=True)}{tabs("Home")}</div>'
    m_etask = f'<div class="frame m">{header("Roadmap", "none", True)}<div class="wrap">{task_main(side=False)}</div><div style="position:absolute;left:0;right:0;bottom:64px;display:flex;gap:8px;padding:12px 16px;background:var(--white);border-top:1px solid var(--hairline)"><span class="btn pri" style="flex:1">Mark as done</span><span class="btn">{GLYPH} Ask</span></div>{tabs("Roadmap")}</div>'
    entry = (e_home, e_road, closed, e_set, m_ehome, m_etask)
    m_home = f'<div class="frame m">{header("Home", "none", True)}<div class="wrap">{home_main(narrow=True)}</div><div class="dim" style="background:rgba(15,42,58,.32)"></div><div class="sheet2"><div class="grab"></div>{pane_head()}<div class="pn-body">{hello("home")}</div><div class="pn-ft">{composer(ctx="Home", left="")}</div></div></div>'
    m_task = f'<div class="frame m"><div class="sheet2" style="top:0;border-radius:0">{pane_head()}<div class="pn-body">{answer(follow=True, kept=True)}</div><div class="pn-ft">{composer(left="")}</div></div></div>'
    m_stream = f'<div class="frame m"><div class="sheet2" style="top:0;border-radius:0">{pane_head()}<div class="pn-body">{streaming()}</div><div class="pn-ft">{composer("writing", ctx="Roadmap", left="")}</div></div></div>'
    mem_in = f'<figure><div class="pane paneonly">{pane_head()}<div class="pn-body"><div class="turn"><div class="ask">My partner arrives in December. Anything they should do first?</div><div class="read"><p>Noted. When you ask about December, I\'ll take it into account. For their own first steps, ask me about their visa once they\'ve arrived.</p></div><span class="kept">{ic("check", 13)}Remembered: your partner arrives in December<button>Undo</button></span></div></div><div class="pn-ft">{composer()}</div></div><figcaption><b>In the chat</b>: one quiet pill with Undo, tinted until you act or carry on.</figcaption></figure>'
    return hero, home, road, quick, focus, entry, m_home, m_task, m_stream, mem_in

def render():
    hero, home, road, quick, focus, entry, m_home, m_task, m_stream, mem_in = build()
    e_home, e_road, closed, e_set, m_ehome, m_etask = entry
    fig = lambda f, c, cls="": f'<figure class="{cls}"><div class="scrollx">{f}</div><figcaption>{c}</figcaption></figure>'
    body = f'''<header class="intro"><div><h1>Guide · assistant pane</h1><p class="lede">The guide lives beside your work. On Home, Roadmap and Task a small ask bar floats at the bottom of the page. Click it or press / and it grows into a quiet pane on the right, already holding what you're looking at. Answers read like a short checked note, with every source one tap away. One click widens it into a focused reading view.</p>
<p class="lede" style="font-size:14px">Frames at 85%; the pane and state cards below are at 100%.</p></div>
<dl class="facts"><div><dt>What makes it premium</dt><dd>Question set as the heading, answer as 16 px reading text. Inline numbered citations with previews. A crafted composer with the context chip, the day's count and a Send that becomes Stop. The pane floats inset with real depth instead of a hairline split.</dd></div><div><dt>Signature</dt><dd>While an answer is being written, the composer's edge runs the aurora; sentences settle in from a soft blur. Off with reduced motion.</dd></div><div><dt>Shared chrome</dt><dd>The header Ask button is removed (your call, 30 Oct). Settings has no way to ask.</dd></div><div><dt>One new layout</dt><dd>While the pane is open, Task's actions column flexes between 300 and 380 px (approved 30 Oct; see Width rules).</dd></div></dl></header>
<section class="board"><h2>Where you can ask</h2><p class="note">Only on Home, Roadmap and Task, where there is a roadmap to ask about. No Ask in the header and none in Settings. A small bar floats at the bottom of the page and already says what you'd be asking about. Click it or press / and it grows into the pane; close the pane and it settles back into the bar. Pages keep extra space at the bottom so the bar never sits on top of the last item.</p><div class="row">{fig(e_home, "<b>Home</b>: Ask about your first 90 days.")}{fig(e_road, "<b>Roadmap</b>: the teal dot means an answer arrived while the pane was closed.")}{fig(closed, "<b>Task</b>: Ask about your IRD number. The old Ask box is gone from the actions column.")}{fig(e_set, "<b>Settings</b>: no bar. Memory is managed here; asking happens on the other three pages.")}{fig(m_ehome, "<b>Phone, Home and Roadmap</b>: the bar sits above the tabs.")}{fig(m_etask, "<b>Phone, Task</b>: the approved bottom bar keeps Mark as done beside Ask.")}</div></section>
<section class="board"><h2>The pane on a task</h2><p class="note">This task's earlier questions first, then the answer. The page moves left; nothing is covered.</p><div class="row">{fig(hero, "<b>Task, 1440.</b> Ask has left the actions column; that column stays put while the main card scrolls on its own.", "hero-fig")}</div></section>
<section class="board"><h2>Opening</h2><p class="note">Opened from the ask bar, / or Ask about this, the pane greets with where you are and three starters, with the cursor already in the composer. / works only when you are not typing in a field.</p><div class="row">{fig(home, "<b>Home, 1440</b>: opened from Ask about this on Choose where to live.")}</div></section>
<section class="board"><h2>Writing, and the focused view</h2><p class="note">Expand turns the pane into a full-width reading view with the conversation grouped by task; collapse returns to the side.</p><div class="row">{fig(road, "<b>Roadmap, 1440</b>, an answer being written.")}{fig(focus, "<b>Focused view, 1440</b>: 720 px reading column at 17 px.")}</div></section>
<section class="board"><h2>Phone, 390</h2><p class="note">The same pane as a sheet: half height for the greeting, full height once you ask.</p><div class="row">{fig(m_home, "<b>Opened on Home</b>.")}{fig(m_task, "<b>An answer</b>, full height.")}{fig(m_stream, "<b>Being written</b>.")}</div></section>
<section class="board"><h2>States, at real size</h2><p class="note">Shown text is never taken back; anything found later is added under the answer.</p>{states_grid()}</section>
<section class="board"><h2>Memory</h2><p class="note">Nothing is remembered invisibly.</p><div class="row">{mem_in}{fig(settings_memory(entry="none"), "<b>Settings → Memory, 1440</b>: edit in place, delete is immediate and permanent.")}{fig(settings_memory(True, entry="none"), "<b>Settings → Memory, 390</b>.")}</div></section>'''
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guide assistant pane</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body><main class="page">{body}</main></body></html>'''

# ---------- width rules ----------
WCSS = """
.wr{display:flex;flex-direction:column;gap:36px}
.wr-row{display:flex;flex-direction:column;gap:12px}
.wr-row h3{font-size:17px;font-weight:600;letter-spacing:-.01em}
.wr-frames{display:flex;flex-direction:column;gap:20px}
.wf{background:var(--white);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative;box-shadow:var(--lift);height:800px}
.wf .stage{height:736px}
.wf .wrap{padding:24px 32px 0 56px!important}
.wf .pane{margin:12px}
.meas{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted)}
.meas b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.rules{width:100%;border-collapse:collapse;font-size:14px;background:var(--white);border-radius:12px;overflow:hidden;box-shadow:0 0 0 1px var(--hairline)}
.rules th,.rules td{text-align:left;padding:10px 14px;border-top:1px solid var(--hairline);font-variant-numeric:tabular-nums}
.rules th{background:var(--wash);font-weight:600;border-top:0;font-size:13px}
.ovl{position:absolute;right:12px;top:76px;bottom:12px;width:400px}
.ovl .pane{margin:0;height:100%}
"""

def act_col(content):
    return round(min(380, max(300, content * 0.34)))

def settings_inner(stacked):
    mems = [("You start work on 9 November.", "From the guide, 30 Oct"), ("Your partner arrives in December.", "From the guide, 29 Oct"), ("You'd rather bank with a branch near Newmarket.", "From the guide, 29 Oct")]
    rows = "".join(f'<div class="mem"><div>{t}<small>{s_}</small></div><span class="acts"><button>Edit</button><button class="del">Delete</button></span></div>' for t, s_ in mems)
    ink = '<div class="ink" style="height:auto;padding:24px 28px"><span class="title">Settings</span><div style="height:12px"></div><div class="row2"><span><small>Visa</small>Accredited Employer Work Visa (AEWV)</span><span class="chg">Change</span></div><div class="row2"><span><small>City</small>Auckland</span><span class="chg">Change</span></div><div class="row2 on"><span><small>Memory · open</small>3 things the guide remembers</span><span class="chg">Manage</span></div></div>'
    mem = f'<div class="card memlist" style="padding:28px 32px"><span class="section" style="font-size:20px">What the guide remembers</span><p class="muted" style="margin-bottom:6px">Only things you told it. Delete one and it\'s gone for good.</p>{rows}</div>'
    cols = "grid-template-columns:1fr" if stacked else "grid-template-columns:440px minmax(0,1fr)"
    return f'<div style="display:grid;{cols};gap:16px;align-items:start">{ink}{mem}</div>'

def wframe(width, pane_w, host_kind):
    content = width - (pane_w + 24) - 88
    if host_kind == "task":
        if content >= 720:
            act = act_col(content)
            host = task_main(side=True).replace('<div class="taskg" style="">', f'<div class="taskg" style="grid-template-columns:minmax(0,1fr) {act}px">')
            main = content - act - 16
            meas = f'<span>Page area <b>{content}</b></span><span>Actions <b>{act}</b> (34%, 300–380)</span><span>Main card <b>{main}</b></span><span>Steps ≈ <b>{round((main - 80) / 7.6)}</b> characters a line</span>'
        else:
            host = task_main(side=False) + f'<div style="position:sticky;bottom:0;margin:0 -32px 0 -56px;padding:12px 32px 12px 56px;background:var(--white);border-top:1px solid var(--hairline);display:flex;gap:8px"><span class="btn pri" style="flex:1">Mark as done</span><span class="btn">Open the IRD application {ic("ext")}</span></div>'
            meas = f'<span>Page area <b>{content}</b></span><span>One column, the approved narrow task layout; actions bar sticks to the page area</span><span>Steps ≈ <b>{round((content - 80) / 7.6)}</b> characters a line</span>'
        ph, active = earlier_turn() + answer(kept=False), "Roadmap"
    elif host_kind == "home":
        stacked = content < 900
        host = home_main(narrow=stacked)
        meas = f'<span>Page area <b>{content}</b></span><span>{"Stacked, the approved narrow layout" if stacked else "Two columns"}</span>'
        ph, active = hello("home"), "Home"
    elif host_kind == "settings":
        stacked = content < 900
        host = settings_inner(stacked)
        meas = f'<span>Page area <b>{content}</b></span><span>{"Stacked, the approved narrow layout" if stacked else "Two columns, memory list " + str(content - 456)}</span>'
        ph, active = hello("home"), "Settings"
    else:
        host = roadmap_main()
        meas = f'<span>Page area <b>{content}</b></span><span>Single column, the route rescales</span>'
        ph, active = streaming(), "Roadmap"
    pane_html = pane(ph, composer("writing" if host_kind == "road" else "idle", ctx=None if host_kind in ("home", "settings") else "Apply for your IRD number"))
    z = round(1180 / width, 3)
    f = f'<div class="wf" style="width:{width}px;zoom:{z}">{header(active, "none")}<div class="stage open" style="grid-template-columns:minmax(0,1fr) {pane_w + 24}px"><div class="wrap">{host}</div>{pane_html}</div></div>'
    return f'<figure><div class="scrollx">{f}</div><figcaption class="meas"><span><b>{width}</b> window · pane <b>{pane_w}</b></span>{meas}</figcaption></figure>'

BANDS = ((1024, 400), (1280, 400), (1440, 460), (1680, 520))

def width_section():
    table = """<table class="rules"><thead><tr><th>Window</th><th>Guide</th><th>Page area</th><th>Task</th><th>Home</th></tr></thead><tbody>
<tr><td>≥ 1680</td><td>Pane 32.5 rem (520)</td><td>≥ 1048</td><td>Two columns, actions 34% (300–380)</td><td>Two columns</td></tr>
<tr><td>1440–1679</td><td>Pane 28.75 rem (460)</td><td>868–1107</td><td>Two columns, actions 34%</td><td>Stacked below 900</td></tr>
<tr><td>1024–1439</td><td>Pane 25 rem (400)</td><td>512–927</td><td>Two columns from 720; one column below</td><td>Stacked</td></tr>
<tr><td>&lt; 1024</td><td>Sheet</td><td>unchanged</td><td colspan="2">Phone and tablet layouts as approved</td></tr></tbody></table>"""
    rules = """<ol style="display:flex;flex-direction:column;gap:6px;padding-left:20px;max-width:80ch">
<li><b>The pane always pushes; it never covers the page.</b> From 1024 up the page moves aside. There is no band where it floats over Mark as done.</li>
<li><b>Pages lay out by their own width.</b> The page area is a size container, so Task and Home switch to their approved narrow layouts instead of being squeezed. With the pane closed nothing changes.</li>
<li><b>One new layout, approved 30 Oct:</b> while the pane is open, Task's actions column flexes between 300 and 380 (34% of the page area). It only ever gets wider as the window grows.</li>
<li><b>Sizes in rem, a reading floor.</b> Pane widths are in rem so a larger default text size scales with them. Task steps stay at about 45 characters a line or more.</li>
<li><b>Nothing cut off, tested where it breaks.</b> Playwright with the pane open on Task, Home and Roadmap at 1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680 and 1920, plus 1366×768, a 20 px default font and 125% / 200% zoom: no sideways scroll, no clipped text, Mark as done never under the pane or the ask bar.</li></ol>"""
    rows = []
    for host, label, bands in (("task", "Task", BANDS), ("home", "Home", ((1024, 400), (1440, 460))), ("road", "Roadmap", ((1024, 400), (1440, 460)))):
        frames = "".join(wframe(w, pw, host) for w, pw in bands)
        rows.append(f'<div class="wr-row"><h3>{label} with the pane open</h3><div class="wr-frames">{frames}</div></div>')
    return f'<section class="board" id="width-rules"><h2>Width rules</h2><p class="note">How much room the pane takes, and what each page does with the rest. Frames are scaled to fit; proportions are real. Revised after impeccable critique.</p><div class="scrollx">{table}</div>{rules}<div class="wr">{"".join(rows)}</div></section>'

_render = render
def render():
    html = _render()
    return html.replace("</style>", WCSS + "</style>").replace("</main>", width_section() + "</main>")

if __name__ == "__main__":
    out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    (out / "direction-d.html").write_text(render())
    print("written direction-d.html")

