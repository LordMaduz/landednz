# Shared system for every LandedNZ board (Precise: Geist, hairlines, 6/10 radii).
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;display=swap" rel="stylesheet">'

CSS = """body{margin:0}
.ui{font-family:'Geist',system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#0F2A3A;background:#FFFFFF;font-feature-settings:'tnum' 1;-webkit-font-smoothing:antialiased}
.ui h1,.ui h2,.ui h3,.ui p{margin:0}
.ui h1,.ui h2{text-wrap:balance}
.t-hero{font-size:48px;line-height:1.05;font-weight:600;letter-spacing:-0.03em}
.t-title{font-size:32px;line-height:1.15;font-weight:600;letter-spacing:-0.025em}
.t-section{font-size:20px;line-height:1.3;font-weight:600;letter-spacing:-0.01em}
.t-small{font-size:13px;line-height:1.45}
.t-strong{font-weight:500}
.muted{color:#4B6170}
.ui a{color:#0A6463;text-decoration:none}.ui a:hover{color:#074B4A;text-decoration:underline}
.ui :focus-visible{outline:2px solid #0E7C7B;outline-offset:2px}
.btn{font:inherit;font-weight:500;min-height:44px;padding:0 16px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;white-space:nowrap;box-sizing:border-box}
.ui a.btn{text-decoration:none}
.btn-lg{min-height:48px;padding:0 24px}
.btn-primary{background:#0F2A3A;color:#FFFFFF;border:1px solid #0F2A3A}.ui a.btn-primary{color:#FFFFFF}.btn-primary:hover{background:#24465A}
.btn-quiet{background:#FFFFFF;color:#0F2A3A;border:1px solid #D5DFE2}.ui a.btn-quiet{color:#0F2A3A}.btn-quiet:hover{background:#F6F8F8}
.btn-ghost{background:transparent;color:#0F2A3A;border:1px solid transparent}.ui a.btn-ghost{color:#0F2A3A}.btn-ghost:hover{background:#F6F8F8}
.btn:disabled{background:#F6F8F8;color:#4B6170;border-color:#F6F8F8;cursor:default}
.field{font:inherit;min-height:44px;padding:0 16px;border-radius:6px;border:1px solid #7A8F99;background:#FFFFFF;color:#0F2A3A;box-sizing:border-box}
.field::placeholder{color:#4B6170}
.kbd{font-size:13px;color:#4B6170;border:1px solid #E3E8EA;border-radius:4px;padding:0 4px;line-height:20px}
.nav a{color:#4B6170;font-weight:500;padding:8px 16px;border-radius:6px}
.nav a:hover{color:#0F2A3A;background:#F6F8F8;text-decoration:none}
.nav a[aria-current="page"]{color:#0F2A3A;background:#F6F8F8}
.hairline{border:1px solid #E3E8EA;border-radius:10px}
.row-link{display:flex;align-items:center;gap:16px;padding:16px 24px}.ui a.row-link{color:#0F2A3A;text-decoration:none}.row-link:hover{background:#F6F8F8}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.container{max-width:1120px;margin:0 auto;box-sizing:border-box;padding-left:24px;padding-right:24px}
.ai{padding:1px;border-radius:10px;background:linear-gradient(90deg,#3FC79A,#5AAED6,#8B78F0,#5AAED6,#3FC79A)}
.ai > div{border-radius:9px;background:#FFFFFF;padding:16px;display:flex;flex-direction:column;gap:8px}
.streaming{background-size:200% 100%;animation:aurora 3s linear infinite}
@keyframes aurora{from{background-position:0% 50%}to{background-position:200% 50%}}
@media (prefers-reduced-motion: reduce){.streaming{animation:none}}
@container (max-width: 760px){.hide-sm{display:none !important}.t-hero{font-size:32px;line-height:1.15}.hdr{gap:8px !important}.hdr .wordmark{display:none}.nav a{padding:8px}}"""

LOGO = ('<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">'
        '<rect width="24" height="24" rx="6" fill="#0F2A3A"/>'
        '<path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>'
        '<path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round"/>'
        '<circle cx="16.5" cy="7.5" r="2" fill="#3FC9B7"/></svg>')

def brand(href):
    return (f'<a href="{href}" aria-label="LandedNZ home" style="display: flex; align-items: center; gap: 8px; color: #0F2A3A; text-decoration: none">'
            f'{LOGO}<span class="wordmark" style="font-weight: 600; letter-spacing: -0.01em">LandedNZ</span></a>')

