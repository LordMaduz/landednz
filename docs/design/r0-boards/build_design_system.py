import sys
sys.path.insert(0, '.')
from ui_parts import page, public_header, ROUTE_CSS

OUT = './'

css = ROUTE_CSS + """
.ds{padding-top:48px;padding-bottom:96px;display:flex;flex-direction:column;gap:64px}
.ds > section{display:flex;flex-direction:column;gap:24px;padding-top:32px;border-top:1px solid #E3E8EA}
.cap{font-size:13px;color:#4B6170}
.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.sw{display:flex;flex-direction:column;gap:8px}
.sw > div{height:64px;border-radius:6px;border:1px solid #E3E8EA}
.spec{display:flex;flex-direction:column;gap:16px;align-items:flex-start}
.legs > li{padding-bottom:0}
@container (max-width: 960px){.grid4{grid-template-columns:repeat(2,minmax(0,1fr))}.grid3{grid-template-columns:minmax(0,1fr)}}"""

colours = [('#0F2A3A', 'Ink', 'Text, primary button'), ('#4B6170', 'Muted', 'Secondary text'), ('#7A8F99', 'Control', 'Field borders, open waypoints'),
           ('#D5DFE2', 'Border', 'Quiet buttons, option rows'), ('#E3E8EA', 'Hairline', 'Dividers, surfaces, rail'), ('#F6F8F8', 'Wash', 'Hover, selected, panels'),
           ('#0E7C7B', 'Teal', 'The one accent: done, progress, focus'), ('#0A6463', 'Teal text', 'Links (4.5:1 on white)')]
sw = ''.join(f'<div class="sw"><div style="background: {h}"></div><span class="t-strong">{n}</span><span class="cap">{h}, {r}</span></div>' for h, n, r in colours)
sw += '<div class="sw"><div style="background: linear-gradient(90deg,#3FC79A,#5AAED6,#8B78F0); border: 0"></div><span class="t-strong">Aurora</span><span class="cap">AI replies only, never on other elements</span></div>'

types = [('t-hero', '48 / 600', 'Landing hero only', 'Know what to do next'), ('t-title', '32 / 600', 'Page titles', 'Your roadmap'),
         ('t-section', '20 / 600', 'Section and sheet titles', 'Apply for your IRD number'), ('', '15 / 400, 500, 600', 'Body, rows, controls', 'Your employer needs it before your first payday.'),
         ('t-small', '13 / 400', 'Meta, captions, source lines', 'Source: ird.govt.nz, checked 3 March 2026')]
ty = ''.join(f'<div style="display: grid; grid-template-columns: 200px minmax(0,1fr); gap: 24px; align-items: baseline; padding: 16px 0; border-bottom: 1px solid #E3E8EA"><div style="display: flex; flex-direction: column"><span class="t-strong">{s}</span><span class="cap">{u}</span></div><span class="{c}">{e}</span></div>' for c, s, u, e in types)

space = ''.join(f'<div style="display: flex; align-items: center; gap: 16px"><span class="cap" style="width: 32px">{v}</span><span style="height: 8px; width: {v}px; background: #0E7C7B; border-radius: 2px"></span></div>' for v in [4, 8, 16, 24, 32, 48, 64, 96])

ring = 'border-radius: 50%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; '
wp = [('Done', ring + 'width: 12px; height: 12px; background: #0E7C7B', ''), ('Current', ring + 'width: 16px; height: 16px; background: #FFFFFF; border: 2px solid #0F2A3A', ''),
      ('Available', ring + 'width: 12px; height: 12px; background: #FFFFFF; border: 1.5px solid #7A8F99', ''),
      ('Blocked', ring + 'width: 12px; height: 12px; background: #FFFFFF; border: 1.5px solid #7A8F99', '<span style="width: 6px; height: 1.5px; background: #4B6170"></span>'),
      ('Locked', ring + 'width: 12px; height: 12px; background: #FFFFFF; border: 1.5px dashed #7A8F99', '')]
wps = ''.join(f'<div class="spec"><span style="height: 24px; display: flex; align-items: center"><span style="{s}">{inner}</span></span><span class="t-strong">{n}</span></div>' for n, s, inner in wp)
wps += '<div class="spec"><div class="stamp" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #0E7C7B; box-sizing: border-box; transform: rotate(-10deg); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #0A6463; font-size: 13px; font-weight: 600; line-height: 1.1"><span>Done</span><span style="font-weight: 500">22 Oct</span></div><span class="t-strong">Stamp</span><span class="cap">On completion; 200 ms, still for reduced motion</span></div>'

