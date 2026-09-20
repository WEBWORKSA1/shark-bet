/* Shark.Bet core UI */
(function () {
  "use strict";
  var C = window.SB_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  window.SB = window.SB || {};
  SB.store = store;

  /* Encoded contact — assembled only on demand, never rendered */
  function contact() {
    try { return atob((C._k || []).join("")).split("").reverse().join(""); } catch (e) { return ""; }
  }

  /* Toast */
  SB.toast = function (msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.style.display = "block";
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2200);
  };

  /* Theme */
  var saved = store.get("sb-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", cur); store.set("sb-theme", cur);
    });
  });

  /* Mobile menu */
  var burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", open);
  });

  /* Age gate */
  var gate = $("#age-gate");
  if (gate && store.get("sb-age") !== "ok") {
    gate.classList.add("show");
    $("#age-yes").addEventListener("click", function () { store.set("sb-age", "ok"); gate.classList.remove("show"); });
    $("#age-no").addEventListener("click", function () { window.location.href = "https://www.ncpgambling.org/"; });
  }

  /* Cookie consent */
  var ck = $("#cookie");
  if (ck && !store.get("sb-cookie")) {
    ck.classList.add("show");
    $$("[data-cookie]", ck).forEach(function (b) {
      b.addEventListener("click", function () { store.set("sb-cookie", b.getAttribute("data-cookie")); ck.classList.remove("show"); });
    });
  }

  /* AdSense — activates only when a publisher ID is configured */
  if (C.adsenseClient && !document.body.hasAttribute("data-no-ads")) {
    var s = document.createElement("script");
    s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + C.adsenseClient;
    document.head.appendChild(s);
    $$(".ad-slot").forEach(function (slot) {
      slot.textContent = ""; slot.classList.add("live");
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle"; ins.style.display = "block";
      ins.setAttribute("data-ad-client", C.adsenseClient);
      if (slot.dataset.slot) ins.setAttribute("data-ad-slot", slot.dataset.slot);
      ins.setAttribute("data-ad-format", "auto"); ins.setAttribute("data-full-width-responsive", "true");
      slot.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  /* Email links: <a data-mail="Subject">Email us</a> */
  $$("[data-mail]").forEach(function (a) {
    a.setAttribute("href", "#");
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "mailto:" + contact() + "?subject=" + encodeURIComponent(a.getAttribute("data-mail") || "Shark.Bet inquiry");
    });
  });

  /* Chip groups → hidden inputs */
  $$(".chips[data-name]").forEach(function (g) {
    var multi = g.hasAttribute("data-multi");
    var input = document.createElement("input");
    input.type = "hidden"; input.name = g.getAttribute("data-name"); g.appendChild(input);
    $$(".chip", g).forEach(function (c) {
      c.type = "button"; c.setAttribute("aria-pressed", "false");
      c.addEventListener("click", function () {
        if (!multi) $$(".chip", g).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" && multi ? "false" : "true");
        input.value = $$('.chip[aria-pressed="true"]', g).map(function (o) { return o.textContent.trim(); }).join(", ");
      });
    });
  });

  /* Multi-step forms */
  $$("form.multistep").forEach(function (f) {
    var steps = $$(".step", f), bars = $$(".steps-bar span", f), i = 0;
    function show(n) {
      steps.forEach(function (s, k) { s.classList.toggle("active", k === n); });
      bars.forEach(function (b, k) { b.classList.toggle("on", k <= n); });
      i = n;
    }
    $$("[data-next]", f).forEach(function (b) {
      b.addEventListener("click", function () {
        var ok = $$("input,select,textarea", steps[i]).every(function (el) { return el.reportValidity ? el.reportValidity() : true; });
        if (ok) show(Math.min(i + 1, steps.length - 1));
      });
    });
    $$("[data-prev]", f).forEach(function (b) { b.addEventListener("click", function () { show(Math.max(i - 1, 0)); }); });
    show(0);
  });

  /* Form handling — every form with data-form posts to the encoded inbox */
  SB.send = function (subject, fields) {
    var to = contact();
    var payload = Object.assign({ _subject: "[Shark.Bet] " + subject, _template: "table", _captcha: "false", page: location.href }, fields);
    return fetch("https://formsubmit.co/ajax/" + to, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error("send failed"); return r.json(); });
  };
  function mailFallback(subject, fields) {
    var body = Object.keys(fields).map(function (k) { return k + ": " + fields[k]; }).join("\n");
    window.location.href = "mailto:" + contact() + "?subject=" + encodeURIComponent("[Shark.Bet] " + subject) + "&body=" + encodeURIComponent(body);
  }
  function bindForms() { $$("form[data-form]").forEach(function (f) {
    if (f._sbBound) return; f._sbBound = true;
    f.setAttribute("novalidate", "");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f.classList.contains("multistep")) {
        var act = $(".step.active", f), nx = act && $("[data-next]", act);
        if (nx) { nx.click(); return; }
      }
      var msg = $(".form-msg", f);
      if (!msg) { msg = document.createElement("div"); msg.className = "form-msg"; msg.setAttribute("role", "status"); f.appendChild(msg); }
      var hp = $(".hp input", f) || $("input.hp", f);
      if (hp && hp.value) return;
      var fieldsOk = $$("input,select,textarea", f).every(function (el) { return el.type === "hidden" || el.reportValidity(); });
      if (!fieldsOk) return;
      var data = {};
      new FormData(f).forEach(function (v, k) { if (k !== "_honey") data[k] = data[k] ? data[k] + ", " + v : v; });
      if (f._extra) Object.assign(data, f._extra());
      var subject = f.getAttribute("data-form");
      var btn = $("[type=submit]", f), label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      SB.send(subject, data).then(function () {
        msg.className = "form-msg ok";
        msg.textContent = f.getAttribute("data-success") || "Got it — you're in the shark tank. Check your inbox shortly.";
        f.reset(); $$('.chip[aria-pressed="true"]', f).forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        if (window.gtag) gtag("event", "generate_lead", { form: subject });
      }).catch(function () {
        msg.className = "form-msg err";
        msg.textContent = "Network hiccup. Opening your email app so you can send it directly…";
        setTimeout(function () { mailFallback(subject, data); }, 900);
      }).then(function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } });
    });
  }); }
  bindForms();
  document.addEventListener("sb:forms", bindForms);

  /* Donations — PayPal donate URL built at click time */
  var amt = 25;
  $$("[data-amount]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-amount]").forEach(function (o) { o.classList.remove("on"); o.setAttribute("aria-pressed", "false"); });
      b.classList.add("on"); b.setAttribute("aria-pressed", "true");
      amt = parseFloat(b.getAttribute("data-amount")); var ci = $("#custom-amount"); if (ci) ci.value = "";
    });
  });
  var customAmt = $("#custom-amount");
  if (customAmt) customAmt.addEventListener("input", function () {
    $$("[data-amount]").forEach(function (o) { o.classList.remove("on"); });
    amt = parseFloat(customAmt.value) || 0;
  });
  $$("[data-donate]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var a = parseFloat(b.getAttribute("data-fixed")) || amt;
      if (!a || a < 1) { SB.toast("Choose an amount of 1 or more"); return; }
      var purpose = b.getAttribute("data-donate") || "Shark.Bet support";
      var url = "https://www.paypal.com/donate?business=" + encodeURIComponent(contact()) +
        "&amount=" + encodeURIComponent(a) + "&currency_code=" + (C.currency || "USD") +
        "&item_name=" + encodeURIComponent(purpose) + "&no_recurring=0";
      window.open(url, "_blank", "noopener");
    });
  });

  /* Video facades */
  function renderVideos() {
    var host = $("[data-videos]"); if (!host || !window.SB_DATA) return;
    var lim = parseInt(host.getAttribute("data-videos"), 10) || 99;
    host.innerHTML = SB_DATA.videos.slice(0, lim).map(function (v) {
      var bg = v.id ? ' style="background-image:url(https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg)"' : "";
      return '<div class="card" style="padding:12px"><div class="video' + (v.id ? "" : " topic") + '" role="button" tabindex="0" data-id="' + v.id + '" data-q="' + v.q + '" aria-label="Play: ' + v.title + '"' + bg + '>' + (v.id ? "" : "<span>" + v.title + "</span>") + '</div><h3 style="margin:12px 4px 4px;font-size:1rem">' + v.title + "</h3></div>";
    }).join("");
    $$(".video", host).forEach(function (el) {
      function play() {
        var id = el.getAttribute("data-id");
        if (!id) { window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(el.getAttribute("data-q")), "_blank", "noopener"); return; }
        el.classList.add("playing");
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      }
      el.addEventListener("click", play);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
    });
  }
  renderVideos();

  /* Exit-intent lead modal (desktop, once per session) */
  var exit = $("#exit-modal");
  if (exit && window.matchMedia("(min-width: 900px)").matches && !store.sget("sb-exit") && !document.body.hasAttribute("data-no-exit")) {
    var armed = false; setTimeout(function () { armed = true; }, 12000);
    document.addEventListener("mouseout", function (e) {
      if (armed && !e.relatedTarget && e.clientY < 10 && !store.sget("sb-exit")) { exit.classList.add("show"); store.sset("sb-exit", "1"); }
    });
  }
  $$(".modal .close,[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest(".modal").classList.remove("show"); }); });
  $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m && m.id !== "age-gate") m.classList.remove("show"); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $$(".modal.show").forEach(function (m) { if (m.id !== "age-gate") m.classList.remove("show"); }); });

  /* Reveal on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* Counters */
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "", n = 0, step = end / 40;
    var t = setInterval(function () { n += step; if (n >= end) { n = end; clearInterval(t); } el.textContent = Math.round(n).toLocaleString() + suf; }, 30);
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
