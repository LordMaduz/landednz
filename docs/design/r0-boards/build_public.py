import sys
sys.path.insert(0, '.')
from ui_parts import page, public_header, public_footer, phone, frame, ROUTE_CSS

OUT = './'

# ---------- Landing ----------
landing_css = """.hero{position:relative;overflow:hidden;border-bottom:1px solid #E3E8EA}
.hero-grid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,480px);gap:64px;align-items:center;padding-top:96px;padding-bottom:96px}
.preview{border:1px solid #E3E8EA;border-radius:10px;background:#FFFFFF;box-shadow:0 1px 2px rgba(15,42,58,0.04),0 16px 48px rgba(15,42,58,0.08);overflow:hidden}
.p-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;column-gap:16px;align-items:center;padding:8px 0;background:linear-gradient(var(--line,#E3E8EA),var(--line,#E3E8EA)) 7px 0/2px 100% no-repeat}
.p-row.done{--line:#0E7C7B}
.p-dot{width:12px;height:12px;border-radius:50%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;justify-self:center}
.features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:48px;padding-top:64px;padding-bottom:96px}
.features > div{display:flex;flex-direction:column;gap:8px;padding-top:24px;border-top:1px solid #0F2A3A}
@container (max-width: 560px){.p-row{grid-template-columns:16px minmax(0,1fr);align-items:start}.p-row > .p-dot{margin-top:4px}.p-row > :nth-child(3){grid-column:2}}
@container (max-width: 960px){.hero-grid{grid-template-columns:minmax(0,1fr);gap:48px;padding-top:48px;padding-bottom:64px}.features{grid-template-columns:minmax(0,1fr);gap:32px;padding-top:48px;padding-bottom:64px}}"""

topo = '''<svg aria-hidden="true" viewBox="0 0 1440 640" preserveAspectRatio="xMaxYMid slice" style="position: absolute; inset: 0; width: 100%; height: 100%">
      <g fill="none" stroke="#E3E8EA" stroke-width="1">
        <path d="M760 640 C840 520 780 420 900 360 S1140 330 1210 210 S1360 80 1460 100"/>
        <path d="M810 680 C890 560 840 460 950 400 S1180 380 1260 260 S1390 140 1480 160"/>
        <path d="M860 720 C940 600 900 500 1000 440 S1220 430 1310 310 S1420 200 1500 220"/>
        <path d="M710 600 C790 480 730 380 850 320 S1100 280 1160 160 S1320 20 1420 40"/>
        <path d="M660 560 C740 440 680 340 800 280 S1060 230 1110 110"/>
        <path d="M910 760 C990 640 960 540 1050 480 S1260 480 1360 360"/>
      </g>
    </svg>'''

