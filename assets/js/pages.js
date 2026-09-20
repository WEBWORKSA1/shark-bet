/* Page modules: Odds Lab, Contests, Academy, Quiz */
(function () {
  "use strict";
  var D = window.SB_DATA || {}, O = window.SBOdds;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function amToDec(a) { return a > 0 ? 1 + a / 100 : 1 + 100 / -a; }
  function fmt(a, mode) { return mode === "dec" ? amToDec(a).toFixed(2) : (a > 0 ? "+" + a : String(a)); }

  /* ---------- Odds Lab ---------- */
  var board = $("#odds-board");
  if (board && D.games) {
    var mode = "am", sport = "All", chart = $("#line-chart"), sel = $("#chart-game");
    function draw() {
      var games = D.games.filter(function (g) { return sport === "All" || g.sport === sport; });
      var head = "<tr><th>Game</th>" + D.books.map(function (b) { return "<th>" + b + "</th>"; }).join("") + "<th>Open</th><th>Tickets vs Money (away)</th></tr>";
      var rows = games.map(function (g) {
        var bestA = Math.max.apply(null, g.odds.map(function (o) { return amToDec(o[0]); })),
            bestH = Math.max.apply(null, g.odds.map(function (o) { return amToDec(o[1]); }));
        var cells = g.odds.map(function (o) {
          return "<td><span class='" + (amToDec(o[0]) === bestA ? "best" : "") + "' style='padding:2px 6px;display:inline-block'>" + fmt(o[0], mode) + "</span><br><span class='" + (amToDec(o[1]) === bestH ? "best" : "") + "' style='padding:2px 6px;display:inline-block'>" + fmt(o[1], mode) + "</span></td>";
        }).join("");
        var gap = g.money[0] - g.tickets[0], flag = Math.abs(gap) >= 15 ? "<span class='sharp-flag'>🦈 SHARP SIGNAL: money " + (gap > 0 ? "on " + g.away : "on " + g.home) + "</span>" : "<span class='small muted'>No split</span>";
        return "<tr><td><b>" + esc(g.away) + "</b> @ <b>" + esc(g.home) + "</b><br><span class='small muted'>" + g.sport + " · " + g.time + " · " + g.market + "</span></td>" + cells +
          "<td class='muted'>" + fmt(g.open[0], mode) + "<br>" + fmt(g.open[1], mode) + "</td>" +
          "<td style='min-width:190px'><div class='small'>Tickets " + g.tickets[0] + "%</div><div class='bar'><i style='width:" + g.tickets[0] + "%;background:var(--blue)'></i></div>" +
          "<div class='small' style='margin-top:4px'>Money " + g.money[0] + "%</div><div class='bar'><i style='width:" + g.money[0] + "%;background:var(--teal)'></i></div>" + flag + "</td></tr>";
      }).join("");
      board.innerHTML = "<table><thead>" + head + "</thead><tbody>" + rows + "</tbody></table>";
    }
    $$("[data-sport]").forEach(function (b) {
      b.addEventListener("click", function () { $$("[data-sport]").forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); sport = b.getAttribute("data-sport"); draw(); });
    });
    $$("[data-fmt]").forEach(function (b) {
      b.addEventListener("click", function () { $$("[data-fmt]").forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); mode = b.getAttribute("data-fmt"); draw(); });
    });
    draw();

    if (chart && sel) {
      sel.innerHTML = D.games.map(function (g, i) { return "<option value='" + i + "'>" + esc(g.away + " @ " + g.home) + "</option>"; }).join("");
      function plot() {
        var g = D.games[+sel.value], h = g.history.map(function (a) { return 1 / amToDec(a) * 100; });
        var dpr = window.devicePixelRatio || 1, W = chart.clientWidth, H = 260;
        chart.width = W * dpr; chart.height = H * dpr; var x = chart.getContext("2d"); x.scale(dpr, dpr);
        var css = getComputedStyle(document.documentElement), line = css.getPropertyValue("--line").trim(), teal = css.getPropertyValue("--teal").trim(), txt = css.getPropertyValue("--muted").trim();
        var min = Math.min.apply(null, h) - 2, max = Math.max.apply(null, h) + 2, pad = 44;
        x.clearRect(0, 0, W, H); x.font = "12px Inter, sans-serif"; x.fillStyle = txt; x.strokeStyle = line;
        for (var i = 0; i <= 4; i++) { var y = pad / 2 + (H - pad) * i / 4; x.beginPath(); x.moveTo(pad, y); x.lineTo(W - 10, y); x.stroke(); x.fillText((max - (max - min) * i / 4).toFixed(1) + "%", 2, y + 4); }
        var labels = ["Open", "−5d", "−4d", "−3d", "−2d", "−1d", "Now"];
        var px = function (k) { return pad + (W - pad - 20) * k / (h.length - 1); }, py = function (v) { return pad / 2 + (H - pad) * (max - v) / (max - min); };
        labels.forEach(function (l, k) { x.fillText(l, px(k) - 12, H - 4); });
        var grad = x.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "rgba(24,214,195,.35)"); grad.addColorStop(1, "rgba(24,214,195,0)");
        x.beginPath(); h.forEach(function (v, k) { k ? x.lineTo(px(k), py(v)) : x.moveTo(px(k), py(v)); }); x.lineTo(px(h.length - 1), H - pad / 2); x.lineTo(px(0), H - pad / 2); x.fillStyle = grad; x.fill();
        x.beginPath(); x.lineWidth = 3; x.strokeStyle = teal; h.forEach(function (v, k) { k ? x.lineTo(px(k), py(v)) : x.moveTo(px(k), py(v)); }); x.stroke();
        h.forEach(function (v, k) { x.beginPath(); x.arc(px(k), py(v), 4, 0, 7); x.fillStyle = teal; x.fill(); });
        var moved = h[h.length - 1] - h[0];
        $("#chart-note").innerHTML = "<b>" + esc(g.away) + "</b> moved from " + fmt(g.history[0], "am") + " to " + fmt(g.history[g.history.length - 1], "am") + " (" + (moved >= 0 ? "+" : "") + moved.toFixed(1) + " pts implied). Tickets on " + esc(g.away) + ": " + g.tickets[0] + "%. " +
          ((moved > 0 && g.tickets[0] < 50) || (moved < 0 && g.tickets[0] > 50) ? "<span class='sharp-flag'>Reverse line movement — sharp action likely.</span>" : "Line is moving with the public.");
      }
      sel.addEventListener("change", plot); window.addEventListener("resize", plot); plot();
    }
  }

  /* ---------- Contests ---------- */
  var mh = $("#matchups");
  if (mh && D.contest) {
    var picks = {};
    mh.innerHTML = D.contest.matchups.map(function (m, i) {
      return "<div class='match'><button type='button' class='pick' data-g='" + i + "' data-t='" + esc(m.a) + " " + m.as + "'>" + esc(m.a) + "<small>" + m.as + "</small></button><span class='vs'>VS</span><button type='button' class='pick' data-g='" + i + "' data-t='" + esc(m.b) + " " + m.bs + "'>" + esc(m.b) + "<small>" + m.bs + "</small></button></div>";
    }).join("");
    var counter = $("#pick-count");
    $$(".pick", mh).forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.getAttribute("data-g");
        $$('.pick[data-g="' + g + '"]', mh).forEach(function (o) { o.classList.remove("on"); });
        b.classList.add("on"); picks[g] = b.getAttribute("data-t");
        counter.textContent = Object.keys(picks).length + " / " + D.contest.matchups.length + " picks made";
      });
    });
    var cf = $("#contest-form");
    cf._extra = function () {
      return { contest: D.contest.week, picks: Object.keys(picks).sort().map(function (k) { return picks[k]; }).join(" | ") };
    };
    cf.addEventListener("submit", function (e) {
      if (Object.keys(picks).length < D.contest.matchups.length) { e.stopImmediatePropagation(); e.preventDefault(); window.SB && SB.toast("Make all " + D.contest.matchups.length + " picks first"); }
    }, true);
  }
  var lb = $("#leaderboard");
  if (lb && D.leaderboard) {
    lb.innerHTML = "<table class='leader'><thead><tr><th>#</th><th>Player</th><th>W</th><th>L</th><th>Win %</th><th>Units</th></tr></thead><tbody>" +
      D.leaderboard.map(function (r, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(r[0]) + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + (r[1] / (r[1] + r[2]) * 100).toFixed(1) + "%</td><td class='pos'>" + r[3] + "</td></tr>"; }).join("") + "</tbody></table>";
  }

  /* ---------- Academy ---------- */
  var lessons = $("#lessons");
  if (lessons && D.lessons) {
    var lv = "All";
    var paint = function () {
      lessons.innerHTML = D.lessons.filter(function (l) { return lv === "All" || l.level === lv; }).map(function (l, i) {
        var col = l.level === "Guppy" ? "green" : l.level === "Hammerhead" ? "gold" : "orange";
        return "<article class='card hover'><span class='badge " + col + "'>" + l.level + "</span><h3 style='margin-top:12px'>" + esc(l.title) + "</h3><p class='small muted'>⏱ " + l.mins + " min read · Lesson " + (D.lessons.indexOf(l) + 1) + "</p><a class='btn btn-ghost btn-sm' href='#lesson-" + (D.lessons.indexOf(l) + 1) + "' data-lesson='" + D.lessons.indexOf(l) + "'>Start lesson →</a></article>";
      }).join("");
      $$("[data-lesson]", lessons).forEach(function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault(); var m = $("#lesson-modal"); if (!m) return;
          $("#lesson-title", m).textContent = D.lessons[+a.getAttribute("data-lesson")].title; m.classList.add("show");
        });
      });
    };
    $$("[data-level]").forEach(function (b) {
      b.addEventListener("click", function () { $$("[data-level]").forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); lv = b.getAttribute("data-level"); paint(); });
    });
    paint();
  }
  var gl = $("#gloss-list"), gq = $("#gloss-search");
  if (gl && D.glossary) {
    var gpaint = function () {
      var q = (gq && gq.value || "").toLowerCase();
      var list = D.glossary.filter(function (t) { return !q || (t[0] + " " + t[1]).toLowerCase().indexOf(q) > -1; });
      gl.innerHTML = list.length ? list.map(function (t) { return "<div class='term'><b>" + esc(t[0]) + "</b><p>" + esc(t[1]) + "</p></div>"; }).join("") : "<p class='muted'>No terms match — try “vig” or “CLV”.</p>";
      var cnt = $("#gloss-count"); if (cnt) cnt.textContent = list.length + " terms";
    };
    if (gq) gq.addEventListener("input", gpaint); gpaint();
  }

  /* ---------- Bettor-type quiz ---------- */
  var quiz = $("#quiz-box");
  if (quiz) {
    var qs = [
      { q: "A line moves from −3 to −4.5. Your first thought?", a: [["Who cares, I like the team", 0], ["Someone knows something", 1], ["Did I beat the close? Where's the no-vig price?", 2]] },
      { q: "How many sportsbook accounts do you use?", a: [["One", 0], ["Two or three", 1], ["Four or more — I line-shop every bet", 2]] },
      { q: "How do you size your bets?", a: [["Whatever feels right", 0], ["Flat units", 1], ["By edge — fractional Kelly", 2]] },
      { q: "Your favourite bet type?", a: [["Big-odds parlays", 0], ["Straight bets & a few props", 1], ["Whatever is +EV today", 2]] },
      { q: "Do you track your bets?", a: [["Never", 0], ["Sometimes", 1], ["Every bet, with CLV", 2]] }
    ];
    var idx = 0, score = 0;
    var render = function () {
      if (idx >= qs.length) {
        var type = score <= 3 ? ["Guppy", "You bet for fun — nothing wrong with that. The Starter Kit will add discipline fast."] : score <= 7 ? ["Hammerhead", "You've got instincts and some structure. Line shopping + CLV tracking will sharpen your edge."] : ["Great White", "You think like a pro. Our +EV and Kelly tools are built for you."];
        quiz.innerHTML = "<span class='badge orange'>Your result</span><h3 style='font-size:1.7rem;margin-top:10px'>You're a " + type[0] + " 🦈</h3><p class='muted'>" + type[1] + "</p>" +
          "<form data-form='Quiz lead — " + type[0] + "' data-success='Your personalised " + type[0] + " plan is on its way.' class='inline-form'><input class='hp' name='_honey' tabindex='-1' autocomplete='off' aria-hidden='true'><input type='hidden' name='bettor_type' value='" + type[0] + "'><input type='email' name='email' required placeholder='Email for your free " + type[0] + " plan' aria-label='Email'><button class='btn btn-primary' type='submit'>Send my plan</button></form><p class='small muted' style='margin-top:10px'>21+ only. One email a week. Unsubscribe anytime.</p>";
        document.dispatchEvent(new CustomEvent("sb:forms"));
        return;
      }
      var cur = qs[idx];
      quiz.innerHTML = "<div class='steps-bar'>" + qs.map(function (_, k) { return "<span class='" + (k <= idx ? "on" : "") + "'></span>"; }).join("") + "</div><p class='small muted'>Question " + (idx + 1) + " of " + qs.length + "</p><h3>" + esc(cur.q) + "</h3><div class='grid' style='gap:10px'>" +
        cur.a.map(function (a, k) { return "<button type='button' class='btn btn-ghost' style='justify-content:flex-start;white-space:normal;text-align:left' data-a='" + k + "'>" + esc(a[0]) + "</button>"; }).join("") + "</div>";
      $$("[data-a]", quiz).forEach(function (b) { b.addEventListener("click", function () { score += cur.a[+b.getAttribute("data-a")][1]; idx++; render(); }); });
    };
    render();
  }
})();
