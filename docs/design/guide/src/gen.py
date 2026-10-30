"""Generate the three guide direction boards (A room, B sheet, C panel) from r1-final tokens."""
import sys, pathlib


CSS = r"""
:root{
  --ink:#0F2A3A;--muted:#4B6170;--control:#7A8F99;--border:#D5DFE2;--hairline:#E3E8EA;
  --wash:#F6F8F8;--teal:#0E7C7B;--teal-text:#0A6463;--avatar:#E8F2F1;--tint:#F3F9F8;
  --tint-border:#CFE5E3;--mark:#3FC9B7;--white:#FFFFFF;--danger:#A3292B;
  --r-control:8px;--r-surface:12px;
  --lift:0 1px 2px rgba(15,42,58,.04),0 16px 48px rgba(15,42,58,.08);
  --font:"Geist",system-ui,-apple-system,sans-serif;
  /* layout idea: a board of real app frames (1440 and 390) with the guide placed in each */
  color-scheme:light;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--wash);color:var(--ink);font:15px/1.5 var(--font);-webkit-font-smoothing:antialiased}
::selection{background:var(--tint-border);color:var(--ink)}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
a{color:var(--teal-text);text-decoration:none}
sup{font-size:11px;color:var(--teal-text);font-weight:500;margin-left:2px}
svg{flex:none}
.page{max-width:1240px;margin:0 auto;padding:48px 24px 96px;display:flex;flex-direction:column;gap:56px}
.intro{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:40px;align-items:start}
.intro h1{font-size:32px;line-height:1.15;letter-spacing:-.02em;font-weight:600;text-wrap:balance}
.intro .lede{color:var(--muted);margin-top:12px;max-width:62ch;font-size:16px}
.facts{background:var(--white);border:1px solid var(--hairline);border-radius:var(--r-surface);padding:20px 22px;display:flex;flex-direction:column;gap:14px;font-size:13px;line-height:1.45}
.facts dt{font-weight:600;color:var(--ink)}
.facts dd{color:var(--muted)}
.rec{display:inline-flex;align-items:center;gap:6px;background:var(--tint);border:1px solid var(--tint-border);color:var(--teal-text);border-radius:999px;padding:3px 10px;font-size:13px;font-weight:500;margin-top:16px}
.switch{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
.switch a{border:1px solid var(--border);border-radius:var(--r-control);padding:6px 12px;font-size:13px;color:var(--ink);background:var(--white)}
.switch a[aria-current]{background:var(--ink);color:var(--white);border-color:var(--ink)}
section.board{display:flex;flex-direction:column;gap:18px}
section.board>h2{font-size:22px;letter-spacing:-.015em;font-weight:600}
section.board>p.note{color:var(--muted);max-width:75ch}
.row{display:flex;gap:28px;flex-wrap:wrap;align-items:flex-start}
figure{display:flex;flex-direction:column;gap:10px}
figcaption{font-size:13px;color:var(--muted);max-width:640px}
figcaption b{color:var(--ink);font-weight:600}
.flag{display:inline-block;background:#FFF4E5;border:1px solid #F0D2A8;color:#7A4A0E;border-radius:6px;padding:1px 7px;font-size:12px;font-weight:500;margin-right:6px}

/* frames */
.frame{background:var(--white);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative;box-shadow:var(--lift)}
.d{width:1440px;height:900px;zoom:.62}
.m{width:390px;height:844px;zoom:.8}
.scrollx{overflow-x:auto;max-width:100%}
.hdr{height:64px;border-bottom:1px solid var(--hairline);display:flex;align-items:center;padding:0 120px;gap:32px;background:var(--white)}
.logo{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.01em}
.logo i{width:24px;height:24px;border-radius:6px;background:var(--ink);display:grid;place-items:center}
.nav{display:flex;gap:4px}
.nav span{padding:8px 16px;border-radius:8px;color:var(--muted)}
.nav span.on{background:var(--wash);color:var(--ink);font-weight:500}
.hdr .end{margin-left:auto;display:flex;gap:16px;align-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:var(--r-control);border:1px solid var(--border);background:var(--white);font-weight:500;white-space:nowrap}
.btn.pri{background:var(--ink);border-color:var(--ink);color:var(--white)}
.btn.sm{height:32px;padding:0 12px;font-size:13px}
.btn.on{border-color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal);color:var(--teal-text)}
kbd{font:12px var(--font);border:1px solid var(--border);border-radius:4px;padding:0 5px;color:var(--muted)}
.av{width:32px;height:32px;border-radius:50%;background:var(--avatar);display:grid;place-items:center;font-size:13px;font-weight:600;color:var(--teal-text)}
.card{background:var(--white);border:1px solid var(--hairline);border-radius:var(--r-surface);box-shadow:var(--lift)}
.small{font-size:13px;line-height:1.45}
.muted{color:var(--muted)}
.tealt{color:var(--teal-text)}
.title{font-size:24px;line-height:1.25;letter-spacing:-.015em;font-weight:600}
.section{font-size:18px;line-height:1.35;letter-spacing:-.01em;font-weight:600}
.dim{position:absolute;inset:0;background:rgba(15,42,58,.28)}
.ftr{border-top:1px solid var(--hairline);padding:18px 120px;display:flex;font-size:13px;color:var(--muted)}
.ftr span:last-child{margin-left:auto;color:var(--teal-text)}

/* host pages */
.wrap{padding:24px 120px 0}
.home-top{display:flex;align-items:baseline;justify-content:space-between;margin:16px 0 18px}
.route{padding:20px;display:flex;flex-direction:column;gap:12px}
.route svg{width:100%;height:90px}
.stages{display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}
.stages b{color:var(--teal-text);font-weight:600}
.grid2{display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:16px;margin-top:16px}
.next{padding:24px;display:flex;flex-direction:column;gap:10px}
.week{padding:22px 0 8px}
.week .section{padding:0 20px 12px}
.week li{list-style:none;border-top:1px solid var(--hairline);padding:12px 20px;display:flex;align-items:center;gap:12px}
.week li i{width:18px;height:18px;border:1.5px solid var(--control);border-radius:50%}
.week li em{margin-left:auto;font-style:normal;font-size:13px;color:var(--muted)}
.crumb{display:flex;align-items:center;gap:12px;margin:0 0 14px}
.taskg{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;align-items:start}
.taskmain{padding:40px;display:flex;flex-direction:column;gap:12px;height:760px;overflow:hidden}
.steps{display:flex;flex-direction:column;gap:12px;margin-top:4px}
.steps li{list-style:none;display:grid;grid-template-columns:28px 1fr;gap:4px}
.steps li b{color:var(--teal-text);font-weight:600}
.side{display:flex;flex-direction:column;gap:16px;position:sticky;top:0}
.side .card{padding:20px;display:flex;flex-direction:column;gap:12px}
.srcrow{display:grid;grid-template-columns:20px 1fr;gap:4px;padding:10px 0;border-top:1px solid var(--hairline);font-size:13px}
.srcrow:first-of-type{border-top:0}
.srcrow span:last-child{display:flex;flex-direction:column}
.srcrow small{color:var(--muted);font-size:12px}
.rmap{padding:22px;display:flex;flex-direction:column;gap:0}
.rmap li{list-style:none;display:grid;grid-template-columns:32px 1fr auto;gap:8px;padding:12px 0;border-top:1px solid var(--hairline);align-items:center}
.rmap li i{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--control);justify-self:center}

/* guide parts */
.g-body{display:flex;flex-direction:column;gap:20px}
.q{align-self:flex-end;max-width:85%;background:var(--wash);border-radius:12px 12px 4px 12px;padding:10px 14px}
.q small{display:block;font-size:12px;color:var(--muted);margin-top:4px;text-align:right}
.ans{display:flex;flex-direction:column;gap:12px}
.origin{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--teal-text)}
.origin small{color:var(--muted);font-weight:400}
.ans h4{font-size:13px;font-weight:600;letter-spacing:0;margin-top:2px}
.ans ol.st{display:flex;flex-direction:column;gap:6px;padding-left:0}
.ans ol.st li{list-style:none;display:grid;grid-template-columns:20px 1fr;gap:2px}
.ans ol.st li b{color:var(--teal-text);font-weight:600}
.cant{border:1px solid var(--hairline);border-radius:var(--r-control);padding:10px 12px;display:flex;flex-direction:column;gap:2px;font-size:14px}
.tlink{display:flex;align-items:center;gap:12px;border:1px solid var(--tint-border);background:var(--tint);border-radius:var(--r-control);padding:10px 12px}
.tlink .bead{width:12px;height:12px;border-radius:50%;border:2px solid var(--teal);background:var(--white)}
.tlink span{display:flex;flex-direction:column;line-height:1.3}
.tlink b{font-weight:600;color:var(--ink)}
.tlink small{font-size:12px;color:var(--muted)}
.tlink svg{margin-left:auto}
.srcs{display:flex;flex-direction:column;border-top:1px solid var(--hairline);padding-top:8px}
.srcs a{display:grid;grid-template-columns:18px 1fr;gap:2px;padding:4px 0;font-size:13px}
.srcs a span:first-child{color:var(--muted)}
.srcs small{color:var(--muted);font-size:12px;margin-left:6px}
.lit{background:var(--tint);border:1px solid var(--tint-border);border-radius:var(--r-control);padding:8px 12px;font-size:13px;display:flex;align-items:center;gap:8px}
.lit button{margin-left:auto;color:var(--teal-text);font-weight:500;font-size:13px}
.unv{border:1px solid #F0D2A8;background:#FFF9F0;border-radius:var(--r-control);padding:8px 12px;font-size:13px;color:#5C3A0C}
.follow{align-self:flex-start;border:1px solid var(--border);border-radius:999px;padding:6px 14px;font-size:13px;background:var(--white)}
.notice{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.dot{width:6px;height:6px;border-radius:50%;background:var(--mark);animation:pulse 1.2s ease-out infinite}
@keyframes pulse{50%{opacity:.3}}
.aur{height:2px;border-radius:2px;background:linear-gradient(90deg,#3FC79A,#5AAED6,#8B78F0,#5AAED6,#3FC79A);background-size:200% 100%;animation:aurora 3s linear infinite}
@keyframes aurora{to{background-position:200% 0}}
@media (prefers-reduced-motion:reduce){.aur,.dot{animation:none}}
.caret{display:inline-block;width:7px;height:15px;background:var(--teal);vertical-align:-2px;margin-left:2px;opacity:.6}
.state{display:flex;align-items:center;gap:10px;font-size:14px;border-radius:var(--r-control);padding:10px 12px;border:1px solid var(--hairline)}
.state.err{border-color:#E8C4C4;background:#FCF5F5;color:var(--danger)}
.state button{margin-left:auto;color:var(--teal-text);font-weight:500}
.crisis{border:1px solid var(--ink);border-radius:var(--r-control);padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:14px}
.crisis b{font-weight:600}
.where{display:flex;flex-direction:column;gap:12px}
.where p{font-size:16px;line-height:1.45}
.starters{display:flex;flex-direction:column;gap:8px}
.starters button{text-align:left;border:1px solid var(--border);border-radius:var(--r-control);padding:10px 14px;background:var(--white);font-size:14px}
.earlier{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
.earlier::before,.earlier::after{content:"";flex:1;height:1px;background:var(--hairline)}
.comp{border:1px solid var(--border);border-radius:var(--r-surface);padding:10px 10px 10px 14px;display:flex;align-items:flex-end;gap:10px;background:var(--white)}
.comp>span:first-child{flex:1;color:var(--control);padding-bottom:6px}
.comp .go{width:34px;height:34px;border-radius:8px;background:var(--ink);display:grid;place-items:center}
.comp .stop{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);display:grid;place-items:center}
.comp.off{background:var(--wash)}
.comp-meta{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px}

/* C: panel */
.c-split{display:grid;grid-template-columns:minmax(0,1fr) 440px;height:836px}
.c-split .wrap{padding:24px 40px 0}
.panel{border-left:1px solid var(--hairline);background:var(--white);display:flex;flex-direction:column;min-height:0}
.p-hd{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid var(--hairline)}
.p-hd .section{font-size:16px}
.ctx{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);background:var(--wash);border-radius:6px;padding:2px 8px}
.p-hd .x{margin-left:auto;width:32px;height:32px;display:grid;place-items:center;border-radius:8px}
.p-body{flex:1;overflow:hidden;padding:20px}
.p-ft{padding:12px 20px 16px;border-top:1px solid var(--hairline)}
.mini{width:400px;height:auto;min-height:0;border:1px solid var(--border);border-radius:var(--r-surface);background:var(--white);display:flex;flex-direction:column;overflow:hidden}
.mini .p-body{overflow:visible}

/* B: sheet */
.askline{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);width:720px;display:flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--border);border-radius:14px;padding:10px 10px 10px 18px;box-shadow:var(--lift)}
.askline span{flex:1;color:var(--control)}
.askline .btn{flex:none}
.askline .last{color:var(--teal-text);font-size:13px;font-weight:500;border-right:1px solid var(--hairline);padding-right:12px}
.sheet{position:absolute;left:0;right:0;bottom:0;top:120px;background:var(--white);border-radius:16px 16px 0 0;box-shadow:0 -16px 48px rgba(15,42,58,.14);display:flex;flex-direction:column}
.grab{width:40px;height:4px;border-radius:2px;background:var(--border);margin:10px auto 0}
.s-hd{display:flex;align-items:center;gap:12px;padding:10px 120px 14px;border-bottom:1px solid var(--hairline)}
.s-hd .x{margin-left:auto}
.s-body{flex:1;overflow:hidden;display:grid;grid-template-columns:minmax(0,680px) 300px;gap:56px;padding:28px 120px 0;justify-content:center}
.s-ft{padding:14px 0 22px;display:flex;justify-content:center}
.s-ft .comp{width:680px;margin-right:356px}
.aside-note{display:flex;flex-direction:column;gap:12px;font-size:13px}

/* A: room */
.room{display:grid;grid-template-columns:320px minmax(0,1fr);height:836px}
.r-side{border-right:1px solid var(--hairline);padding:24px 24px;display:flex;flex-direction:column;gap:20px;background:var(--wash)}
.r-side h3{font-size:13px;font-weight:600}
.thread{display:flex;flex-direction:column}
.thread a{display:flex;justify-content:space-between;padding:9px 10px;border-radius:8px;color:var(--ink);font-size:14px}
.thread a.on{background:var(--white);box-shadow:inset 0 0 0 1px var(--hairline);font-weight:500}
.thread a small{color:var(--muted);font-size:12px}
.r-main{display:flex;flex-direction:column;min-height:0}
.r-hd{padding:20px 0 12px;width:720px;margin:0 auto;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--hairline)}
.r-body{flex:1;overflow:hidden;width:720px;margin:0 auto;padding-top:24px}
.r-ft{width:720px;margin:0 auto;padding:12px 0 20px}

/* phone */
.m .hdr{padding:0 16px;height:56px}
.m .wrap{padding:16px 16px 0}
.tabs{position:absolute;bottom:0;left:0;right:0;height:64px;border-top:1px solid var(--hairline);display:flex;background:var(--white)}
.tabs span{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px;color:var(--muted)}
.tabs span.on{color:var(--ink);font-weight:500}
.m-view{position:absolute;inset:0;background:var(--white);display:flex;flex-direction:column}
.m-hd{height:56px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid var(--hairline)}
.m-body{flex:1;overflow:hidden;padding:16px}
.m-ft{padding:10px 12px 14px;border-top:1px solid var(--hairline)}
.m .askline{width:auto;left:12px;right:12px;transform:none;bottom:76px;padding:8px 8px 8px 14px}
.m .sheet{top:44px}
.m .s-hd{padding:8px 16px 12px}
.m .s-body{display:block;padding:16px}
.m .s-ft{padding:10px 12px 14px}
.m .s-ft .comp{width:100%;margin:0}
.m .crumb{margin-bottom:10px}

.states{display:grid;grid-template-columns:repeat(3,400px);gap:24px}
@media (max-width:1300px){.states{grid-template-columns:repeat(2,400px)}}
@media (max-width:900px){.states{grid-template-columns:400px}.intro{grid-template-columns:1fr}}
.settings{display:grid;grid-template-columns:440px minmax(0,1fr);gap:16px;padding:24px 120px 0}
.ink{background:var(--ink);color:var(--white);border-radius:var(--r-surface);padding:32px;display:flex;flex-direction:column;gap:0;height:760px}
.ink .row2{border-top:1px solid #24465A;padding:14px 0;display:flex;justify-content:space-between;align-items:center}
.ink small{color:#A9BDC7;font-size:13px;display:block}
.ink .chg{color:var(--mark);font-size:13px;font-weight:500}
.ink .row2.on small{color:var(--mark)}
.memlist{padding:40px 56px;display:flex;flex-direction:column;gap:16px}
.mem{display:flex;align-items:flex-start;gap:16px;border:1px solid var(--hairline);border-radius:var(--r-control);padding:14px 16px}
.mem div{flex:1}
.mem small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
.mem .acts{display:flex;gap:4px;flex:none}
.mem .acts button{height:32px;padding:0 10px;border-radius:8px;font-size:13px;font-weight:500;color:var(--teal-text)}
.mem .acts button.del{color:var(--danger)}
.mem.edit{border-color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal)}
.field{border:1px solid var(--border);border-radius:var(--r-control);padding:9px 12px;background:var(--white)}
"""