landing_body = public_header('<a href="/signin" class="btn btn-quiet">Sign in</a>') + f'''
  <main>
    <section class="hero" aria-labelledby="hero-title">
      {topo}
      <div class="container hero-grid">
        <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start">
          <h1 id="hero-title" class="t-hero" style="max-width: 560px">Know what to do next in New Zealand</h1>
          <p class="muted" style="font-size: 20px; line-height: 1.5; max-width: 520px">Answer five questions and get a settling-in roadmap built for your visa, your city and the people moving with you.</p>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px">
            <a href="/start" class="btn btn-primary btn-lg">Build my roadmap</a>
            <span class="t-small muted">You see it before you sign up.</span>
          </div>
        </div>

        <figure class="preview" aria-label="Example: a roadmap on day 3" style="margin: 0">
          <div aria-hidden="true" style="display: flex; align-items: center; gap: 16px; padding: 0 16px; height: 48px; border-bottom: 1px solid #E3E8EA">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#0F2A3A"/><path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/><path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round"/><circle cx="16.5" cy="7.5" r="2" fill="#3FC9B7"/></svg>
            <span class="t-small muted">Home</span><span class="t-small t-strong" style="padding: 4px 8px; border-radius: 6px; background: #F6F8F8">Roadmap</span>
          </div>
          <div aria-hidden="true" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px">
              <span class="t-section">Your roadmap</span><span class="t-small muted">7 of 20 tasks done</span>
            </div>
            <div>
              <div class="p-row done"><span class="p-dot" style="background: #0E7C7B"></span><span class="t-small" style="color: #4B6170">Open a bank account</span><span class="t-small muted">Done 22 Oct</span></div>
              <div class="p-row"><span class="p-dot" style="width: 16px; height: 16px; background: #FFFFFF; border: 2px solid #0F2A3A"></span><span class="t-strong">Apply for your IRD number</span><span class="t-small muted">Next</span></div>
              <div class="p-row"><span class="p-dot" style="background: #FFFFFF; border: 1.5px solid #7A8F99"><span style="width: 6px; height: 1.5px; background: #4B6170"></span></span><span class="t-small">Give your employer a tax code</span><span class="t-small muted">Needs your IRD number</span></div>
              <div class="p-row" style="background-size: 2px 50%"><span class="p-dot" style="background: #FFFFFF; border: 1.5px solid #7A8F99"></span><span class="t-small">Register with a GP</span><span class="t-small muted">Month 1</span></div>
            </div>
            <div class="ai"><div><span class="t-small muted">Read your roadmap, checked ird.govt.nz</span><p class="t-small">Your passport, your visa details and your NZ bank account number. Yours is open, so you have everything.</p></div></div>
          </div>
        </figure>
      </div>
    </section>

    <section class="container features" aria-label="What you get">
      <div>
        <h2 style="font-size: 15px; font-weight: 600">In the right order</h2>
        <p class="muted">Tasks that depend on each other unlock in turn, so you never start one too early.</p>
      </div>
      <div>
        <h2 style="font-size: 15px; font-weight: 600">From official sources</h2>
        <p class="muted">Each task links to the source it was checked against, such as tenancy.govt.nz or acc.co.nz, with the date.</p>
      </div>
      <div>
        <h2 style="font-size: 15px; font-weight: 600">Answers about your roadmap</h2>
        <p class="muted">Ask about any task. The assistant reads your roadmap and tells you what it checked.</p>
      </div>
    </section>
  </main>

'''+ public_footer() + ''''''

open(OUT + 'Landing.dc.html', 'w').write(page('LandedNZ: your settling-in roadmap for New Zealand', landing_body, extra_css=landing_css, h=900))
open(OUT + 'LandingPhone.dc.html', 'w').write(phone('Landing on a phone', 'Landing', 1640))

# ---------- Sign in ----------
GOOGLE_G = ('<svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>'
            '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>'
            '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>'
            '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>')
back_icon = ('<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex: none">'
             '<path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')

signin_css = """.signin{display:grid;grid-template-columns:minmax(0,400px) minmax(0,440px);justify-content:space-between;gap:64px;padding-top:64px;padding-bottom:96px}
.gsi{font-family:'Roboto',system-ui,sans-serif;font-weight:500;font-size:15px;min-height:48px;padding:0 16px;border-radius:6px;border:1px solid #747775;background:#FFFFFF;color:#1F1F1F;display:flex;align-items:center;justify-content:center;gap:16px;cursor:pointer}
.gsi:hover{background:#F8FAFF}
@container (max-width: 860px){.signin{grid-template-columns:minmax(0,1fr);gap:48px;padding-top:32px}}"""

signin_body = public_header() + f'''
  <main class="container signin">
    <div style="display: flex; flex-direction: column; gap: 24px">
      <a href="/start/preview" class="btn btn-ghost" style="align-self: flex-start; margin-left: -16px">{back_icon}Your roadmap preview</a>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <h1 class="t-title">Save your roadmap</h1>
        <p class="muted">Sign in to tick tasks off, pick up where you left off on any device, and ask about any task.</p>
      </div>
      <button class="gsi">{GOOGLE_G}Continue with Google</button>
      <p class="t-small muted">LandedNZ gets your name and email from Google, nothing else. By continuing you agree to the <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.</p>
    </div>

    <aside aria-labelledby="saving" style="padding: 32px; border-radius: 10px; background: #F6F8F8; display: flex; flex-direction: column; gap: 16px; align-self: start">
      <div style="display: flex; flex-direction: column; gap: 4px">
        <h2 id="saving" class="t-section">What you're saving</h2>
        <p class="t-small muted">Accredited Employer Work Visa, Auckland, just you, technology, landing 14 January 2027</p>
      </div>
      <ol class="legs" style="padding-top: 8px">
        <li class="leg"><div class="leg-head"><span class="rail" aria-hidden="true"><span style="width: 16px; height: 16px; border-radius: 50%; box-sizing: border-box; background: #FFFFFF; border: 2px solid #0F2A3A"></span></span><div><span class="t-strong">Research Auckland suburbs</span><span class="t-small muted">First, 4 to 6 weeks before you leave</span></div></div></li>
        <li class="leg"><div class="leg-head"><span class="rail" aria-hidden="true"><span style="width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #7A8F99"></span></span><div><span>Book temporary accommodation</span></div></div></li>
        <li class="leg collapsed"><div class="leg-head"><span class="rail" aria-hidden="true"><span style="width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; background: #F6F8F8; border: 1.5px dashed #7A8F99"></span></span><div><span class="muted">18 more tasks, in the order they unlock</span></div></div></li>
      </ol>
    </aside>
  </main>'''