body = public_header('<span class="cap">Precise, 24 October 2026</span>') + f'''
  <main class="container ds">
    <div style="display: flex; flex-direction: column; gap: 8px">
      <h1 class="t-title">Design system</h1>
      <p class="muted" style="max-width: 640px">Geist, hairlines over filled cards, one teal accent, 6 px radius on controls and 10 px on surfaces. Every board on this canvas is built from these parts.</p>
    </div>

    <section aria-labelledby="ds-c"><h2 id="ds-c" class="t-section">Colour</h2><div class="grid4">{sw}</div></section>

    <section aria-labelledby="ds-t"><h2 id="ds-t" class="t-section">Type: Geist</h2><div>{ty}</div></section>

    <section aria-labelledby="ds-s"><h2 id="ds-s" class="t-section">Spacing, radius, elevation</h2>
      <div class="grid3">
        <div class="spec"><span class="t-strong">Spacing: 0, 4, then multiples of 8</span><div style="display: flex; flex-direction: column; gap: 8px">{space}</div></div>
        <div class="spec"><span class="t-strong">Radius</span>
          <div style="display: flex; gap: 16px; align-items: flex-end">
            <div style="display: flex; flex-direction: column; gap: 8px"><span style="width: 64px; height: 44px; border: 1px solid #7A8F99; border-radius: 6px"></span><span class="cap">6, controls</span></div>
            <div style="display: flex; flex-direction: column; gap: 8px"><span style="width: 96px; height: 64px; border: 1px solid #E3E8EA; border-radius: 10px"></span><span class="cap">10, surfaces</span></div>
            <div style="display: flex; flex-direction: column; gap: 8px"><span style="width: 32px; height: 32px; border-radius: 50%; background: #E8F2F1"></span><span class="cap">Round, avatar, dots</span></div>
          </div>
        </div>
        <div class="spec"><span class="t-strong">Elevation</span><span style="width: 160px; height: 96px; border: 1px solid #E3E8EA; border-radius: 10px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(15,42,58,0.04),0 16px 48px rgba(15,42,58,0.08)"></span><span class="cap">One shadow: the landing preview and toasts. Everything else is a hairline.</span></div>
      </div>
    </section>

    <section aria-labelledby="ds-ctl"><h2 id="ds-ctl" class="t-section">Controls</h2>
      <div class="grid3">
        <div class="spec"><span class="cap">Buttons: one primary per screen</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px"><button class="btn btn-primary">Start</button><button class="btn btn-quiet">Ask</button><button class="btn btn-ghost">Show</button><button class="btn btn-primary" disabled>Continue</button></div>
          <button class="btn btn-primary btn-lg">Build my roadmap</button>
        </div>
        <div class="spec" style="align-items: stretch"><span class="cap">Field and option row</span>
          <label class="sr" for="ds-f">Ask a question</label><input id="ds-f" class="field" placeholder="Ask a question">
          <label style="display: flex; gap: 16px; align-items: center; min-height: 48px; padding: 8px 16px; border-radius: 6px; border: 1px solid #0E7C7B; box-shadow: inset 0 0 0 1px #0E7C7B; background: #F6F8F8"><input type="radio" checked style="margin: 0; width: 16px; height: 16px; accent-color: #0E7C7B">Auckland</label>
          <label style="display: flex; gap: 16px; align-items: center; min-height: 48px; padding: 8px 16px; border-radius: 6px; border: 1px solid #D5DFE2"><input type="radio" style="margin: 0; width: 16px; height: 16px; accent-color: #0E7C7B">Wellington</label>
        </div>
        <div class="spec" style="align-items: stretch"><span class="cap">Toast: bottom centre, 4 s, the action named again</span>
          <div role="status" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 8px 8px 16px; border: 1px solid #E3E8EA; border-radius: 10px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(15,42,58,0.04),0 16px 48px rgba(15,42,58,0.08)"><span>Marked as done</span><button class="btn btn-ghost">Undo</button></div>
        </div>
      </div>
    </section>

    <section aria-labelledby="ds-r"><h2 id="ds-r" class="t-section">Route</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 48px">{wps}</div>
      <div class="grid3" style="align-items: start">
        <div class="spec" style="align-items: stretch"><span class="cap">Leg, rows and next-task card on one rail</span>
          <ol class="legs">
            <li class="leg done"><div class="leg-head"><span class="rail"><span style="{ring}width: 12px; height: 12px; background: #0E7C7B"></span></span><div><span class="t-strong">Arrival</span><span class="t-small muted">2 of 2 done</span></div></div></li>
            <li class="leg"><div class="leg-head"><span class="rail"><span style="{ring}width: 12px; height: 12px; background: #FFFFFF; border: 2px solid #0F2A3A"></span></span><div><span class="t-strong">Week 1</span><span class="t-small muted">0 of 3 done</span></div></div>
              <ol class="tasks"><li class="task"><span class="rail"><span style="{ring}width: 12px; height: 12px; background: #FFFFFF; border: 1.5px solid #7A8F99"><span style="width: 6px; height: 1.5px; background: #4B6170"></span></span></span><div class="row" style="cursor: default"><span class="t-strong">Give your employer a tax code</span><span class="t-small muted">Needs your IRD number first</span></div></li></ol></li>
          </ol>
        </div>
        <div class="spec" style="align-items: stretch; grid-column: span 2"><span class="cap">Next-task card (the screen's one primary)</span>
          <article class="hairline" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
            <div style="display: flex; flex-direction: column; gap: 8px"><h3 class="t-section">Apply for your IRD number</h3><p class="muted">Your employer needs it before your first payday.</p></div>
            <div style="display: flex; align-items: center; gap: 16px"><button class="btn btn-primary">Start</button><span class="t-small muted">20–30 minutes online</span></div>
          </article>
        </div>
      </div>
    </section>

    <section aria-labelledby="ds-a"><h2 id="ds-a" class="t-section">Assistant</h2>
      <div class="grid3" style="align-items: start">
        <div class="spec" style="align-items: stretch"><span class="cap">Reply: aurora hairline, one-line trace</span>
          <div class="ai"><div><span class="t-small muted">Read your roadmap, checked ird.govt.nz</span><p>Your passport, your visa details and your NZ bank account number.</p></div></div>
        </div>
        <div class="spec" style="align-items: stretch"><span class="cap">Streaming: the aurora flows; input waits; Stop</span>
          <div class="ai streaming"><div><span class="t-small muted">Checking sources</span><p>Most people get it within 1–2 …</p></div></div>
          <div style="display: flex; gap: 8px"><label class="sr" for="ds-s2">Ask</label><input id="ds-s2" class="field" disabled placeholder="Ask a question" style="flex: 1; min-width: 0; background: #F6F8F8"><button class="btn btn-quiet">Stop</button></div>
        </div>
        <div class="spec"><span class="cap">Suggested questions and source line</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px"><button class="btn btn-quiet" style="font-weight: 400">What documents do I need?</button></div>
          <p class="t-small muted">Source: <a href="#">ird.govt.nz</a>, checked 3 March 2026</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="ds-p"><h2 id="ds-p" class="t-section">Empty, loading, error</h2>
      <div class="grid3" style="align-items: start">
        <div class="spec"><span class="cap">Empty: say what will appear and how</span><p class="muted">Nothing yet. Tasks you finish show up here with the day you did them.</p></div>
        <div class="spec" style="align-items: stretch" aria-hidden="true"><span class="cap">Loading: still placeholders, no shimmer</span>
          <div style="display: flex; flex-direction: column; gap: 16px"><span style="height: 16px; width: 60%; background: #F6F8F8; border-radius: 4px"></span><span style="height: 16px; width: 80%; background: #F6F8F8; border-radius: 4px"></span><span style="height: 16px; width: 40%; background: #F6F8F8; border-radius: 4px"></span></div>
        </div>
        <div class="spec" style="align-items: stretch"><span class="cap">Error: what happened, what's safe, one action</span>
          <div role="alert" style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start; padding: 24px; border: 1px solid #0F2A3A; border-radius: 10px"><span class="t-section">Can't reach LandedNZ</span><span class="muted">Your progress is saved. Check your connection, then try again.</span><button class="btn btn-primary">Try again</button></div>
        </div>
      </div>
    </section>
  </main>'''

open(OUT + 'DesignSystem.dc.html', 'w').write(page('Design system', body, extra_css=css, h=2720))
print('ok')