def ic(name, size=16, color="currentColor", sw=1.75):
    p = {
        "check": '<path d="M20 6 9 17l-5-5"/>',
        "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        "arrow": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
        "up": '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
        "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        "stop": '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
        "ext": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        "left": '<path d="m15 18-6-6 6-6"/>',
        "right": '<path d="m9 18 6-6-6-6"/>',
        "down": '<path d="m6 9 6 6 6-6"/>',
        "home": '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
        "route": '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
        "gear": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
        "guide": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
        "retry": '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
        "info": '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        "alert": '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
        "expand": '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
    }[name]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'

LOGO = '<span class="logo"><i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M3 15c3-3 6-3 9 0s6 3 9 0"/><circle cx="12" cy="8" r="2.2" fill="#3FC9B7" stroke="none"/></svg></i>LandedNZ</span>'

def header(active, entry, mobile=False):
    """entry: 'ask' (header Ask button), 'nav' (Guide nav item), 'none'."""
    if mobile:
        end = '<span class="end">' + ('<span class="btn sm">Ask</span>' if entry == "ask" else "") + '<span class="av">E</span></span>'
        return f'<div class="hdr">{LOGO}{end}</div>'
    items = ["Home", "Roadmap"] + (["Guide"] if entry == "nav" else []) + ["Settings"]
    nav = "".join(f'<span class="{"on" if i == active else ""}">{i}</span>' for i in items)
    end = '<span class="end">' + ('<span class="btn">Ask <kbd>/</kbd></span>' if entry == "ask" else "") + '<span class="av">E</span></span>'
    return f'<div class="hdr">{LOGO}<span class="nav">{nav}</span>{end}</div>'