roboto = '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&amp;display=swap" rel="stylesheet">'
signin_page = page('Sign in to save your roadmap', signin_body, extra_css=ROUTE_CSS + '\n.legs > li{padding-bottom:0}\n' + signin_css, h=900)
signin_page = signin_page.replace('</style>\n</helmet>', '</style>\n' + roboto + '\n</helmet>', 1)
open(OUT + 'SignIn.dc.html', 'w').write(signin_page)
open(OUT + 'SignInPhone.dc.html', 'w').write(phone('Sign in on a phone', 'SignIn', 1000))

# ---------- Onboarding ----------
onb_css = """.opt{display:flex;gap:16px;align-items:center;min-height:48px;padding:8px 16px;border-radius:6px;border:1px solid #D5DFE2;background:#FFFFFF;cursor:pointer;box-sizing:border-box}
.opt:hover{background:#F6F8F8}
.opt.on{border-color:#0E7C7B;box-shadow:inset 0 0 0 1px #0E7C7B;background:#F6F8F8}
.opt input{margin:0;width:16px;height:16px;accent-color:#0E7C7B}
.save-bar{position:sticky;bottom:0;background:#FFFFFF;border-top:1px solid #E3E8EA}
.legs > li:last-child{background-size:2px 22px}
@container (max-width: 560px){.save-bar .btn{width:100%}}"""

step_bar = '''<div role="progressbar" aria-label="Question" aria-valuemin="1" aria-valuemax="5" aria-valuenow="{{step}}" style="height: 2px"><div style="height: 2px; background: #0E7C7B; width: {{pct}}"></div></div>'''

