# Shark.Bet: Bet Like a Shark

A free sharp-betting toolkit, odds-intelligence board, betting academy and free-to-play contest hub.

It's a static HTML/CSS/vanilla-JS site with no backend and no build dependencies beyond Python. It is hosted free on **GitHub Pages**.

> The strategy, 30-site benchmark and phase-wise build prompt are in [`BLUEPRINT.md`](BLUEPRINT.md).

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Hero, quick odds converter, feature grid, lead capture, sharp signals, contests, videos, FAQ |
| `tools.html` | 9 live calculators: converter, parlay, hedge, arbitrage, EV, Kelly, no-vig, round robin, bankroll |
| `odds.html` | Odds board (best price highlighted), tickets vs money, sharp-signal flags, line-movement chart |
| `learn.html` | Academy tracks, filterable lessons, strategy pillars, searchable 43-term glossary |
| `videos.html` | YouTube video hub (lite facades), topic requests, creator recruiting |
| `contests.html` | Free weekly pick'em, Streak Survivor, season leaderboard, office pools, sponsor CTA, official rules |
| `join.html` | **Main lead-gen page**: 3-step Starter Kit funnel and bettor-type quiz that ends in lead capture |
| `offers.html` | Affiliate offers and operator partner application (**no AdSense** on this page, per policy) |
| `support.html` | Donations (PayPal), supporter tiers, allocation transparency, pledge/sponsorship form |
| `partners.html` | Advertising/media kit form, contest sponsorship, careers and application form |
| `about`, `contact`, `responsible-gambling`, `privacy`, `terms`, `404` | Trust & legal |

Every page has these built in:

- The "Contact, if you are interested in this website/domain name" top bar, linking to https://web.works/contact
- A 21+ age gate
- A cookie bar
- An exit-intent lead modal
- A dark/light theme toggle
- SEO meta, Open Graph tags and JSON-LD

## Editing

- **Page content:** edit `src/pages/*.html`, then run `python3 build.py`. This regenerates the root HTML files and `sitemap.xml`.
- **Settings:** `assets/js/config.js` holds the AdSense publisher ID, currency and YouTube link. Config changes need no rebuild.
- **Content data:** `assets/js/data.js` holds the odds, contest matchups, leaderboard, video IDs, lessons and glossary.

## Contact email: hidden by design

The contact address is **never written in plain text** anywhere on the site. It is stored encoded in `config.js` and assembled only at the moment a visitor submits a form, clicks "Email us", or donates.

- **Forms** post through FormSubmit's AJAX endpoint.
- **One-time step:** the first submission sends an activation email to the inbox. Click "Activate" once and every form goes live.
- **Donations** open PayPal's donate page for that account.

## Monetization switches

1. **AdSense:** set `adsenseClient: "ca-pub-…"` in `config.js`. Ad slots activate automatically. Also add your line to `ads.txt`.
2. **YouTube:** put video IDs into `SB_DATA.videos[].id`. Without an ID, a tile opens a YouTube search for its topic instead.
3. **Affiliate offers:** replace the partner cards in `src/pages/offers.html` with tracking links.

## Custom domain (shark.bet)

1. Add a file named `CNAME` containing `shark.bet`.
2. At your registrar, add A records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Add a CNAME record for `www` pointing to `webworksa1.github.io`.
3. In repo Settings → Pages, enable **Enforce HTTPS**.

## Hosting

GitHub Pages serves the site from `main` / root. It works on the free plan with a public repo.