def tabs(active, guide=False):
    items = [("Home", "home"), ("Roadmap", "route")] + ([("Guide", "guide")] if guide else []) + [("Settings", "gear")]
    return '<div class="tabs">' + "".join(f'<span class="{"on" if n == active else ""}">{ic(i, 20)}{n}</span>' for n, i in items) + "</div>"

ROUTE_SVG = '''<svg viewBox="0 0 1160 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 C180 30 260 40 380 55 S620 85 760 70 S1000 30 1160 35" fill="none" stroke="#C9D3D7" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/><path d="M0 70 C180 45 260 55 380 70 S620 100 760 85 S1000 45 1160 50" fill="none" stroke="#E3E8EA" stroke-width="1.5"/><circle cx="170" cy="40" r="7" fill="#fff" stroke="#0F2A3A" stroke-width="3"/><line x1="240" y1="0" x2="240" y2="90" stroke="#0E7C7B" stroke-dasharray="2 3"/></svg>'''

def home_main(narrow=False):
    g2 = "grid-template-columns:1fr" if narrow else ""
    return f'''<div class="home-top"><span class="title">Welcome to Auckland</span><span class="muted">0 of 19 done · day 1 since you landed on Thu 29 Oct</span></div>
<div class="card route"><div style="display:flex;justify-content:space-between"><span class="section">Your 90 days</span><a class="small">Open roadmap</a></div>{ROUTE_SVG}
<div class="stages"><span>Before you flew<br>7 tasks</span><span><b>Arrival · now</b><br>4 tasks</span><span>Week 1<br>4 tasks</span><span>Month 1<br>3 tasks</span><span>Later<br>1 task</span></div></div>
<div class="grid2" style="{g2}"><div class="card next"><span class="small tealt" style="font-weight:500">Your next move · Before you flew · 2–3 hours</span><span class="section">Choose where to live</span><p class="muted">Immigration New Zealand says where you live might depend on your job or where you want to study, and other things can affect the decision too.</p><div style="display:flex;gap:8px;margin-top:8px"><span class="btn pri">Start task</span><span class="btn">Ask about this</span></div></div>
<div class="card week"><div class="section">Then this week</div><ul><li><i></i>Get an NZ SIM card<em>15–30 minutes</em></li><li><i></i>Open a bank account<em>45–90 minutes</em></li><li><i></i>Apply for your IRD number<em>20–30 minutes</em></li></ul></div></div>'''

