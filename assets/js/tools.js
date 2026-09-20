/* Shark Tools — betting calculators */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Odds math */
  var O = window.SBOdds = {
    parse: function (v) { // accepts American (+150/-110), decimal (2.5) or fractional (3/2) → decimal
      v = String(v || "").trim(); if (!v) return NaN;
      if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(v)) { var p = v.split("/"); return 1 + parseFloat(p[0]) / parseFloat(p[1]); }
      var n = parseFloat(v); if (isNaN(n)) return NaN;
      if (/^[+-]/.test(v) || Math.abs(n) >= 100) { if (n >= 100) return 1 + n / 100; if (n <= -100) return 1 + 100 / -n; return NaN; }
      return n > 1 ? n : NaN;
    },
    toAmerican: function (d) { if (!(d > 1)) return "—"; return d >= 2 ? "+" + Math.round((d - 1) * 100) : String(Math.round(-100 / (d - 1))); },
    toFrac: function (d) {
      if (!(d > 1)) return "—"; var x = d - 1, best = [1, 1], err = 9;
      for (var den = 1; den <= 100; den++) { var num = Math.round(x * den), e = Math.abs(x - num / den); if (e < err - 1e-9) { err = e; best = [num, den]; } if (e < 1e-6) break; }
      var g = function (a, b) { return b ? g(b, a % b) : a; }, k = g(best[0], best[1]) || 1; return best[0] / k + "/" + best[1] / k;
    },
    implied: function (d) { return 1 / d; }
  };
  var money = function (n) { return (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var pct = function (n, dp) { return (n * 100).toFixed(dp == null ? 2 : dp) + "%"; };
  var num = function (el) { return parseFloat((el && el.value) || ""); };
  function out(calc, items) {
    var box = $(".out", calc);
    box.innerHTML = items.map(function (i) { return '<div><small>' + i[0] + '</small><b class="' + (i[2] || "") + '">' + i[1] + "</b></div>"; }).join("");
  }
  function sign(n) { return n > 0 ? "pos" : n < 0 ? "neg" : ""; }
  function bind(id, fn) {
    var c = document.getElementById(id); if (!c) return;
    var run = function () { try { fn(c); } catch (e) {} };
    c.addEventListener("input", run); c.addEventListener("change", run); c._run = run; run();
  }

  /* 1. Odds converter */
  bind("converter", function (c) {
    var d = O.parse($("[name=odds]", c).value);
    if (!(d > 1)) return out(c, [["Status", "Enter odds like -110, +150, 2.50 or 5/2"]]);
    out(c, [["American", O.toAmerican(d)], ["Decimal", d.toFixed(3)], ["Fractional", O.toFrac(d)], ["Implied prob.", pct(1 / d)], ["Profit on $100", money((d - 1) * 100)]]);
  });

  /* 2. Parlay */
  function legRow(v) {
    var d = document.createElement("div"); d.className = "leg";
    d.innerHTML = '<input aria-label="Leg odds" name="leg" value="' + (v || "") + '" placeholder="-110"><button type="button" class="btn btn-ghost btn-sm" aria-label="Remove leg">✕</button>';
    $("button", d).addEventListener("click", function () { var c = d.closest(".calc"); d.remove(); c._run && c._run(); });
    return d;
  }
  var legs = $("#parlay .legs");
  if (legs) {
    ["-110", "+150", "-120"].forEach(function (v) { legs.appendChild(legRow(v)); });
    $("#add-leg").addEventListener("click", function () { if ($$(".leg", legs).length < 15) { legs.appendChild(legRow("")); $("#parlay")._run(); } });
  }
  bind("parlay", function (c) {
    var stake = num($("[name=stake]", c)), dec = 1, n = 0, bad = false;
    $$("[name=leg]", c).forEach(function (i) { if (!i.value.trim()) return; var d = O.parse(i.value); if (d > 1) { dec *= d; n++; } else bad = true; });
    if (!n || !(stake > 0)) return out(c, [["Status", "Add legs and a stake"]]);
    out(c, [["Legs", n + (bad ? " (some invalid)" : "")], ["Parlay odds", O.toAmerican(dec)], ["Decimal", dec.toFixed(2)], ["Payout", money(stake * dec)], ["Profit", money(stake * (dec - 1)), "pos"], ["Implied prob.", pct(1 / dec)]]);
  });

  /* 3. Hedge */
  bind("hedge", function (c) {
    var s = num($("[name=stake]", c)), d1 = O.parse($("[name=o1]", c).value), d2 = O.parse($("[name=o2]", c).value);
    if (!(s > 0 && d1 > 1 && d2 > 1)) return out(c, [["Status", "Enter original stake, original odds and hedge odds"]]);
    var h = s * d1 / d2, pWin = s * (d1 - 1) - h, pHedge = h * (d2 - 1) - s;
    out(c, [["Hedge stake", money(h)], ["If original wins", money(pWin), sign(pWin)], ["If hedge wins", money(pHedge), sign(pHedge)], ["Guaranteed", money(Math.min(pWin, pHedge)), sign(Math.min(pWin, pHedge))]]);
  });

  /* 4. Arbitrage */
  bind("arb", function (c) {
    var T = num($("[name=total]", c)), a = O.parse($("[name=a]", c).value), b = O.parse($("[name=b]", c).value);
    if (!(T > 0 && a > 1 && b > 1)) return out(c, [["Status", "Enter odds for both sides and a total stake"]]);
    var m = 1 / a + 1 / b, sa = T * (1 / a) / m, sb = T * (1 / b) / m, profit = sa * a - T;
    out(c, [["Market %", pct(m)], ["Arb?", m < 1 ? "YES ✓" : "No", m < 1 ? "pos" : "neg"], ["Stake side A", money(sa)], ["Stake side B", money(sb)], ["Locked profit", money(profit), sign(profit)], ["ROI", pct(profit / T), sign(profit)]]);
  });

  /* 5. Expected value */
  bind("ev", function (c) {
    var d = O.parse($("[name=odds]", c).value), p = num($("[name=prob]", c)) / 100, s = num($("[name=stake]", c));
    if (!(d > 1 && p > 0 && p < 1 && s > 0)) return out(c, [["Status", "Enter odds, your win probability (%) and stake"]]);
    var ev = p * s * (d - 1) - (1 - p) * s, edge = p * d - 1;
    out(c, [["Expected value", money(ev), sign(ev)], ["Edge / ROI", pct(edge), sign(edge)], ["Break-even prob.", pct(1 / d)], ["Fair odds", O.toAmerican(1 / p)]]);
  });

  /* 6. Kelly */
  bind("kelly", function (c) {
    var d = O.parse($("[name=odds]", c).value), p = num($("[name=prob]", c)) / 100, br = num($("[name=bank]", c)), frac = parseFloat($("[name=frac]", c).value);
    if (!(d > 1 && p > 0 && p < 1 && br > 0)) return out(c, [["Status", "Enter odds, win probability and bankroll"]]);
    var b = d - 1, f = (b * p - (1 - p)) / b, adj = Math.max(0, f * frac);
    out(c, [["Full Kelly", pct(Math.max(f, 0))], ["Your fraction", pct(adj)], ["Bet size", money(adj * br), adj > 0 ? "pos" : ""], ["Verdict", f > 0 ? "+EV — bet" : "No edge — pass", f > 0 ? "pos" : "neg"]]);
  });

  /* 7. No-vig fair odds */
  bind("novig", function (c) {
    var a = O.parse($("[name=a]", c).value), b = O.parse($("[name=b]", c).value);
    if (!(a > 1 && b > 1)) return out(c, [["Status", "Enter both sides of a two-way market"]]);
    var ia = 1 / a, ib = 1 / b, m = ia + ib, fa = ia / m, fb = ib / m;
    out(c, [["Book margin (vig)", pct(m - 1)], ["Fair prob. A", pct(fa)], ["Fair odds A", O.toAmerican(1 / fa)], ["Fair prob. B", pct(fb)], ["Fair odds B", O.toAmerican(1 / fb)]]);
  });

  /* 8. Round robin */
  bind("rr", function (c) {
    var picks = $("[name=picks]", c).value.split(/[,\s]+/).filter(Boolean).map(O.parse).filter(function (d) { return d > 1; });
    var k = parseInt($("[name=size]", c).value, 10), s = num($("[name=stake]", c));
    if (picks.length < 2 || !(s > 0) || k > picks.length) return out(c, [["Status", "Enter at least " + k + " valid odds, separated by commas"]]);
    var combos = [], total = 0;
    (function go(start, arr) { if (arr.length === k) { combos.push(arr.slice()); return; } for (var i = start; i < picks.length; i++) { arr.push(picks[i]); go(i + 1, arr); arr.pop(); } })(0, []);
    combos.forEach(function (cb) { total += s * cb.reduce(function (x, y) { return x * y; }, 1); });
    var risk = combos.length * s;
    out(c, [["Parlays", combos.length], ["Total risk", money(risk)], ["Max payout (all win)", money(total)], ["Max profit", money(total - risk), "pos"]]);
  });

  /* 9. Bankroll / unit sizer */
  bind("units", function (c) {
    var br = num($("[name=bank]", c)), u = num($("[name=unit]", c)) / 100, st = $("[name=style]", c).value;
    if (!(br > 0 && u > 0)) return out(c, [["Status", "Enter bankroll and unit %"]]);
    var unit = br * u, runway = Math.floor(1 / u);
    var note = u > 0.05 ? "Aggressive — high risk of ruin" : u > 0.03 ? "Bold" : u >= 0.01 ? "Shark standard" : "Conservative";
    out(c, [["1 unit", money(unit)], ["Standard bet (" + st + "u)", money(unit * parseFloat(st))], ["Losing-streak runway", runway + " bets"], ["Risk profile", note, u > 0.05 ? "neg" : "pos"]]);
  });

  /* Copy result buttons */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.closest(".calc"), txt = $$(".out div", c).map(function (d) { return $("small", d).textContent + ": " + $("b", d).textContent; }).join(" | ");
      var done = function () { window.SB && SB.toast("Result copied"); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt + " — via Shark.Bet").then(done, done); else done();
    });
  });
})();