def public_header(right=''):
    return f'''<header style="border-bottom: 1px solid #E3E8EA">
    <div class="container" style="height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px">
      {brand('/')}
      {right}
    </div>
  </header>'''

def app_header(active, ask_click='', ask_attrs=''):
    cur = lambda k: ' aria-current="page"' if k == active else ''
    click = f' onClick="{ask_click}"' if ask_click else ''
    return f'''<header style="border-bottom: 1px solid #E3E8EA">
    <div class="container hdr" style="height: 64px; display: flex; align-items: center; gap: 32px">
      {brand('/app')}
      <nav class="nav" aria-label="Main" style="display: flex; gap: 4px">
        <a href="/app"{cur('home')}>Home</a>
        <a href="/app/roadmap"{cur('roadmap')}>Roadmap</a>
      </nav>
      <div style="margin-left: auto; display: flex; align-items: center; gap: 8px">
        <button class="btn btn-quiet" aria-keyshortcuts="/"{click}{ask_attrs}>Ask<span class="kbd hide-sm" aria-hidden="true">/</span></button>
        <button aria-haspopup="menu" aria-label="Account, Priya Sharma" style="font: inherit; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer">
          <span aria-hidden="true" style="width: 32px; height: 32px; border-radius: 50%; background: #E8F2F1; color: #0A6463; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center">PS</span>
        </button>
      </div>
    </div>
  </header>'''

def page(title, body, script='class Component extends DCLogic {\n  renderVals() { return {}; }\n}', props='', extra_css='', w=1440, h=900):
    p = props + (',' if props else '') + f'"$preview":{{"width":{w},"height":{h}}}'
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
{CSS}
{extra_css}
</style>
</helmet>
<div class="ui" style="container-type: inline-size; min-height: {h}px">
  {body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{{p}}}'>
{script}
</script>
</body>
</html>
'''

def phone(title, name, h, attrs=''):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>body{{margin:0}}</style>
</helmet>
<div style="width: 390px; background: #FFFFFF">
  <dc-import name="{name}"{attrs} hint-size="390px,{h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

def frame(title, name, attrs, h):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>body{{margin:0}}</style>
</helmet>
<div style="background: #FFFFFF">
  <dc-import name="{name}"{attrs} hint-size="100%,{h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1440,"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

# route waypoint dots (12 px), shared by roadmap, onboarding preview and landing
RING = 'width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; '
DOTS_JS = """const ring = 'width: 12px; height: 12px; border-radius: 50%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; ';
    const dots = {
      done: ring + 'background: #0E7C7B',
      current: ring + 'border: 2px solid #0F2A3A',
      blocked: ring + 'border: 1.5px solid #7A8F99',
      available: ring + 'border: 1.5px solid #7A8F99',
      locked: ring + 'border: 1.5px dashed #7A8F99'
    };"""

# route rail shared by Roadmap and the onboarding preview (leg = phase, task rows hang off one vertical line)
ROUTE_CSS = """.legs,.tasks{margin:0;padding:0;list-style:none}
.legs > li{padding-bottom:24px;background:linear-gradient(var(--line),var(--line)) 7px 0/2px 100% no-repeat}
.legs > li:last-child.collapsed{background-size:2px 22px}
.legs > li:last-child{padding-bottom:0}
.leg-head,.task{display:grid;grid-template-columns:16px minmax(0,1fr);column-gap:16px}
.leg{--line:#E3E8EA}.leg.done{--line:#0E7C7B}
.leg-head > div{display:flex;flex-wrap:wrap;align-items:center;column-gap:16px;min-height:44px}
.rail{height:44px;display:flex;align-items:center;justify-content:center}
.row{font:inherit;box-sizing:border-box;width:100%;min-height:44px;text-align:left;padding:8px;border:0;border-radius:6px;background:transparent;color:#0F2A3A;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;column-gap:16px;cursor:pointer}
.row:hover,.row[aria-current="true"]{background:#F6F8F8}"""

def public_footer():
    return '''<footer style="border-top: 1px solid #E3E8EA">
    <div class="container" style="min-height: 64px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; column-gap: 24px; row-gap: 8px; padding-top: 16px; padding-bottom: 16px">
      <span class="t-small muted">General information, not legal or tax advice.</span>
      <nav aria-label="Legal" class="t-small" style="display: flex; gap: 24px"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
    </div>
  </footer>'''