TASK_STEPS = '''<ol class="steps"><li><b>1</b><span>Register for myIR, Inland Revenue's online service. You don't need an IRD number to register.<sup>3</sup></span></li>
<li><b>2</b><span>In myIR, apply as a new arrival. Inland Revenue checks your identity with Immigration New Zealand.<sup>2</sup></span></li>
<li><b>3</b><span>Apply by your visa's final arrival date, the date you must arrive in New Zealand by.<sup>2</sup></span></li>
<li><b>4</b><span>If your application is approved, your IRD number comes by text or email in 2 days.<sup>2</sup></span></li>
<li><b>5</b><span>Give your employer your IRD number with a completed tax code declaration (IR330).<sup>1</sup></span></li>
<li><b>6</b><span>Give your bank your IRD number too. Without it, tax on interest is deducted at 45%.<sup>5</sup></span></li></ol>'''

def task_main(ask_button=False, side=True):
    sidecol = ""
    if side:
        extra = '<span class="btn">' + ic("guide") + ' Ask about this task</span>' if ask_button else ""
        sidecol = f'''<div class="side"><div class="card"><div style="display:flex;justify-content:space-between"><b style="font-weight:600">Not started</b><span class="small tealt" style="font-weight:500">Best done by Wed 11 Nov</span></div><span class="btn pri">Mark as done</span><span class="small muted">You can undo this.</span><span class="btn">Open the IRD application {ic("ext")}</span>{extra}</div>
<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="section">Sources</span><span class="small muted">checked 25 Oct 2026</span></div>
<div><div class="srcrow"><span class="muted">1</span><span><a>Tax code declaration (IR330)</a><small>ird.govt.nz</small></span></div><div class="srcrow"><span class="muted">2</span><span><a>New arrival to New Zealand: IRD number application</a><small>ird.govt.nz</small></span></div><div class="srcrow"><span class="muted">3</span><span><a>Register for a myIR account</a><small>ird.govt.nz</small></span></div></div><a class="small" style="font-weight:500">5 more sources</a></div></div>'''
    return f'''<div class="crumb">{ic("left")}<b style="font-weight:500">Roadmap</b><span class="small muted">/ Arrival · task 3 of 4</span></div>
<div class="taskg" style="{"" if side else "grid-template-columns:1fr"}"><div class="card taskmain"><span class="small muted">Arrival · 20–30 minutes</span><span class="title">Apply for your IRD number</span><p class="muted" style="max-width:62ch">Without your IRD number and a tax code declaration, your employer deducts tax at 45% plus the earners' levy.<sup>1</sup></p><span class="section" style="margin-top:12px">Steps</span>{TASK_STEPS}</div>{sidecol}</div>'''

def roadmap_main():
    rows = [("Book temporary accommodation", "Before you flew · 1–2 hours"), ("Check your public health eligibility and cover", "Before you flew · 1–2 hours"), ("Get an NZ SIM card", "Arrival · 15–30 minutes"), ("Open a bank account", "Arrival · 45–90 minutes"), ("Apply for your IRD number", "Arrival · 20–30 minutes")]
    li = "".join(f'<li><i></i><span>{t}</span><span class="small muted">{m}</span></li>' for t, m in rows)
    return f'''<div class="home-top"><span class="title">Your roadmap</span><span class="muted">0 of 19 done · day 1</span></div>
<div class="card route" style="margin-bottom:16px">{ROUTE_SVG}</div>
<div class="card rmap"><div style="display:flex;justify-content:space-between;padding-bottom:12px"><span class="section">Arrival · 4 tasks</span><span class="small muted">29–30 Oct</span></div><ul>{li}</ul></div>'''

# ---------- conversation parts ----------
def origin(kind="guide"):
    if kind == "guide":
        return f'<p class="origin">{ic("shield", 16)}From LandedNZ\'s checked guide</p>'
    return f'<p class="origin">{ic("shield", 16)}From official sites, checked today <small>30 Oct</small></p>'

def q(text, where=None):
    w = f"<small>Asked on {where}</small>" if where else ""
    return f'<div class="q">{text}{w}</div>'

def tasklink(title="Apply for your IRD number", meta="Arrival · 20–30 minutes"):
    return f'<a class="tlink"><i class="bead"></i><span><b>{title}</b><small>{meta}</small></span>{ic("arrow", 16, "#0A6463")}</a>'

