import sys
sys.path.insert(0, '.')
from ui_parts import page, app_header, phone

OUT = './'  

css = """.grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:64px;align-items:start}
.route{display:flex;gap:24px;margin:0;padding:0;list-style:none}
.leg{min-width:0;display:flex;flex-direction:column;gap:16px}
.track{height:16px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(#E3E8EA,#E3E8EA) center/100% 2px no-repeat}
.track.done{background-image:linear-gradient(#0E7C7B,#0E7C7B)}
.leg-label{display:flex;flex-direction:column;white-space:nowrap}
@container (max-width: 860px){.grid{grid-template-columns:minmax(0,1fr);gap:48px}}
@container (max-width: 560px){.route{gap:8px}.leg-label{display:none}.leg.now .leg-label{display:flex;white-space:nowrap}.start{width:100%}.journey{padding:16px !important}.track > span{width:8px !important;height:8px !important}.track > span.is-now{width:12px !important;height:12px !important}}"""

body = app_header('home') + '''
  <main class="container" style="padding-top: 48px; padding-bottom: 96px; display: flex; flex-direction: column; gap: 48px">

    <section aria-labelledby="hello" style="display: flex; flex-direction: column; gap: 8px">
      <h1 id="hello" class="t-title">{{greeting}}</h1>
      <p class="muted" style="max-width: 640px">{{subline}}</p>
    </section>

    <section aria-labelledby="journey" class="hairline journey" style="padding: 32px; display: flex; flex-direction: column; gap: 24px">
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px">
        <h2 id="journey" class="t-section">Your roadmap</h2>
        <span class="t-small muted">{{doneCount}} of {{total}} tasks done</span>
      </div>
      <ol class="route">
        <sc-for list="{{phases}}" as="p" hint-placeholder-count="5">
          <li class="leg {{p.cls}}" style="flex: {{p.total}} 1 0">
            <div class="track {{p.trackCls}}" aria-hidden="true">
              <sc-for list="{{p.dots}}" as="d" hint-placeholder-count="3"><span class="{{d.cls}}" style="{{d.css}}"></span></sc-for>
            </div>
            <div class="leg-label t-small">
              <span class="t-strong" style="color: {{p.ink}}">{{p.name}}</span>
              <span class="muted">{{p.count}}</span><span class="muted">{{p.when}}</span>
            </div>
            <span class="sr">{{p.name}}: {{p.count}} done</span>
          </li>
        </sc-for>
      </ol>
    </section>

    <div class="grid">
      <div style="display: flex; flex-direction: column; gap: 48px; min-width: 0">
        <section aria-labelledby="week" style="display: flex; flex-direction: column; gap: 16px">
          <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 16px">
            <h2 id="week" class="t-section">{{weekTitle}}</h2>
          </div>
          <ol class="hairline" style="margin: 0; padding: 0; list-style: none; overflow: hidden">
            <li class="top-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding: 24px; border-bottom: 1px solid #E3E8EA">
              <span aria-hidden="true" style="flex: none; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #0F2A3A; box-sizing: border-box"></span>
              <div style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 4px">
                <span style="font-weight: 600">{{top.name}}</span>
                <span class="muted">{{top.why}}</span>
              </div>
              <span class="t-small muted hide-sm">{{top.time}}</span>
              <a href="/app/tasks/next" class="btn btn-primary start">Start<span class="sr">: {{top.name}}</span></a>
            </li>
            <sc-for list="{{week}}" as="t" hint-placeholder-count="2">
              <li style="border-bottom: 1px solid #E3E8EA"><a href="/app/tasks/x" class="row-link">
                <span aria-hidden="true" style="flex: none; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #7A8F99; box-sizing: border-box"></span>
                <span style="flex: 1; min-width: 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; column-gap: 16px; row-gap: 4px"><span class="t-strong" style="flex: 1 1 220px">{{t.name}}</span><span class="t-small muted">{{t.meta}}</span></span>
              </a></li>
            </sc-for>
            <li class="t-small muted" style="padding: 16px 24px; background: #F6F8F8">{{nextLine}}</li>
          </ol>
        </section>

        <section aria-labelledby="done" style="display: flex; flex-direction: column; gap: 16px">
          <h2 id="done" class="t-section">Recently done</h2>
          <sc-if value="{{firstUse}}" hint-placeholder-val="{{false}}">
            <p class="muted">Nothing yet. Tasks you finish show up here with the day you did them. Already done some? Tick them off on your Roadmap.</p>
          </sc-if>
          <sc-if value="{{hasDone}}" hint-placeholder-val="{{true}}">
            <ul style="margin: 0; padding: 0; list-style: none">
              <sc-for list="{{doneList}}" as="d" hint-placeholder-count="3">
                <li style="display: flex; align-items: center; gap: 16px; padding: 16px 0; border-top: 1px solid #E3E8EA">
                  <span aria-hidden="true" style="flex: none; width: 12px; height: 12px; border-radius: 50%; background: #0E7C7B"></span>
                  <span style="flex: 1; min-width: 0">{{d.name}}</span>
                  <span class="t-small muted">{{d.when}}</span>
                </li>
              </sc-for>
            </ul>
          </sc-if>
        </section>
      </div>

      <aside aria-labelledby="plan" style="display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; justify-content: space-between; align-items: baseline"><h2 id="plan" class="t-section">Your plan</h2><a href="/settings" class="t-small t-strong">Edit</a></div>
        <p class="t-small muted">Your roadmap is built from these answers.</p>
        <dl style="margin: 0">
          <sc-for list="{{plan}}" as="p" hint-placeholder-count="4">
            <div style="display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; border-top: 1px solid #E3E8EA"><dt class="muted">{{p.k}}</dt><dd class="t-strong" style="margin: 0; text-align: right">{{p.v}}</dd></div>
          </sc-for>
        </dl>
      </aside>
    </div>
  </main>'''