onb_body = public_header('<span class="t-small muted">{{headerRight}}</span>') + step_bar + f'''
  <sc-if value="{{{{asking}}}}" hint-placeholder-val="{{{{true}}}}">
    <main class="container" style="max-width: 608px; padding-top: 48px; padding-bottom: 96px; display: flex; flex-direction: column; gap: 32px">
      <div>
        <sc-if value="{{{{canBack}}}}" hint-placeholder-val="{{{{false}}}}"><button onClick="{{{{back}}}}" class="btn btn-ghost" style="margin-left: -16px">{back_icon}Back</button></sc-if>
        <sc-if value="{{{{isFirst}}}}" hint-placeholder-val="{{{{true}}}}"><a href="/" class="btn btn-ghost" style="margin-left: -16px">{back_icon}Home</a></sc-if>
      </div>
      <div style="display: flex; flex-direction: column; gap: 32px">
        <fieldset style="margin: 0; padding: 0; border: 0; display: flex; flex-direction: column; gap: 8px; min-width: 0">
          <legend style="padding: 0 0 16px"><h1 class="t-title">{{{{q.title}}}}</h1></legend>
          <sc-if value="{{{{q.isChoice}}}}" hint-placeholder-val="{{{{true}}}}">
            <sc-for list="{{{{q.options}}}}" as="o" hint-placeholder-count="4">
              <label class="opt {{{{o.cls}}}}">
                <input type="radio" name="{{{{q.key}}}}" checked="{{{{o.checked}}}}" onChange="{{{{o.pick}}}}">
                <span>{{{{o.label}}}}</span>
              </label>
            </sc-for>
          </sc-if>
          <sc-if value="{{{{q.isDate}}}}" hint-placeholder-val="{{{{false}}}}">
            <label for="arrival" class="t-strong">Arrival date</label>
            <input id="arrival" name="arrival" type="date" class="field" value="{{{{arrival}}}}" onChange="{{{{setArrival}}}}" style="max-width: 280px">
            <span class="t-small muted">Already here? Enter the day you arrived.</span>
          </sc-if>
        </fieldset>
        <button type="button" onClick="{{{{next}}}}" disabled="{{{{cannotContinue}}}}" class="btn btn-primary btn-lg" style="align-self: flex-start">{{{{continueLabel}}}}</button>
      </div>
    </main>
  </sc-if>

  <sc-if value="{{{{previewing}}}}" hint-placeholder-val="{{{{false}}}}">
    <main class="container" style="max-width: 768px; padding-top: 48px; padding-bottom: 64px; display: flex; flex-direction: column; gap: 32px">
      <div style="display: flex; flex-direction: column; gap: 8px">
        <h1 class="t-title">Your roadmap is ready</h1>
        <p class="muted">{{{{summary}}}}. <button onClick="{{{{restart}}}}" class="t-strong" style="font: inherit; font-weight: 500; padding: 0; border: 0; background: transparent; color: #0A6463; cursor: pointer; text-decoration: underline">Change my answers</button></p>
      </div>
      <ol class="legs" aria-label="Your roadmap">
        <sc-for list="{{{{legs}}}}" as="L" hint-placeholder-count="4">
          <li class="leg">
            <div class="leg-head">
              <span class="rail" aria-hidden="true"><span style="{{{{L.dot}}}}"></span></span>
              <div><h2 style="font-size: 15px; font-weight: 600">{{{{L.name}}}}</h2><span class="t-small muted">{{{{L.meta}}}}</span></div>
            </div>
            <ol class="tasks">
              <sc-for list="{{{{L.tasks}}}}" as="t" hint-placeholder-count="3">
                <li class="task">
                  <span class="rail" aria-hidden="true"><span style="{{{{t.dot}}}}"></span></span>
                  <div class="row" style="cursor: default; background: transparent"><span style="flex: 1 1 240px; font-weight: {{{{t.weight}}}}">{{{{t.name}}}}</span><span class="t-small muted">{{{{t.meta}}}}</span></div>
                </li>
              </sc-for>
            </ol>
          </li>
        </sc-for>
      </ol>
    </main>
    <div class="save-bar">
      <div class="container" style="max-width: 768px; min-height: 80px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding-top: 16px; padding-bottom: 16px">
        <span>Save it to tick tasks off and ask questions.</span>
        <a href="/signin" class="btn btn-primary btn-lg">Save my roadmap</a>
      </div>
    </div>
  </sc-if>'''