SRCS = '<div class="srcs"><a><span>1</span><span>Tax code declaration (IR330)<small>ird.govt.nz</small></span></a><a><span>2</span><span>New arrival to New Zealand: IRD number application<small>ird.govt.nz</small></span></a><a><span>3</span><span>Register for a myIR account<small>ird.govt.nz</small></span></a></div>'

def answer_full(remember=True, follow=True, unverified=False, link=True):
    parts = [origin(),
        '<p>Yes. You can start work before your IRD number arrives. Until you give your employer your number and a tax code declaration, they deduct tax at 45% plus the earners\' levy.<sup>1</sup></p>',
        '<h4>Steps</h4><ol class="st"><li><b>1</b><span>Register for myIR. You don\'t need an IRD number to register.<sup>3</sup></span></li><li><b>2</b><span>In myIR, apply as a new arrival.<sup>2</sup></span></li><li><b>3</b><span>When your number comes, give it to your employer with a completed IR330.<sup>1</sup></span></li></ol>',
        '<div class="cant"><b style="font-weight:600;font-size:13px">What I can\'t tell you</b><span class="muted">How long your own application will take beyond the usual 2 days. Inland Revenue can: 0800 227 774.</span></div>']
    if link: parts.append(tasklink())
    parts.append(SRCS)
    if unverified: parts.append('<div class="unv"><b style="font-weight:600">Double-check one line.</b> I couldn\'t match "the usual 2 days" to a source. Inland Revenue\'s new arrival page has the current timing.</div>')
    if remember: parts.append(f'<div class="lit">{ic("check", 14, "#0A6463")}<span>Remembered: you start work on 9 November.</span><button>Undo</button></div>')
    if follow: parts.append('<button class="follow">What goes on the tax code declaration?</button>')
    return '<article class="ans">' + "".join(parts) + "</article>"

def answer_streaming():
    return f'''<article class="ans"><div class="aur"></div>{origin()}<p>Yes. You can start work before your IRD number arrives. Until you give your employer your number and a tax code declaration, they deduct tax at 45% plus the earners' levy.<sup>1</sup><span class="caret"></span></p><p class="notice"><i class="dot"></i>Checking ird.govt.nz…</p></article>'''

def composer(state="idle", placeholder="Ask about your IRD number", left="14 of 20 questions left today"):
    if state == "stream":
        btn = f'<span class="stop" aria-label="Stop">{ic("stop", 14)}</span>'
        ph = "Answer coming in…"
        cls = "comp off"
    elif state == "cap":
        btn = f'<span class="go" style="opacity:.35">{ic("up", 16, "#fff")}</span>'
        ph, cls = "Back at midnight NZ time", "comp off"
    elif state == "busy":
        btn = f'<span class="go" style="opacity:.35">{ic("up", 16, "#fff")}</span>'
        ph, cls = "Waiting for the other window", "comp off"
    else:
        btn = f'<span class="go">{ic("up", 16, "#fff")}</span>'
        ph, cls = placeholder, "comp"
    meta = f'<div class="comp-meta"><span>{left}</span></div>' if left else ""
    return f'<div class="{cls}"><span>{ph}</span>{btn}</div>{meta}'

def opening(context="home"):
    if context == "home":
        line = "Day 1 in Auckland. Next up is choosing where to live, and three Arrival tasks are due this week."
        st = ["Do I need an IRD number before I start work?", "What do I need to open a bank account?", "Where can I get a SIM card on my first day?"]
    else:
        line = "You're on Arrival, 0 of 4 done. Your IRD number is next after your bank account."
        st = ["Can I start work before my IRD number arrives?", "Do I need a bank account before I apply for an IRD number?", "What happens after my arrival date passes?"]
    b = "".join(f"<button>{s}</button>" for s in st)
    return f'<div class="where"><p>{line}</p><div class="starters">{b}</div></div>'

def from_task_history():
    return f'''<div class="g-body"><div class="earlier"><a style="font-weight:500">Show all 14 messages</a></div>
{q("Do I need a bank account first?", "this task · 29 Oct")}
<article class="ans">{origin()}<p>Only if you hold a work or student visa. Then you need a New Zealand bank account or a customer due diligence form (IR997).<sup>4</sup></p></article>
{q("Can I start work before my IRD number arrives?")}{answer_full(remember=True, follow=True)}</div>'''

STATES = {
    "Streaming, with Stop": lambda: f'{q("Can I start work before my IRD number arrives?")}{answer_streaming()}',
    "Interrupted": lambda: f'{q("Can I start work before my IRD number arrives?")}<article class="ans">{origin()}<p>Yes. You can start work before your IRD number arrives. Until you give your employer your number and a tax code declaration, they deduct tax at 45% plus the earners\' levy.<sup>1</sup></p><div class="state">{ic("info", 16)}Interrupted<button>{ic("retry", 14)} Retry</button></div></article>',
    "Failed before any text": lambda: f'{q("Can I start work before my IRD number arrives?")}<div class="state err">{ic("alert", 16)}Something went wrong. This question wasn\'t counted.<button>Retry</button></div>',
    "Busy in another window": lambda: f'{q("What's an IR330?")}<div class="state">{ic("clock", 16)}An answer is still coming in another window.</div>',
    "Daily cap reached": lambda: f'<div class="state">{ic("clock", 16)}<span>You\'ve used today\'s 20 questions. Back at midnight NZ time. Your history stays here.</span></div>',
    "Nothing found": lambda: f'{q("Can I claim my moving costs back?")}<article class="ans"><p>I couldn\'t find this in checked sources. Inland Revenue is the right place to ask.</p><a class="small" style="font-weight:500">ird.govt.nz {ic("ext", 12)}</a></article>',
    "Official sites unavailable": lambda: f'{q("Is myIR down today?")}<article class="ans"><p class="notice">{ic("info", 14)}Official sites didn\'t respond, so this answer uses LandedNZ\'s checked guide only.</p>{origin()}<p>The guide has no outage information. Inland Revenue posts service updates on its website.<sup>1</sup></p></article>',
    "Distress, with crisis text": lambda: f'{q("I\'m not coping, everything here is too much")}<div class="crisis"><b>If you\'re struggling, you don\'t have to carry it alone.</b><span>Free call or text <b>1737</b> any time to talk with a trained counsellor (Need to Talk?).</span><span>Lifeline: <b>0800 543 354</b>. In an emergency, call <b>111</b>.</span></div><article class="ans"><p>That sounds like a lot at once. Arriving somewhere new is hard, and it\'s okay to take the next step slowly.</p></article>',
    "Unverified note": lambda: f'{q("How much tax without an IRD number?")}{answer_full(remember=False, follow=False, unverified=True, link=False)}',
}

