#!/usr/bin/env python3
"""Shark.Bet static site builder.

Wraps every page body in src/pages/*.html with the shared layout
(domain banner, header, footer, modals, SEO) and writes the result to the repo
root, which GitHub Pages serves as-is. Usage:  python3 build.py
Each page starts with a JSON header comment:  <!--{"title": "...", "desc": "..."}-->
"""
import json, re, pathlib, datetime

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src" / "pages"
SITE_URL = "https://shark.bet"
VERSION = datetime.date.today().strftime("%Y%m%d")

NAV = [
    ("tools.html", "Shark Tools"),
    ("odds.html", "Odds Lab"),
    ("learn.html", "Academy"),
    ("videos.html", "Videos"),
    ("contests.html", "Contests"),
    ("offers.html", "Offers"),
    ("support.html", "Support"),
    ("partners.html", "Partners"),
]

LOGO = ('<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">'
        '<stop offset="0" stop-color="#18d6c3"/><stop offset="1" stop-color="#0a6f86"/></linearGradient></defs>'
        '<rect width="40" height="40" rx="11" fill="url(#lg)"/>'
        '<path d="M6 28c6-1 10-4 13-17 3 8 7 13 15 17-9-2-19-2-28 0z" fill="#fff"/>'
        '<path d="M4 31c5 2 9 2 12 0s7-2 10 0 7 2 10 0" stroke="#ff6a3d" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>')

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#050d1a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Shark.Bet">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v={v}">
<script>document.documentElement.className+=' js';try{{var t=localStorage.getItem('sb-theme');if(t)document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}</script>
<script type="application/ld+json">{jsonld}</script>
</head>
<body{bodyattrs}>
<a class="skip" href="#main">Skip to content</a>
<div class="domain-bar" role="note"><a href="https://web.works/contact" target="_blank" rel="noopener">Contact, if you are interested in this website/domain name</a></div>
<header class="site-header">
  <nav class="container nav" aria-label="Main">
    <a class="logo" href="index.html" aria-label="Shark.Bet home">{logo}<span>Shark<b>.Bet</b></span></a>
    <ul class="menu">{menu}</ul>
    <div class="nav-cta">
      <button class="icon-btn" data-theme-toggle aria-label="Toggle light/dark theme">◐</button>
      <a class="btn btn-primary btn-sm btn-join" href="join.html">Join Free</a>
      <button class="icon-btn burger" aria-label="Open menu" aria-expanded="false">☰</button>
    </div>
  </nav>
</header>
<main id="main">
"""

FOOT = """</main>
<footer class="site-footer">
  <div class="container">
    <div class="foot-grid">
      <div>
        <a class="logo" href="index.html">{logo}<span>Shark<b>.Bet</b></span></a>
        <p class="muted small" style="margin-top:12px">Bet like a shark. Free sharp-betting tools, odds intelligence, education and free-to-play contests. We do not accept wagers.</p>
        <form class="inline-form" data-form="Footer newsletter" data-success="You're subscribed to the Shark Report.">
          <input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input type="email" name="email" required placeholder="Your email" aria-label="Email for newsletter">
          <button class="btn btn-teal" type="submit">Subscribe</button>
        </form>
      </div>
      <div><h4>Tools</h4><ul>
        <li><a href="tools.html#converter">Odds Converter</a></li><li><a href="tools.html#parlay">Parlay Calculator</a></li>
        <li><a href="tools.html#hedge">Hedge Calculator</a></li><li><a href="tools.html#arb">Arbitrage Calculator</a></li>
        <li><a href="tools.html#kelly">Kelly Criterion</a></li><li><a href="odds.html">Odds Lab</a></li></ul></div>
      <div><h4>Learn</h4><ul>
        <li><a href="learn.html">Shark Academy</a></li><li><a href="learn.html#glossary">Glossary</a></li>
        <li><a href="videos.html">Video Hub</a></li><li><a href="join.html#quiz">Bettor Quiz</a></li>
        <li><a href="responsible-gambling.html">Responsible Gambling</a></li></ul></div>
      <div><h4>Community</h4><ul>
        <li><a href="contests.html">Free Contests</a></li><li><a href="join.html">Shark Report</a></li>
        <li><a href="support.html">Support Us</a></li><li><a href="partners.html#careers">Careers</a></li>
        <li><a href="partners.html">Advertise</a></li></ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li>
        <li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li>
        <li><a href="https://web.works/contact" target="_blank" rel="noopener">Buy this domain</a></li></ul></div>
    </div>
    <div class="rg-note"><b>21+ only (18+/19+ where applicable).</b> Shark.Bet is an independent information and entertainment site. We do not accept wagers. Odds shown are for information and may change. Gambling involves risk; bet only what you can afford to lose. If you or someone you know has a gambling problem, call or text <b>1-800-GAMBLER</b> (US) or visit <a href="responsible-gambling.html">our Responsible Gambling page</a>. Some links may be affiliate links; we may earn a commission at no cost to you.</div>
    <div class="copyright"><span>© <span data-year></span> Shark.Bet · All rights reserved.</span><span><a href="https://web.works/contact" target="_blank" rel="noopener">Interested in this website/domain? Contact us</a></span></div>
  </div>
</footer>

<div class="modal" id="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-title">
  <div class="box center">
    <div style="width:64px;margin:0 auto 10px">{logo}</div>
    <h2 id="age-title" style="font-size:1.6rem">Are you of legal age?</h2>
    <p class="muted">Shark.Bet contains sports-betting information intended for adults 21+ (18+/19+ where legal). By entering you confirm you meet the legal age in your location.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-teal btn-lg" id="age-yes">Yes, I'm 21+</button>
      <button class="btn btn-ghost btn-lg" id="age-no">No</button>
    </div>
    <p class="small muted" style="margin-top:14px">Gambling problem? Call 1-800-GAMBLER.</p>
  </div>
</div>

<div class="modal" id="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
  <div class="box">
    <button class="close" aria-label="Close">×</button>
    <span class="badge orange">Before you go</span>
    <h2 id="exit-title" style="font-size:1.6rem;margin-top:10px">Grab the free Shark Starter Kit</h2>
    <ul class="checklist small"><li>Line-shopping checklist (save 2–4% per bet)</li><li>Bankroll & unit-sizing sheet</li><li>Weekly Shark Report: sharp signals & best prices</li></ul>
    <form data-form="Exit-intent lead" data-success="Check your inbox — your Starter Kit is on the way.">
      <input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="field"><input type="email" name="email" required placeholder="you@email.com" aria-label="Email"></div>
      <label class="check"><input type="checkbox" name="age_21" value="yes" required> I'm 21+ and agree to receive emails</label>
      <button class="btn btn-primary btn-block" type="submit" style="margin-top:12px">Send my free kit</button>
    </form>
  </div>
</div>

<div class="cookie" id="cookie" role="region" aria-label="Cookie consent">
  <span>We use cookies for analytics and ads (Google AdSense). <a href="privacy.html">Privacy</a></span>
  <span style="display:flex;gap:8px;flex:none"><button class="btn btn-ghost btn-sm" data-cookie="essential">Essential only</button><button class="btn btn-teal btn-sm" data-cookie="all">Accept all</button></span>
</div>

<script src="assets/js/config.js?v={v}"></script>
<script src="assets/js/data.js?v={v}"></script>
<script src="assets/js/main.js?v={v}"></script>
<script src="assets/js/tools.js?v={v}"></script>
<script src="assets/js/pages.js?v={v}"></script>
</body>
</html>
"""


def jsonld(meta, url):
    graph = [
        {"@type": "Organization", "@id": SITE_URL + "/#org", "name": "Shark.Bet", "url": SITE_URL + "/",
         "logo": SITE_URL + "/assets/img/favicon.svg"},
        {"@type": "WebSite", "@id": SITE_URL + "/#site", "name": "Shark.Bet", "url": SITE_URL + "/",
         "publisher": {"@id": SITE_URL + "/#org"}},
        {"@type": "WebPage", "name": meta["title"], "url": url, "description": meta["desc"]},
    ]
    if meta.get("faq"):
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in meta["faq"]]})
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, separators=(",", ":"))


def build():
    pages = sorted(SRC.glob("*.html"))
    urls = []
    for p in pages:
        raw = p.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(\{.*?\})-->\s*", raw, re.S)
        meta = json.loads(m.group(1)) if m else {}
        body = raw[m.end():] if m else raw
        meta.setdefault("title", "Shark.Bet")
        meta.setdefault("desc", "Bet like a shark — free sharp-betting tools, odds intelligence and contests.")
        name = p.name
        url = SITE_URL + "/" + ("" if name == "index.html" else name)
        menu = "".join(
            '<li><a href="{0}"{2}>{1}</a></li>'.format(h, t, ' aria-current="page"' if h == name else "") for h, t in NAV)
        menu += '<li class="mobile-only"><a href="join.html">Join Free</a></li>'
        attrs = ""
        if meta.get("noads"): attrs += " data-no-ads"
        if meta.get("noexit"): attrs += " data-no-exit"
        html = HEAD.format(title=meta["title"], desc=meta["desc"], url=url, site=SITE_URL, v=VERSION,
                           robots="noindex" if name == "404.html" else "index,follow",
                           jsonld=jsonld(meta, url), bodyattrs=attrs, logo=LOGO, menu=menu)
        html += body + FOOT.format(logo=LOGO, v=VERSION)
        (ROOT / name).write_text(html, encoding="utf-8")
        if name != "404.html":
            urls.append((url, meta.get("priority", "0.7")))
        print("built", name)
    today = datetime.date.today().isoformat()
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sm += ["  <url><loc>{}</loc><lastmod>{}</lastmod><priority>{}</priority></url>".format(u, today, pr) for u, pr in urls]
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    print("built sitemap.xml with", len(urls), "urls")


if __name__ == "__main__":
    build()