onb_script = r'''class Component extends DCLogic {
  constructor(props) {
    super(props);
    const preview = props.scenario === 'preview';
    this.state = preview
      ? { step: 6, answers: { visa: 'AEWV', city: 'AUCKLAND', family: 'SOLO', work: 'TECHNOLOGY' }, arrival: '2027-01-14' }
      : { step: 1, answers: {}, arrival: '2027-01-14' };
  }
  questions() {
    return [
      { key: 'visa', title: 'What visa are you coming on?', options: [
        ['AEWV', 'Accredited Employer Work Visa (AEWV)'], ['GREEN_LIST_WORK', 'Green List, work to residence'],
        ['GREEN_LIST_RESIDENCE', 'Green List, straight to residence'], ['PARTNER_OF_STUDENT', 'Partner of a student'], ['OTHER', 'Something else']] },
      { key: 'city', title: 'Where will you live?', options: [
        ['AUCKLAND', 'Auckland'], ['WELLINGTON', 'Wellington'], ['CHRISTCHURCH', 'Christchurch'], ['OTHER', 'Somewhere else']] },
      { key: 'family', title: "Who's moving with you?", options: [
        ['SOLO', 'Just me'], ['COUPLE_DUAL_WORK', 'My partner, and we both work'],
        ['COUPLE_CONSTRAINED', "My partner, who can't work yet"], ['FAMILY_WITH_CHILDREN', 'My partner and our children']] },
      { key: 'work', title: 'What work do you do?', options: [
        ['TECHNOLOGY', 'Technology'], ['HEALTHCARE', 'Healthcare'], ['EDUCATION', 'Education'], ['FINANCE', 'Finance'],
        ['TRADES', 'Trades'], ['OTHER_PROFESSIONAL', 'Another profession'], ['SEEKING_WORK', "I'm still looking for work"]] },
      { key: 'arrival', title: 'When do you land?', date: true }
    ];
  }
  renderVals() {
    const { step, answers, arrival } = this.state;
    const qs = this.questions();
    const q = qs[step - 1];
    let qv = {};
    if (q) {
      qv = { title: q.title, key: q.key, isChoice: !q.date, isDate: !!q.date, options: (q.options || []).map(([value, label]) => {
        const checked = answers[q.key] === value;
        return { label, checked, cls: checked ? 'on' : '', pick: () => this.setState({ answers: { ...answers, [q.key]: value } }) };
      }) };
    }
    const chosen = q && (q.date ? !!arrival : !!answers[q.key]);
    const label = (key) => { const o = qs.find((x) => x.key === key).options.find((x) => x[0] === answers[key]); return o ? o[1] : ''; };
    const short = { SOLO: 'just you', COUPLE_DUAL_WORK: 'you and your partner, both working', COUPLE_CONSTRAINED: 'you and your partner', FAMILY_WITH_CHILDREN: 'you, your partner and your children' };
    const landing = new Date(arrival + 'T00:00:00');
    const landText = isNaN(landing) ? '' : landing.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
    const city = answers.city && answers.city !== 'OTHER' ? label('city') : '';

    const ring = 'width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; background: #FFFFFF; ';
    const open = ring + 'border: 1.5px solid #7A8F99';
    const first = ring + 'width: 16px; height: 16px; border: 2px solid #0F2A3A';
    const t = (name, meta, isFirst) => ({ name, meta: meta || '', dot: isFirst ? first : open, weight: isFirst ? 600 : 400 });
    // task names and order from the KB (T01–T10); later legs fold into one row
    const legs = [
      { name: 'Before you fly', meta: '5 tasks', dot: open, tasks: [
        t(city ? 'Research ' + city + ' suburbs' : 'Research suburbs where you will live', 'First, 4 to 6 weeks before you leave', true),
        t('Book temporary accommodation', 'After your suburb research'), t('Prepare your overseas bank account'), t('Insure your move'), t('Sort your home-country tax')] },
      { name: 'Arrival', meta: '2 tasks', dot: open, tasks: [t('Get an NZ SIM card', 'Day 1'), t('Open a bank account', 'Day 1 or 2, in a branch')] },
      { name: 'Week 1', meta: '3 tasks', dot: open, tasks: [t('Apply for your IRD number', 'Before your first payday'), t('Give your employer a tax code (IR330)', 'After your IRD number'), t('Choose your KiwiSaver fund', 'With your IR330')] },
      { name: 'Month 1 and later', meta: (answers.family === 'SOLO' ? 10 : 11) + ' tasks: renting, a GP, ACC, your rights as a tenant and more', dot: ring + 'border: 1.5px dashed #7A8F99', tasks: [] }
    ];

    return {
      asking: step <= 5, previewing: step > 5, step, pct: Math.round((Math.min(step, 5) / 5) * 100) + '%',
      headerRight: step <= 5 ? 'Step ' + step + ' of 5' : '',
      q: qv, canBack: step > 1, isFirst: step === 1,
      cannotContinue: !chosen, continueLabel: step === 5 ? 'See my roadmap' : 'Continue',
      arrival, setArrival: (e) => this.setState({ arrival: e.target.value }),
      next: () => { if (chosen) this.setState({ step: step + 1 }); },
      back: () => this.setState({ step: step - 1 }),
      restart: () => this.setState({ step: 1 }),
      summary: [label('visa'), label('city'), short[answers.family] || '', (label('work') || '').toLowerCase(), landText ? 'landing ' + landText : ''].filter(Boolean).join(', ').replace(/^./, (c) => c.toUpperCase()),
      legs
    };
  }
}'''

onb_props = '"scenario":{"editor":"enum","options":["questions","preview"],"default":"questions"}'
open(OUT + 'Onboarding.dc.html', 'w').write(page('Build your roadmap', onb_body, onb_script, props=onb_props, extra_css=ROUTE_CSS + '\n' + onb_css, h=900))
open(OUT + 'OnboardingPhone.dc.html', 'w').write(phone('Onboarding on a phone', 'Onboarding', 844))
open(OUT + 'OnboardingPreview.dc.html', 'w').write(frame('Roadmap preview', 'Onboarding', ' scenario="preview"', 900))
open(OUT + 'OnboardingPreviewPhone.dc.html', 'w').write(phone('Roadmap preview on a phone', 'Onboarding', 1340, ' scenario="preview"'))
print('ok')