def state_cards(wrapper):
    out = []
    for name, f in STATES.items():
        comp_state = "stream" if name.startswith("Streaming") else "cap" if name.startswith("Daily") else "busy" if name.startswith("Busy") else "idle"
        out.append(f'<figure>{wrapper(f"<div class=\"g-body\">{f()}</div>", composer(comp_state, left="0 of 20 questions left today" if comp_state == "cap" else "14 of 20 questions left today"))}<figcaption><b>{name}</b></figcaption></figure>')
    return '<div class="states">' + "".join(out) + "</div>"

def settings_memory(mobile=False, entry="ask"):
    mems = [("You start work on 9 November.", "From the guide, 30 Oct"), ("Your partner arrives in December.", "From the guide, 29 Oct"), ("You'd rather bank with a branch near Newmarket.", "From the guide, 29 Oct")]
    rows = []
    for i, (t, s) in enumerate(mems):
        if i == 1 and not mobile:
            rows.append(f'<div class="mem edit"><div><div class="field">Your partner arrives on 12 December.</div><small>Edited facts are used from your next question.</small></div><span class="acts"><button>Cancel</button><span class="btn sm pri">Save</span></span></div>')
        else:
            rows.append(f'<div class="mem"><div>{t}<small>{s}</small></div><span class="acts"><button>Edit</button><button class="del">Delete</button></span></div>')
    lst = "".join(rows)
    if mobile:
        return f'''<div class="frame m">{header("", entry, True)}<div class="wrap"><div class="crumb">{ic("left")}<b style="font-weight:500">Settings</b></div><span class="section">Memory</span><p class="small muted" style="margin:6px 0 14px">Things you told the guide. It uses them in answers. Delete one and it's gone for good.</p><div style="display:flex;flex-direction:column;gap:10px">{lst}</div><p class="small muted" style="margin-top:14px">3 of 50 kept.</p></div>{tabs("Settings", guide=(entry=="nav"))}</div>'''
    return f'''<div class="frame d">{header("Settings", entry)}<div class="settings"><div class="ink"><span class="title">Settings</span><p style="color:#A9BDC7;margin:10px 0 24px">Your answers build your roadmap. Change one and it's rebuilt; done tasks stay done.</p>
<div class="row2"><span><small>Visa</small>Accredited Employer Work Visa (AEWV)</span><span class="chg">Change</span></div><div class="row2"><span><small>City</small>Auckland</span><span class="chg">Change</span></div><div class="row2"><span><small>Arrival date</small>Thu 29 Oct 2026</span><span class="chg">Change</span></div><div class="row2 on"><span><small>Memory · open</small>3 things the guide remembers</span><span class="chg">Manage</span></div></div>
<div class="card memlist"><span class="section" style="font-size:20px">What the guide remembers</span><p class="muted" style="max-width:60ch;margin-bottom:8px">Only things you told it. It uses them in answers. Delete one and it's gone for good.</p>{lst}<p class="small muted">3 of 50 kept. Health and immigration problems are only kept if you ask.</p></div></div></div>'''

# ---------- direction builders ----------
def panel(body, foot, title_ctx="Apply for your IRD number", cls="panel"):
    ctx = f'<span class="ctx">{ic("route", 12)}{title_ctx}</span>' if title_ctx else ""
    return f'<div class="{cls}"><div class="p-hd"><span class="section">Guide</span>{ctx}<button class="x" aria-label="Close guide">{ic("x")}</button></div><div class="p-body">{body}</div><div class="p-ft">{foot}</div></div>'

def mini_panel(body, foot):
    return panel(body, foot, cls="panel mini")

def sheet_mini(body, foot):
    return f'<div class="mini"><div class="grab"></div><div class="s-hd" style="padding:8px 20px 12px"><span class="small muted">About</span><b style="font-weight:600;font-size:14px">Apply for your IRD number</b><button class="x" aria-label="Collapse">{ic("down")}</button></div><div class="p-body">{body}</div><div class="p-ft">{foot}</div></div>'

def room_mini(body, foot):
    return f'<div class="mini" style="background:var(--white)"><div class="p-hd"><span class="ctx">{ic("route", 12)}Apply for your IRD number</span></div><div class="p-body">{body}</div><div class="p-ft">{foot}</div></div>'

def c_boards():
    home = f'''<div class="frame d">{header("Home", "ask")}<div class="c-split"><div class="wrap">{home_main(narrow=True)}</div>{panel(opening("home"), composer(placeholder="Ask about your first 90 days"), "Choose where to live")}</div></div>'''
    task = f'''<div class="frame d">{header("Roadmap", "ask")}<div class="c-split"><div class="wrap">{task_main()}</div>{panel(from_task_history(), composer())}</div></div>'''
    road = f'''<div class="frame d">{header("Roadmap", "ask")}<div class="c-split"><div class="wrap">{roadmap_main()}</div>{panel(f'<div class="g-body">{q("Which tasks can I do before I have an address?", "Roadmap")}{answer_streaming()}</div>', composer("stream"), "Roadmap")}</div></div>'''
    task_closed = f'''<div class="frame d">{header("Roadmap", "ask")}<div class="wrap">{task_main(ask_button=True)}</div></div>'''
    m_home = f'''<div class="frame m">{header("Home", "ask", True)}<div class="wrap">{home_main(narrow=True)}</div>{tabs("Home")}</div>'''
    m_task = f'''<div class="frame m"><div class="m-view"><div class="m-hd">{ic("left")}<span style="font-weight:500">Apply for your IRD number</span></div><div class="m-body">{from_task_history()}</div><div class="m-ft">{composer(left=None)}</div></div></div>'''
    m_open = f'''<div class="frame m"><div class="m-view"><div class="m-hd">{ic("left")}<span style="font-weight:500">Roadmap</span></div><div class="m-body"><span class="section">Guide</span><div style="height:12px"></div>{opening("task")}</div><div class="m-ft">{composer(placeholder="Ask about your roadmap")}</div></div></div>'''
    return dict(
        key="c", entry_kind="ask", name="C · Side panel that pushes the page aside", short="C Side panel",
        thesis="The guide opens as a 440 px panel on the right of whatever screen you are on. The page moves left to make room, so the task you asked about stays readable beside the answer. On a phone it becomes a full-screen view with Back to your task.",
        world="r1-final as it is: white panel, hairline edge, teal origin line, ink Send. The aurora runs only as a 2 px line above an answer while it is being written.",
        entry="Header Ask / stays (no shared-chrome change). Ask about this on cards opens the panel with that task as context.",
        risk="At 1440 the task's main column narrows to about 520 px while the panel is open. It is still a 62-character line, but it's tighter than now.",
        boards=[
            ("Placement at 1440", "The page reflows beside the panel. Nothing is covered.", [
                (home, "<b>Home</b>, opened from Ask about this on Choose where to live: one line and three starters."),
                (task, "<b>Task</b>, docked: this task's messages first, with Show all 14 messages above. Ask has left the actions column; that column stays put while the main card scrolls."),
                (road, "<b>Roadmap</b>, an answer streaming: aurora line, Checking ird.govt.nz…, Send has become Stop."),
                (task_closed, "<b>Task, guide closed</b>: Ask about this task joins the actions card in place of the old Ask box."),
            ]),
            ("Placement at 390", "On a phone the panel becomes a full-screen view. Back returns to the screen it was opened from.", [
                (m_home, "<b>Home</b>, header Ask is the entry."), (m_task, "<b>From a task</b>: back arrow names the task."), (m_open, "<b>From Roadmap</b>, first visit."),
            ]),
        ],
        wrapper=mini_panel)

