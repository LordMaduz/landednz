import sys
sys.path.insert(0, '.')
from ui_parts import page, app_header, public_header, public_footer, phone

OUT = './'

# ---------- Settings ----------
settings_css = """.set{display:grid;grid-template-columns:minmax(0,280px) minmax(0,560px);gap:48px;padding-top:32px;padding-bottom:32px;border-top:1px solid #E3E8EA}
.set > div:first-child{display:flex;flex-direction:column;gap:8px}
.fields{display:flex;flex-direction:column;gap:24px}
.f{display:flex;flex-direction:column;gap:8px}
.f select,.f input{width:100%}
.kv{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px}
@container (max-width: 860px){.set{grid-template-columns:minmax(0,1fr);gap:24px}}"""

settings_css += "\n.sel{position:relative}.sel select{appearance:none;-webkit-appearance:none;padding-right:48px}.sel svg{position:absolute;right:16px;top:50%;transform:translateY(-50%);pointer-events:none}"
chev = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="#4B6170" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def select(id_, label, opts, chosen):
    o = ''.join(f'<option{" selected" if v == chosen else ""}>{v}</option>' for v in opts)
    return f'<div class="f"><label for="{id_}" class="t-strong">{label}</label><div class="sel"><select id="{id_}" class="field">{o}</select>{chev}</div></div>'

settings_body = app_header('') + f'''
  <main class="container" style="padding-top: 48px; padding-bottom: 96px; display: flex; flex-direction: column; gap: 32px">
    <h1 class="t-title">Settings</h1>
    <div>
      <section class="set" aria-labelledby="s-plan">
        <div>
          <h2 id="s-plan" class="t-section">Your plan</h2>
          <p class="muted">Your roadmap is built from these answers. Change one and it's rebuilt; tasks you've done stay done.</p>
        </div>
        <div class="fields">
          {select('visa', 'Visa', ['Accredited Employer Work Visa (AEWV)', 'Green List, work to residence', 'Green List, straight to residence', 'Partner of a student', 'Something else'], 'Accredited Employer Work Visa (AEWV)')}
          {select('city', 'City', ['Auckland', 'Wellington', 'Christchurch', 'Somewhere else'], 'Auckland')}
          {select('family', "Who's moving with you", ['Just me', 'My partner, and we both work', "My partner, who can't work yet", 'My partner and our children'], 'Just me')}
          {select('work', 'Work', ['Technology', 'Healthcare', 'Education', 'Finance', 'Trades', 'Another profession', "I'm still looking for work"], 'Technology')}
          <div class="f"><label for="arrival" class="t-strong">Arrival date</label><input id="arrival" type="date" class="field" value="2026-10-21" style="max-width: 280px"></div>
          <button class="btn btn-primary" style="align-self: flex-start">Save changes</button>
        </div>
      </section>

      <section class="set" aria-labelledby="s-account">
        <div>
          <h2 id="s-account" class="t-section">Account</h2>
          <p class="muted">You sign in with Google.</p>
        </div>
        <div class="fields">
          <div class="kv">
            <div style="display: flex; flex-direction: column"><span class="t-strong">Priya Sharma</span><span class="muted">priya.sharma@gmail.com</span></div>
            <button class="btn btn-quiet">Sign out</button>
          </div>
        </div>
      </section>

      <section class="set" aria-labelledby="s-delete">
        <div>
          <h2 id="s-delete" class="t-section">Delete your account</h2>
          <p class="muted">Removes your answers, your roadmap and your questions to the assistant. This can't be undone.</p>
        </div>
        <div class="fields">
          <button class="btn btn-quiet" style="align-self: flex-start">Delete my account</button>
        </div>
      </section>
    </div>
  </main>'''

open(OUT + 'Settings.dc.html', 'w').write(page('Settings', settings_body, extra_css=settings_css, h=900))
open(OUT + 'SettingsPhone.dc.html', 'w').write(phone('Settings on a phone', 'Settings', 1400))

# ---------- Legal (one template for /privacy and /terms) ----------
legal_css = """.doc{max-width:680px;padding-top:64px;padding-bottom:96px;display:flex;flex-direction:column;gap:48px}
.doc section{display:flex;flex-direction:column;gap:16px}
.doc p,.doc li{line-height:1.6}
.doc ul{margin:0;padding-left:24px;display:flex;flex-direction:column;gap:8px}
.ph{background:#F6F8F8;border-radius:4px;padding:0 4px}"""

legal_body = public_header('<a href="/signin" class="btn btn-quiet">Sign in</a>') + '''
  <main class="container doc">
    <div style="display: flex; flex-direction: column; gap: 8px">
      <h1 class="t-title">Privacy</h1>
      <p class="muted">Last updated 24 October 2026</p>
    </div>

    <section aria-labelledby="l-collect">
      <h2 id="l-collect" class="t-section">What LandedNZ keeps</h2>
      <ul>
        <li>Your name and email address, from Google when you sign in.</li>
        <li>Your five onboarding answers: visa, city, who is moving with you, your work and your arrival date.</li>
        <li>Which tasks you have marked done, and when.</li>
        <li>The questions you ask the assistant and its answers.</li>
      </ul>
    </section>

    <section aria-labelledby="l-use">
      <h2 id="l-use" class="t-section">How it is used</h2>
      <p>To build your roadmap, keep your progress, and answer your questions about it. LandedNZ does not sell your information or use it for advertising.</p>
    </section>

    <section aria-labelledby="l-others">
      <h2 id="l-others" class="t-section">Who else handles it</h2>
      <p>Your questions and the parts of your roadmap they need are sent to Anthropic to write the assistant's answers. Your account and roadmap are stored with <span class="ph">[hosting provider and region]</span>.</p>
    </section>

    <section aria-labelledby="l-rights">
      <h2 id="l-rights" class="t-section">Your rights</h2>
      <p>Under the Privacy Act 2020 you can ask to see the information LandedNZ holds about you and ask for it to be corrected. You can delete your account and everything in it from Settings at any time.</p>
    </section>

    <section aria-labelledby="l-contact">
      <h2 id="l-contact" class="t-section">Contact</h2>
      <p>Questions about your information: <span class="ph">[privacy contact email]</span>.</p>
    </section>
  </main>
''' + public_footer()

open(OUT + 'Legal.dc.html', 'w').write(page('Privacy', legal_body, extra_css=legal_css, h=900))
open(OUT + 'LegalPhone.dc.html', 'w').write(phone('Privacy on a phone', 'Legal', 1500))
print('ok')
