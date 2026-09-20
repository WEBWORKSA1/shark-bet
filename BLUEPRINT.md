# Shark.Bet — Concept, Revenue Model & Phase-Wise Build Prompt

## 1. The verdict: what Shark.Bet should be

**Shark.Bet = "Bet like a shark." A free sharp-betting toolkit, academy and prediction-contest hub.**

In betting slang a *shark* (or *sharp*) is the disciplined, math-driven bettor the sportsbooks fear. The `.bet` TLD tells visitors the site is about betting before they arrive. The site doesn't take bets. It sells the edge: calculators, line intelligence, education and free-to-play contests. Everything funnels into three revenue engines.

### Ideas considered and rejected

| Idea | Why it loses |
|---|---|
| Shark Tank-style "bet on startups" pitch platform | `.bet` confuses the audience, investor-side leads are thin, and RPMs are low without a big media budget |
| Real-money sportsbook or casino | Needs a licence in every jurisdiction and seven-figure capital. Not a website play |
| Generic "free picks" blog | Crowded (Covers, Pickswise, Doc's). No moat and low trust |
| **Sharp-bettor toolkit + academy + free contests (chosen)** | Evergreen tool traffic, high affiliate CPA, email list, contest virality, and a clean split for AdSense |

### Why this wins, in numbers (industry-typical ranges, validate in your own dashboards)

- **Sportsbook affiliate CPA:** roughly US$100–$400 per first-time depositor in regulated US states, or 25–40% revenue share elsewhere. 1,000 email subscribers converting at 3% × $200 ≈ **$6,000**.
- **Calculators are evergreen SEO:** "parlay calculator", "odds converter", "hedge calculator", "kelly criterion calculator" and "arbitrage calculator" each draw thousands to tens of thousands of monthly searches, with no news cycle to chase.
- **AdSense:** gambling-*educational* content is not restricted. Pages that *enable* real-money gambling (promo codes, "Claim Bonus") fall under Google's Online Gambling publisher restriction outside the US, UK, CA, AU and other listed countries. **Design decision:** education and tools pages carry AdSense. The affiliate-offers page is isolated and carries no AdSense.
  Sources: https://support.google.com/publisherpolicies/answer/10437963 and https://support.google.com/adsense/answer/10437795
- **YouTube:** breakdowns of tools and strategy ("How to find +EV bets in 5 minutes") embedded on-site raise time-on-page and grow a second revenue stream (YPP + sponsors).
- **Donations and sponsorships:** "Feed the Shark" supporter tiers, plus contest prize sponsorship sold to books, DFS and prediction-market brands.

### Blunt risks

1. **Brand proximity:** OddsShark (now part of Covers) exists. "Shark" is generic betting slang, so the risk is low, but never use their marks, colours or "odds shark" phrasing.
2. **Contests must be free to enter** (no purchase necessary, void where prohibited). Otherwise they count as gambling.
3. **Compliance footer everywhere:** 21+ (18+/19+ where applicable), 1-800-GAMBLER, and an affiliate disclosure.
4. **The `.bet` TLD** may be filtered by some corporate firewalls. Irrelevant for consumer traffic.

## 2. Benchmark: 30 niche leaders studied

Action Network, Covers, Covers Contests, OddsShark, Unabated, OddsJam, Pinnacle Betting Resources, Sportsbook Review, VegasInsider, VSiN, Pickswise, BettingPros, Oddschecker, Betfair Hub, Outlier, Rithmm, Props.cash, Sports Insights, KillerSports, TeamRankings, Dimers, BetQL, Doc's Sports, Establish The Run, RotoGrinders, Legal Sports Report, TheLines, ESPN Betting, Bettingexpert, OddsPortal.

**Features adopted from them:**

- **Tools**
  - Odds comparison grid with the best price highlighted
  - Line-movement chart
  - Public tickets % vs money % ("sharp signal")
  - Consensus panel
  - Calculators: odds converter, implied probability, parlay, hedge, arbitrage, EV, Kelly, no-vig fair odds, round robin
- **Content**
  - Academy with levels
  - Glossary
  - Strategy library (CLV, EV, bankroll)
  - Sportsbook-review framework
  - Legal-state guide
- **Lead generation**
  - Email + state/region + 21+ checkbox (Pickswise)
  - A free-value hook with no card required (Doc's Sports)
  - A bettor-type quiz funnel
  - Partial "unlock" gating (VegasInsider)
  - Exit-intent offer (TheLines)
  - Social proof
  - A frequency promise: "One email a week"
- **Contests**
  - Free weekly pick'em
  - Streak survivor with a jackpot (Covers)
  - Season leaderboards
  - Private office pools
  - Sponsor-funded prizes
- **Trust**
  - Age gate
  - Responsible-gambling hotline and self-exclusion links
  - Affiliate disclosure
  - "We do not accept wagers"
  - Editorial policy

## 3. Phase-wise master prompt (copy and paste each phase into your AI builder)

> **Global rules for every phase:** Static HTML/CSS/vanilla JS only, hostable free on GitHub Pages (no server, relative links only). Mobile-first, responsive, WCAG AA, dark "deep-ocean" theme with a light mode, Core Web Vitals green. On every page, the first element is a top bar reading **"Contact, if you are interested in this website/domain name"**, linking to `https://web.works/contact`. The only contact email is kept encoded in JS and assembled only when a form submits or a "Email us" link is clicked. It is never shown as text and never appears in plain HTML.

### Phase 1 — Foundation & brand
Create the repo structure (`src/pages`, `assets/css`, `assets/js`, `build.py`) with a Python build step that wraps page bodies in a shared layout: meta, Open Graph, JSON-LD, domain banner, sticky header with mega-nav, and a footer with responsible-gambling notice. Brand: "Shark.Bet — Bet Like a Shark", with an ocean navy/teal/"blood-orange" accent palette, a shark-fin SVG logo, and Inter/Space Grotesk fonts. Add the age gate (21+/18+ confirm, remembered per browser), cookie-consent bar, favicon, manifest, robots.txt, sitemap.xml, ads.txt placeholder and 404 page.

### Phase 2 — Shark Tools (traffic engine)
Build `tools.html` with nine live calculators: odds converter (American/decimal/fractional/implied %), parlay, hedge, arbitrage (2-way), expected value, Kelly criterion (full/half/quarter), no-vig fair odds, round robin, and bankroll/unit sizer. Each gets a deep link (`#parlay`), a copy-result button, input validation and an explainer paragraph for SEO. Add FAQ schema.

### Phase 3 — Odds Lab (intelligence)
Build `odds.html` with a multi-book odds board (sample data from `data.js`, API-ready for The Odds API), best-price highlighting, an American/decimal toggle, a sport filter, a public tickets % vs money % bar with a "Sharp Signal" flag when the gap is ≥15 pts, and a line-movement canvas chart. Label demo data clearly.

### Phase 4 — Shark Academy (content & SEO)
Build `learn.html`: three course tracks (Guppy → Hammerhead → Great White) with lesson cards, a searchable/filterable glossary (40+ terms), strategy articles (CLV, EV, bankroll, line shopping, props) and a "sharp vs square" quiz. Add a YouTube video hub (`videos.html`) with lite facades (no iframe until clicked) that point to the channel or specific video IDs set in `data.js`.

### Phase 5 — Lead generation (conversion engine)
Build `join.html`: a hero offer ("Free Shark Starter Kit + weekly Shark Report"), a 3-step form (email → region + main sport + experience → 21+ consent), a bettor-type quiz that ends in lead capture, social proof, an FAQ and a "one email a week" promise. Add inline lead forms on the home, tools and learn pages, plus an exit-intent modal on desktop. All forms post through a JS form handler (FormSubmit AJAX endpoint built at runtime from the encoded email) with honeypot spam protection and success/error states.

### Phase 6 — Contests & prizes (virality)
Build `contests.html`: a free weekly pick'em with selectable matchups and a tiebreaker, Streak Survivor, a season leaderboard (sample), private office-pool request, official rules (no purchase necessary, eligibility, void where prohibited), a prize-sponsor application and a winners wall.

### Phase 7 — Monetization
- **AdSense:** responsive `<ins>` slots on education and tools pages only, auto-activated when the publisher ID is set in config, and none on `offers.html`.
- **`offers.html`:** affiliate sportsbook cards with "Claim offer" CTAs, geo notes, disclosures and a partner-application form.
- **`support.html`:** donations (PayPal donate URL built at click time), supporter tiers (Fin / Hammerhead / Great White), and allocation transparency (operations, promotion, talent, prizes).
- **`partners.html`:** advertise/sponsor, hiring (application form for writers, analysts, video editors, developers) and a media kit.

### Phase 8 — Trust, legal & launch
Add About (mission, editorial policy), Responsible Gambling (hotlines, self-exclusion, limit-setting tips), Privacy (AdSense/cookies disclosure) and Terms (no wagers accepted, no guarantees, contest rules link). Then run the pre-launch checks: Lighthouse, link audit, a mobile test and confirmation that the email appears nowhere in the rendered text. Deploy to GitHub Pages, submit the sitemap to Search Console and apply for AdSense once there are 20+ content pages.

### Phase 9 — Scale (post-launch)
- Live odds API
- User accounts (Supabase free tier) for contests and bet tracking
- Programmatic SEO pages per matchup and sportsbook review
- A weekly YouTube show
- Localized state guides
- A premium "Shark Pro" tier

## 4. Hosting & operations notes

- **GitHub Pages:** free plan with a public repo, served from the `main` branch root.
- **Custom domain:** add a `CNAME` file containing `shark.bet`, then point DNS A records to 185.199.108–111.153 (or a `www` CNAME to `webworksa1.github.io`).
- **Forms:** the first form submission triggers a one-time FormSubmit activation email. Confirm it once and every form goes live.
- **AdSense:** set `adsenseClient` in `assets/js/config.js`. **YouTube:** set video IDs in `assets/js/data.js`.