def b_boards():
    askline = lambda ph, last=True: f'<div class="askline">{"<span class=\"last\">Last answer</span>" if last else ""}<span>{ph}</span><kbd>/</kbd><span class="btn sm pri" style="height:32px">{ic("up", 14, "#fff")}</span></div>'
    def sheet(body, foot, about="Apply for your IRD number", aside=True):
        side = f'<div class="aside-note"><span class="section" style="font-size:15px">This task</span>{tasklink()}<span class="small muted">Sources in this answer</span>{SRCS}</div>' if aside else "<div></div>"
        return f'<div class="dim"></div><div class="sheet"><div class="grab"></div><div class="s-hd"><span class="small muted">About</span><b style="font-weight:600">{about}</b><button class="x btn sm">{ic("down")} Back to the page</button></div><div class="s-body"><div>{body}</div>{side}</div><div class="s-ft"><div class="comp" style="width:680px;margin-right:356px"><span>Ask about your IRD number</span><span class="go">{ic("up", 16, "#fff")}</span></div></div></div>'
    home = f'''<div class="frame d">{header("Home", "none")}<div class="wrap">{home_main()}</div>{askline("Ask about your first 90 days", last=False)}</div>'''
    task = f'''<div class="frame d">{header("Roadmap", "none")}<div class="wrap">{task_main()}</div>{sheet(from_task_history(), "")}</div>'''
    road = f'''<div class="frame d">{header("Roadmap", "none")}<div class="wrap">{roadmap_main()}</div>{askline("Ask about your roadmap")}</div>'''
    task_closed = f'''<div class="frame d">{header("Roadmap", "none")}<div class="wrap">{task_main()}</div>{askline("Ask about your IRD number")}</div>'''
    m_home = f'''<div class="frame m">{header("Home", "none", True)}<div class="wrap">{home_main(narrow=True)}</div><div class="askline"><span>Ask about your first 90 days</span><span class="btn sm pri" style="height:32px">{ic("up", 14, "#fff")}</span></div>{tabs("Home")}</div>'''
    m_task = f'''<div class="frame m"><div class="dim"></div><div class="sheet"><div class="grab"></div><div class="s-hd"><b style="font-weight:600;font-size:14px">Apply for your IRD number</b><button class="x" aria-label="Collapse">{ic("down")}</button></div><div class="s-body">{from_task_history()}</div><div class="s-ft">{composer(left=None)}</div></div></div>'''
    m_open = f'''<div class="frame m"><div class="dim"></div><div class="sheet" style="top:300px"><div class="grab"></div><div class="s-body">{opening("task")}</div></div></div>'''
    return dict(
        key="b", entry_kind="none", name="B · Ask line with a rising sheet", short="B Ask line",
        thesis="One ask field sits at the bottom of every workspace screen and already knows where you are (\"Ask about your IRD number\"). Asking raises a sheet over the page: the answer reads in a 680 px column with this task and its sources beside it. Back to the page lowers it to the line again.",
        world="r1-final tokens. The ask line is the one floating element, lifted with the app's own shadow. The sheet uses a 16 px top radius so it reads as a layer, not a card.",
        entry="Replaces the header Ask button with the line; / still focuses it.",
        risk="The sheet covers most of the page you asked about, so you can't read the task and the answer side by side. It also takes space from the bottom of every page.",
        flag="Shared chrome: removes header Ask from every signed-in page.",
        boards=[
            ("Placement at 1440", "Closed, the guide is one line. Open, it is a sheet over the page.", [
                (home, "<b>Home</b>, the line at rest."),
                (task, "<b>Task</b>, sheet raised: this task's messages first; the task link and the answer's sources sit beside it."),
                (road, "<b>Roadmap</b>, after an answer: Last answer reopens the sheet where you left it."),
                (task_closed, "<b>Task, sheet lowered</b>: the Ask box is gone from the actions column."),
            ]),
            ("Placement at 390", "The line sits above the tab bar. The sheet rises to near full height; half height for starters.", [
                (m_home, "<b>Home</b>, the line above the tabs."), (m_task, "<b>From a task</b>, full sheet."), (m_open, "<b>First open</b>, half sheet with starters."),
            ]),
        ],
        wrapper=sheet_mini)

