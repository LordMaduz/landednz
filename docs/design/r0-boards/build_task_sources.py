import sys
sys.path.insert(0, '.')
from ui_parts import page

OUT = './'

# Three ways to show each task line's source (spec §8.1). Static sheets, T08 draft copy.
css = """.boards{display:flex;gap:48px;align-items:flex-start;padding:48px}
.variant{display:flex;flex-direction:column;gap:16px}
.sheet{display:flex;flex-direction:column;gap:24px;padding:24px;background:#FFFFFF;border:1px solid #E3E8EA;border-radius:10px;box-sizing:border-box}
.steps{margin:0;padding-left:24px;display:flex;flex-direction:column;gap:8px}
.note{display:block;margin-top:4px}
.ref{font-size:13px;vertical-align:super;line-height:0;margin-left:4px;position:relative}.ref::after{content:'';position:absolute;inset:-8px}
.group{margin:0;padding:0 0 0 16px;border-left:2px solid #E3E8EA}
.refs{margin:0;padding-left:24px;display:flex;flex-direction:column;gap:4px}"""

NEW = ('https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals/new-arrival-to-new-zealand---ird-number-application',
       'New arrival to New Zealand: IRD number application')
WORK = ('https://www.ird.govt.nz/situations/work-or-study-in-new-zealand', 'Work or study in New Zealand')
CODES = ('https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-codes-for-individuals',
         'Tax codes for individuals')
CHECKED = '25 October 2026'

WHY = ('Your employer needs your IRD number and a tax code, or tax is taken at the highest rate.', CODES)
STEPS = [
    ('Register for myIR, Inland Revenue’s online service.', NEW),
    ('Apply as a new arrival before your visa’s final arrival date, with your passport and Immigration NZ application number.', NEW),
    ('On a work or student visa, also have an NZ bank account or an IR997 form ready.', WORK),
    ('Give the number and a completed IR330 tax code form to your employer.', CODES),
]

def link(src, text=None):
    url, title = src
    return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{text or title}<span class="sr"> (opens in a new tab)</span></a>'

def note(src):
    return f'<span class="note t-small muted">{link(src)}, checked {CHECKED}</span>'

def head(width):
    return f'''<div style="display: flex; flex-direction: column; gap: 4px">
        <span class="t-small muted">Arrival, 20 minutes</span>
        <h2 class="t-section">Get your IRD number</h2>
      </div>'''

def actions():
    return '<div style="display: flex; gap: 8px"><button class="btn btn-primary">Mark as done</button></div>'

# A: a source note under every line
def variant_a():
    lis = ''.join(f'<li>{t}{note(s)}</li>' for t, s in STEPS)
    return f'''<p>{WHY[0]}{note(WHY[1])}</p>
      <ol class="steps">{lis}</ol>'''

# B: numbered references in the text, one sources list at the end
def variant_b():
    order = []
    for _, s in [WHY, *STEPS]:
        if s not in order:
            order.append(s)
    ref = lambda s: f'<a class="ref" href="{s[0]}" target="_blank" rel="noopener noreferrer" aria-label="Source: {s[1]}, checked {CHECKED}">{order.index(s) + 1}</a>'
    lis = ''.join(f'<li>{t}{ref(s)}</li>' for t, s in STEPS)
    refs = ''.join(f'<li>{link(s)}, checked {CHECKED}</li>' for s in order)
    return f'''<p>{WHY[0]}{ref(WHY[1])}</p>
      <ol class="steps">{lis}</ol>
      <section aria-label="Sources" class="t-small muted" style="padding-top: 16px; border-top: 1px solid #E3E8EA"><ol class="refs">{refs}</ol></section>'''

# C: consecutive lines from one source share one note after the run
def variant_c():
    runs = []
    for i, (t, s) in enumerate(STEPS):
        if runs and runs[-1][1] == s:
            runs[-1][0].append(i)
        else:
            runs.append(([i], s))
    out = ''
    for idx, s in runs:
        lis = ''.join(f'<li value="{i + 1}">{STEPS[i][0]}</li>' for i in idx)
        out += f'<div class="group"><ol class="steps">{lis}</ol>{note(s)}</div>'
    return f'''<div class="group"><p>{WHY[0]}</p>{note(WHY[1])}</div>
      {out}'''

# Owner picked B on 2026-10-25 (A and C repeat a source line, minimalism check 6); A and C stay for reference
VARIANTS = [('B', 'Numbered references, one list at the end', variant_b)]

def board(width):
    cols = ''.join(f'''<div class="variant" style="width: {width}px">
      <p class="t-small muted">{k}. {label}</p>
      <aside class="sheet">{head(width)}{fn()}{actions()}</aside>
    </div>''' for k, label, fn in VARIANTS)
    return f'<div class="boards">{cols}</div>'

open(OUT + 'TaskSources.dc.html', 'w').write(page('Task sources', board(480), extra_css=css, w=576, h=800))
open(OUT + 'TaskSourcesPhone.dc.html', 'w').write(page('Task sources on a phone', board(390), extra_css=css, w=486, h=900))
