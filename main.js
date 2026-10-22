(function () {
  var cfg = window.ANW || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Images from data-img */
  document.querySelectorAll("[data-img]").forEach(function (el) {
    var src = el.getAttribute("data-img");
    if (src) el.style.backgroundImage = "url('" + src + "')";
    else el.classList.add("empty");
  });

  /* Duplicate gallery for a seamless loop */
  var track = document.getElementById("gallery-track");
  Array.prototype.slice.call(track.children).forEach(function (c) {
    var copy = c.cloneNode(true); copy.setAttribute("aria-hidden", "true"); track.appendChild(copy);
  });

  /* Sticky bar border */
  var bar = document.getElementById("topbar");
  var heroEl = document.getElementById("inicio");
  var lastY = window.scrollY, travel = 0;
  var keyboardFocus = function () { var a = document.activeElement; return bar.contains(a) && a.matches && a.matches(":focus-visible"); };
  var onScroll = function () {
    var y = window.scrollY, dy = y - lastY; lastY = y;
    bar.classList.toggle("scrolled", y > heroEl.offsetHeight - bar.offsetHeight);
    if (y < 80 || keyboardFocus()) { bar.classList.remove("is-hidden"); travel = 0; return; }
    // add up small scrolls in the same direction, reset when direction flips
    travel = (dy > 0) === (travel > 0) ? travel + dy : dy;
    if (travel > 6) bar.classList.add("is-hidden");
    else if (travel < -6) bar.classList.remove("is-hidden");
  };
  bar.addEventListener("click", function (e) { var l = e.target.closest("a"); if (l) l.blur(); });
  window.addEventListener("resize", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Offer countdown: fixed date for everyone, or a per-visitor window that survives reloads.
     The discounted price never ends: when the countdown reaches zero only the timer hides. */
  var offerActive = false;
  var end = cfg.offerEnd ? new Date(cfg.offerEnd).getTime() : NaN;
  if (isNaN(end) && cfg.offerHours > 0) {
    var KEY = "anw-offer-end", saved = NaN;
    try { saved = parseInt(localStorage.getItem(KEY), 10); } catch (e) {}
    if (isNaN(saved)) {
      saved = Date.now() + cfg.offerHours * 36e5;
      try { localStorage.setItem(KEY, String(saved)); } catch (e) {}
    }
    end = saved;
  }
  var offerBar = document.getElementById("offer-bar");
  var timerRunning = false;
  if (offerBar && !isNaN(end)) {
    offerActive = true; timerRunning = end > Date.now();
    var timeBox = offerBar.querySelector(".offer-time");
    var units = {}; offerBar.querySelectorAll("[data-u]").forEach(function (b) { units[b.getAttribute("data-u")] = b; });
    var daysBox = offerBar.querySelector(".offer-days");
    var pad = function (n) { return String(n).padStart(2, "0"); };
    offerBar.hidden = false; document.documentElement.classList.add("has-offer");
    offerBar.addEventListener("click", function (e) { if (!e.target.closest(".offer-cta")) offerBar.querySelector(".offer-cta").click(); });
    var tick = function () {
      var d = Math.max(0, end - Date.now() - 1); // -1ms so a fresh 24 h shows 23:59:59, not "1 día"
      if (!d) { timerRunning = false; timeBox.hidden = true; clearInterval(t); if (typeof renderPrices === "function") renderPrices(); return; }
      var days = Math.floor(d / 864e5);
      daysBox.style.display = days ? "" : "none";
      units.d.textContent = pad(days); units.h.textContent = pad(Math.floor(d % 864e5 / 36e5));
      units.m.textContent = pad(Math.floor(d % 36e5 / 6e4)); units.s.textContent = pad(Math.floor(d % 6e4 / 1e3));
    };
    var t = setInterval(tick, 1000); tick();
  }

  /* Prices: struck regular + offer price, always (the discount does not expire) */
  var sellingPrice = function () { return cfg.priceOffer || cfg.priceRegular; };
  var renderPrices = function () {
    var reg = cfg.priceRegular, off = cfg.priceOffer, onSale = off && reg && off < reg;
    document.querySelectorAll("[data-price]").forEach(function (el) {
      if (!reg) { el.hidden = true; return; }
      var compact = el.getAttribute("data-price") === "compact";
      if (onSale) {
        var pct = Math.round((1 - off / reg) * 100);
        el.innerHTML = compact
          ? "<s>US$" + reg + "</s> <b>US$" + off + "</b>"
          : "<s>US$" + reg + "</s> <strong>US$" + off + "</strong> <span>· Pago único · Curso en español</span> <span class=\"tag\">-" + pct + "%" + (timerRunning ? " por 24 h" : "") + "</span>";
      } else {
        var now = sellingPrice();
        el.innerHTML = compact ? "" : "<strong>US$" + now + "</strong> <span>· Pago único · Curso en español</span>";
      }
    });
  };
  renderPrices();

  /* Reveal + count-up */
  var countUp = function (el) {
    var target = parseFloat(el.getAttribute("data-count")), dec = +el.getAttribute("data-decimals") || 0, t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          if (el.classList.contains("in")) return;
          el.classList.add("in");
          el.querySelectorAll("[data-count]").forEach(countUp);
        } else if (en.intersectionRatio === 0) {
          // fully off screen: reset so it animates again next time it scrolls into view
          el.classList.remove("in");
        }
      });
    }, { threshold: [0, 0.15] });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* Hero scroll sequence: the title steps back and all three videos glide up together */
  (function () {
    var shell = document.getElementById("inicio"); if (!shell) return;
    var hero = shell.querySelector(".hero");
    var still = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var target = 0, cur = null, raf = 0, last = 0;
    var apply = function (p) {
      var a = 0, b = 1;
      if (!still.matches) { a = ease(clamp(p / 0.6)); b = ease(clamp(p / 0.85)); }
      hero.style.setProperty("--a", a.toFixed(4));
      hero.style.setProperty("--b", b.toFixed(4));
      hero.classList.toggle("copy-gone", a > 0.98);
      hero.classList.toggle("reels-in", b > 0.6);
    };
    var measure = function () {
      var range = shell.offsetHeight - window.innerHeight;
      target = still.matches ? 1 : range > 0 ? clamp(-shell.getBoundingClientRect().top / range) : 1;
    };
    var frame = function (t) {
      raf = 0;
      var dt = last ? Math.min(64, t - last) : 16.7; last = t;
      if (cur === null || still.matches) cur = target;
      else cur += (target - cur) * (1 - Math.pow(1 - 0.12, dt / 16.7)); // glide toward the scroll position
      if (Math.abs(target - cur) < 0.0004) cur = target;
      apply(cur);
      if (cur !== target) raf = requestAnimationFrame(frame); else last = 0;
    };
    var queue = function () { measure(); if (!raf) raf = requestAnimationFrame(frame); };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    if (still.addEventListener) still.addEventListener("change", queue);
    hero.classList.add("spread"); // all three videos rise together
    measure(); cur = target; apply(cur);
  })();

  /* Hero reels: 3 visible on wide screens, 1 on smaller ones; tap, swipe or arrows */
  (function () {
    var stage = document.getElementById("reels"); if (!stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".reel-card"));
    var single = cards.length < 2;
    stage.classList.toggle("is-single", single);
    var n = cards.length, cur = 0, muted = true, inView = true, startX = null, swiped = false;
    var snd = document.getElementById("reel-sound"), dotsBox = document.getElementById("reel-dots");
    var bgBox = document.getElementById("hero-bg");
    var bgs = cards.map(function (c) {
      var d = document.createElement("div"); d.className = "hero-bg-img";
      var p = c.getAttribute("data-poster"); if (p) d.style.backgroundImage = "url('" + p + "')";
      bgBox.appendChild(d); return d;
    });
    var dots = cards.map(function (c, i) {
      var b = document.createElement("button"); b.type = "button";
      b.setAttribute("aria-label", "Video " + (i + 1) + ": " + (c.getAttribute("aria-label") || ""));
      b.addEventListener("click", function (e) { e.stopPropagation(); go(i); });
      dotsBox.appendChild(b); return b;
    });
    var vid = function (i) { return cards[i].querySelector("video"); };
    var play = function (v) { if (!v) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var render = function () {
      cards.forEach(function (c, i) {
        var rel = (i - cur + n) % n; if (rel > n / 2) rel -= n;
        c.setAttribute("data-pos", String(rel));
        c.setAttribute("aria-hidden", rel === 0 ? "false" : "true");
        var v = vid(i);
        if (v) { if (rel === 0) { v.muted = muted; if (inView) play(v); } else { v.pause(); } }
      });
      var hasBg = !!cards[cur].getAttribute("data-poster");
      if (hasBg) bgs.forEach(function (b, i) { b.classList.toggle("is-active", i === cur); });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === cur ? "true" : "false"); });
      snd.hidden = !vid(cur);
    };
    var go = function (i) {
      i = (i + n) % n; if (i === cur) return;
      var v = vid(i); if (v) v.currentTime = 0;
      cur = i; render();
    };
    stage.addEventListener("click", function (e) {
      if (swiped) { swiped = false; return; }
      if (e.target.closest(".reel-sound, .reel-dots")) return;
      var card = e.target.closest(".reel-card");
      var pos = card ? +card.getAttribute("data-pos") : 0;
      go(pos === 0 ? cur + 1 : cur + pos);
    });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });
    stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX; startX = null;
      if (Math.abs(dx) > 40) { swiped = true; go(dx < 0 ? cur + 1 : cur - 1); setTimeout(function () { swiped = false; }, 400); }
    }, { passive: true });
    snd.addEventListener("click", function (e) {
      e.stopPropagation();
      muted = !muted; var v = vid(cur); if (v) v.muted = muted;
      snd.setAttribute("aria-pressed", muted ? "false" : "true");
      snd.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
      snd.querySelector(".snd-off").style.display = muted ? "" : "none";
      snd.querySelector(".snd-on").style.display = muted ? "none" : "";
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting; var v = vid(cur);
        if (v) { if (inView) play(v); else v.pause(); }
      }, { threshold: 0.2 }).observe(stage);
    }
    render();
  })();

  /* CTA: Whop if set, otherwise waitlist modal */
  var modal = document.getElementById("modal"), lastFocus = null;
  var openModal = function () { lastFocus = document.activeElement; modal.hidden = false; document.body.style.overflow = "hidden"; document.getElementById("lead-nombre").focus(); };
  var closeModal = function () { modal.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  /* "Empieza ahora": Whop embedded checkout (offer plan while the timer runs), or the waitlist if no plan is set */
  var checkout = document.getElementById("checkout"), mount = document.getElementById("whop-mount"), mountedPlan = null;
  var openCheckout = function (plan) {
    lastFocus = document.activeElement;
    checkout.hidden = false; document.body.style.overflow = "hidden";
    if (mountedPlan === plan) return;
    mountedPlan = plan;
    mount.innerHTML = '<p class="checkout-loading">Cargando el pago seguro…</p>';
    var box = document.createElement("div");
    box.setAttribute("data-whop-checkout-plan-id", plan);
    box.setAttribute("data-whop-checkout-theme", "light");
    mount.appendChild(box);
    var old = document.getElementById("whop-loader"); if (old) old.remove();
    var sc = document.createElement("script");
    sc.id = "whop-loader"; sc.async = true; sc.src = "https://js.whop.com/static/checkout/loader.js";
    sc.onload = function () { var l = mount.querySelector(".checkout-loading"); if (l) l.remove(); };
    sc.onerror = function () { mount.innerHTML = '<p class="checkout-loading">No pudimos cargar el pago. Revisa tu conexión e inténtalo de nuevo.</p>'; mountedPlan = null; };
    document.body.appendChild(sc);
  };
  var closeCheckout = function () { checkout.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  checkout.addEventListener("click", function (e) { if (e.target === checkout || e.target.hasAttribute("data-close")) closeCheckout(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !checkout.hidden) closeCheckout(); });
  document.querySelectorAll("[data-acceso]").forEach(function (b) {
    b.addEventListener("click", function () {
      var plan = (cfg.whopPlanOferta || cfg.whopPlanRegular) || "";
      plan = plan.trim();
      if (plan && cfg.checkoutEmbed) { openCheckout(plan); return; }
      if (plan) { window.location.href = "https://whop.com/checkout/" + encodeURIComponent(plan); return; }
      openModal();
    });
  });
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  var toast = document.getElementById("toast"), toastTimer;
  var showToast = function (msg) { document.getElementById("toast-text").textContent = msg; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.hidden = true; }, 6000); };
  toast.querySelector("[data-toast-close]").addEventListener("click", function () { toast.hidden = true; });

  var form = document.getElementById("lead-form"), err = document.getElementById("form-error"), submit = document.getElementById("lead-submit");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = form.nombre.value.trim(), email = form.email.value.trim().toLowerCase();
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = "Escribe tu nombre y un correo válido."; err.hidden = false; return;
    }
    err.hidden = true; submit.disabled = true; submit.textContent = "Enviando…";
    var base = (window.LEADS_API_BASE || "").replace(/\/$/, "");
    fetch(base + "/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: nombre, email: email }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || "No pudimos guardar tus datos. Inténtalo de nuevo."); }); })
      .then(function () { form.reset(); closeModal(); showToast("Listo. Te escribiremos en cuanto abra el curso."); })
      .catch(function (x) { err.textContent = x.message || "No hay conexión. Inténtalo de nuevo en un momento."; err.hidden = false; })
      .then(function () { submit.disabled = false; submit.textContent = "Avisarme"; });
  });
})();