def a_boards():
    side = lambda active="ird": f'''<div class="r-side"><a class="btn" style="justify-content:flex-start">{ic("left")} Back to your task</a><div><h3>You came from</h3><div style="height:8px"></div>{tasklink()}</div><div><h3>Conversation</h3><div style="height:6px"></div><div class="thread"><a class="{"on" if active=="ird" else ""}">Apply for your IRD number <small>3</small></a><a>Open a bank account <small>2</small></a><a>Choose where to live <small>4</small></a><a class="{"on" if active=="all" else ""}">Everything <small>14</small></a></div></div><p class="small muted" style="margin-top:auto">Asked anywhere, kept in one conversation on all your devices.</p></div>'''
    def room(body, foot, active="ird", head="Apply for your IRD number"):
        return f'''<div class="room">{side(active)}<div class="r-main"><div class="r-hd"><span class="title" style="font-size:20px">{head}</span>{"<span class=\"small muted\" style=\"margin-left:auto\">Questions from this task first</span>" if active=="ird" else ""}</div><div class="r-body">{body}</div><div class="r-ft">{foot}</div></div></div>'''
    home = f'''<div class="frame d">{header("Home", "nav")}<div class="wrap">{home_main()}</div></div>'''
    task = f'''<div class="frame d">{header("Guide", "nav")}{room(from_task_history(), composer())}</div>'''
    road = f'''<div class="frame d">{header("Guide", "nav")}{room(opening("task"), composer(placeholder="Ask about your roadmap"), "all", "Everything")}</div>'''
    task_closed = f'''<div class="frame d">{header("Roadmap", "nav")}<div class="wrap">{task_main(ask_button=True)}</div></div>'''
    m_home = f'''<div class="frame m">{header("Home", "none", True)}<div class="wrap">{home_main(narrow=True)}</div>{tabs("Home", guide=True)}</div>'''
    m_task = f'''<div class="frame m"><div class="m-view"><div class="m-hd">{ic("left")}<span style="font-weight:500">Back to your task</span></div><div class="m-body">{from_task_history()}</div><div class="m-ft">{composer(left=None)}</div></div></div>'''
    m_open = f'''<div class="frame m">{header("Guide", "none", True)}<div class="wrap"><span class="section">Guide</span><div style="height:12px"></div>{opening("home")}</div>{tabs("Guide", guide=True)}</div>'''
    return dict(
        key="a", entry_kind="nav", name="A · Guide room, its own page", short="A Guide room",
        thesis="The guide gets its own page. A reading column of 720 px carries the answers, and a side column shows where you came from (with Back to your task) and the conversation grouped by task. Ask about this on any card or task opens the room on that task.",
        world="r1-final tokens. The side column uses the app's wash ground so the reading column stays the brightest thing on screen.",
        entry="Adds Guide to the top nav and a fourth Guide tab on phone; header Ask is removed.",
        risk="You leave the task to ask about it. Comparing the answer with the task's own steps means going back and forth.",
        flag="Shared chrome: adds a nav item and a fourth phone tab on every signed-in page.",
        boards=[
            ("Placement at 1440", "Home, roadmap and task keep their layouts; the guide is a destination.", [
                (home, "<b>Home</b>: Guide in the nav; Ask about this opens the room on that task."),
                (task, "<b>Opened from a task</b>: this task's messages first, Back to your task top left, the conversation grouped by task."),
                (road, "<b>Opened from Roadmap</b>, first visit: one line and three starters."),
                (task_closed, "<b>Task</b>: Ask about this task joins the actions card in place of the old Ask box."),
            ]),
            ("Placement at 390", "A fourth Guide tab. Opened from a task, the view leads with Back to your task.", [
                (m_home, "<b>Home</b>, four tabs."), (m_task, "<b>From a task</b>."), (m_open, "<b>Guide tab</b>, first visit."),
            ]),
        ],
        wrapper=room_mini)

ALL = [a_boards, b_boards, c_boards]

def render(d, dirs):
    URLS={"a":"https://claude.ai/artifact/4QLVkxdWCk63JCHvRt5r1Z","b":"https://claude.ai/artifact/Tsm6E1YTsLbqNViJ6Ty3uC","c":"https://claude.ai/artifact/2h6YHMRBoHsRe8KdjaWYqJ"}
    switch = "".join(f'<a href="{URLS[x["key"]]}" {"aria-current=\"page\"" if x["key"] == d["key"] else ""}>{x["short"]}{" (recommended)" if x["key"] == "c" else ""}</a>' for x in dirs)
    rec = '<span class="rec">' + ic("check", 14) + ' Recommended</span>' if d["key"] == "c" else ""
    flag = f'<dd><span class="flag">Owner decision</span>{d["flag"]}</dd>' if d.get("flag") else ""
    boards = []
    for title, note, frames in d["boards"]:
        figs = "".join(f'<figure><div class="scrollx">{f}</div><figcaption>{c}</figcaption></figure>' for f, c in frames)
        boards.append(f'<section class="board"><h2>{title}</h2><p class="note">{note}</p><div class="row">{figs}</div></section>')
    w = d["wrapper"]
    opening_figs = f'''<div class="row"><figure>{w('<div class="g-body">' + opening("home") + '</div>', composer(placeholder="Ask about your first 90 days"))}<figcaption><b>Empty first visit</b>: one "where you are" line and at most three starters, gone once you ask.</figcaption></figure>
<figure>{w(from_task_history(), composer())}<figcaption><b>Opened from a task</b>: that task's messages first, full history one tap away. Remembered holds its tint until you act or scroll on.</figcaption></figure></div>'''
    mem = f'''<div class="row"><figure><div class="scrollx">{settings_memory(entry=d["entry_kind"])}</div><figcaption><b>Settings → Memory at 1440</b>: a new row in the settings card opens the list; edit in place, delete is immediate and permanent.</figcaption></figure><figure>{settings_memory(True, entry=d["entry_kind"])}<figcaption><b>Settings → Memory at 390</b>.</figcaption></figure></div>'''
    body = f'''<header class="intro"><div><h1>{d["name"]}</h1><p class="lede">{d["thesis"]}</p>{rec}<nav class="switch" aria-label="Directions">{switch}</nav></div>
<dl class="facts"><div><dt>Look</dt><dd>{d["world"]}</dd></div><div><dt>Entry</dt><dd>{d["entry"]}</dd>{flag}</div><div><dt>Honest risk</dt><dd>{d["risk"]}</dd></div><div><dt>Shared by all three</dt><dd>Each answer opens with where it came from and ends with numbered sources, like the task page. Remembered and unverified notes stay tinted until you act on them.</dd></div></dl></header>
{"".join(boards)}
<section class="board"><h2>Opening</h2><p class="note">Quiet by default: one line, three starters, nothing outside the guide.</p>{opening_figs}</section>
<section class="board"><h2>Conversation and edge states</h2><p class="note">Every state in this direction's own container. Shown text is never taken back; problems are added below the answer.</p>{state_cards(w)}</section>
<section class="board"><h2>Memory</h2><p class="note">In the chat, Remembered with Undo (see Opening). In Settings, every memory visible, editable and deletable.</p>{mem}</section>'''
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guide {d["short"]}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body><main class="page">{body}</main></body></html>'''

if __name__ == "__main__":
    OUT = pathlib.Path(sys.argv[1])
    dirs = [f() for f in ALL]
    OUT.mkdir(parents=True, exist_ok=True)
    for d in dirs:
        (OUT / f"direction-{d['key']}.html").write_text(render(d, dirs))
    print("written", [f"direction-{d['key']}.html" for d in dirs])