script = '''class Component extends DCLogic {
  renderVals() {
    const firstUse = !!this.props.firstUse;
    // arrived 21 Oct 2026; today is day 3. Phase totals follow the KB: 5 before, 2 arrival, 3 week 1, 4 month 1, 7 later.
    const ring = 'flex: none; width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; ';
    const dot = { done: ring + 'background: #0E7C7B', now: ring + 'width: 16px; height: 16px; background: #FFFFFF; border: 2px solid #0F2A3A', todo: ring + 'background: #FFFFFF; border: 1.5px solid #7A8F99' };
    // done tasks, then (in the current phase) the next task ringed, then the rest open
    const phase = (name, when, done, total, now) => ({
      name, when, total, count: done + ' of ' + total,
      dots: Array.from({ length: total }, (_, i) => i < done ? { css: dot.done, cls: '' } : (now && i === done ? { css: dot.now, cls: 'is-now' } : { css: dot.todo, cls: '' })),
      cls: now ? 'now' : '', trackCls: done === total ? 'done' : '', ink: now ? '#0F2A3A' : '#4B6170'
    });
    const phases = firstUse ? [
      phase('Before you flew', 'before 21 Oct', 0, 5), phase('Arrival', '21 to 22 Oct', 0, 2, true), phase('Week 1', 'to 28 Oct', 0, 3), phase('Month 1', 'to 20 Nov', 0, 4), phase('Later', 'from month 2', 0, 6)
    ] : [
      phase('Before you flew', 'before 21 Oct', 5, 5), phase('Arrival', '21 to 22 Oct', 2, 2), phase('Week 1', 'to 28 Oct', 0, 3, true), phase('Month 1', 'to 20 Nov', 0, 4), phase('Later', 'from month 2', 0, 6)
    ];
    return {
      firstUse, day: 3, total: 20, doneCount: firstUse ? 0 : 7,
      greeting: firstUse ? 'Welcome to Auckland, Priya' : 'Good afternoon, Priya',
      subline: firstUse
        ? 'Start with the first task below. Each one you finish unlocks the next.'
        : 'Day 3 in Auckland, and the basics are sorted.',
      phases,
      weekTitle: firstUse ? 'Start here' : 'This week',
      top: firstUse
        ? { name: 'Get an NZ SIM card', why: 'Your bank, your employer and government sites need an NZ number.', time: '15–30 min' }
        : { name: 'Apply for your IRD number', why: 'Your employer needs it before your first payday.', time: '20–30 min' },
      week: firstUse ? [
        { name: 'Open a bank account', meta: 'In a branch, 45–90 min' },
        { name: 'Apply for your IRD number', meta: 'After your bank account' }
      ] : [
        { name: 'Give your employer a tax code (IR330)', meta: 'After your IRD number' },
        { name: 'Choose your KiwiSaver fund', meta: 'With your IR330' }
      ],
      nextLine: 'Month 1 brings a rental, a GP, ACC and your rights as a tenant.',
      hasDone: !firstUse,
      doneList: [
        { name: 'Opened a bank account', when: '22 Oct' },
        { name: 'Got an NZ SIM card', when: '21 Oct' }
      ],
      plan: [
        { k: 'Visa', v: 'Accredited Employer Work Visa' },
        { k: 'City', v: 'Auckland' },
        { k: 'Moving', v: 'On your own' },
        { k: 'Work', v: 'Technology' }
      ]
    };
  }
}'''

open(OUT + 'Home.dc.html', 'w').write(page('Home', body, script, props='"firstUse":{"editor":"boolean","default":false}', extra_css=css, h=1000))
print('ok')
open(OUT + 'HomePhone.dc.html', 'w').write(phone('Home on a phone', 'Home', 1640))
