/* Blaiklock Supply Chain Resilience Check — application logic.
   Content lives in config.js; this file only handles flow, scoring and rendering. */
(function () {
  "use strict";

  var C = window.HEALTH_CHECK_CONFIG;
  var D = C.deepDive;
  var STORAGE_KEY = "blaiklock-resilience-check-v2";
  var LETTERS = "ABCDEFGH";
  var app = document.getElementById("app");
  var tooltip = document.getElementById("tooltip");

  /* ---------- Steps ---------- */

  // questions → "deeper review?" gate → contact steps (only if they say yes)
  var steps = [];
  C.pillars.forEach(function (p, pi) {
    p.questions.forEach(function (q, qi) {
      steps.push({ type: "question", segment: pi, pillar: p, q: q, index: qi });
    });
  });
  var questionCount = steps.length;
  var GATE = steps.length;
  steps.push({ type: "gate", segment: C.pillars.length });
  var FIRST_CONTACT = steps.length;
  D.steps.forEach(function (cs, i) {
    var options = cs.optionsFromPillars
      ? C.pillars.map(function (p) { return p.name; }).concat(cs.extraOption ? [cs.extraOption] : [])
      : cs.options;
    steps.push({ type: "contact", segment: C.pillars.length, def: cs, options: options, index: i });
  });
  var LAST = steps.length - 1;
  var segments = C.pillars.map(function (p) { return { label: p.name }; }).concat([{ label: "Your details" }]);

  /* ---------- State ---------- */

  // Contact details are kept in memory only, never written to browser storage.
  var contact = {};

  function freshState() {
    return { view: "intro", step: 0, answers: {}, submitted: false, fromResults: false };
  }

  function allAnswered(s) {
    return steps.every(function (st) { return st.type !== "question" || st.q.options[s.answers[st.q.id]]; });
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!s || typeof s !== "object") return null;
      s.answers = s.answers || {};
      // Drop answers that no longer fit the current config (questions edited since).
      steps.forEach(function (st) {
        if (st.type === "question" && !st.q.options[s.answers[st.q.id]]) delete s.answers[st.q.id];
      });
      if (typeof s.step !== "number" || s.step < 0 || s.step > LAST) s.step = 0;
      // Contact steps can't be resumed after a reload (details aren't stored), so go back to the gate.
      if (s.step > GATE) { s.step = GATE; s.fromResults = false; }
      if (s.view === "results" || s.view === "calculating") s.view = allAnswered(s) ? "results" : "intro";
      if (s.view === "steps" && s.step >= GATE && !allAnswered(s)) s.step = 0;
      if (s.view !== "steps" && s.view !== "results") s.view = "intro";
      return s;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  var state = loadState() || freshState();

  function hasProgress() {
    return Object.keys(state.answers).length > 0;
  }

  /* ---------- DOM helpers ---------- */

  function h(tag, props) {
    var el = document.createElement(tag);
    setProps(el, props);
    appendKids(el, Array.prototype.slice.call(arguments, 2));
    return el;
  }

  function s(tag, props) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    setProps(el, props);
    return el;
  }

  function setProps(el, props) {
    if (!props) return;
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") el.setAttribute("class", v);
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
  }

  function appendKids(el, kids) {
    kids.forEach(function (kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) appendKids(el, kid);
      else el.append(kid.nodeType ? kid : String(kid));
    });
  }

  function mount(node, focusSelector) {
    app.replaceChildren(node);
    window.scrollTo({ top: 0 });
    var target = focusSelector && app.querySelector(focusSelector);
    if (target) {
      if (!/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }

  function pillarIcon(p) {
    return h("span", { class: "pillar-icon", "aria-hidden": "true" }, p.icon || p.name.charAt(0));
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Top bar & progress ---------- */

  function updateChrome() {
    var progress = document.getElementById("progress");
    var track = document.getElementById("progress-track");
    var meta = document.getElementById("topbar-meta");

    if (state.view === "intro") {
      progress.hidden = true;
      meta.textContent = "";
      return;
    }
    progress.hidden = false;

    var current = state.view === "steps" ? steps[state.step] : null;
    track.replaceChildren.apply(track, segments.map(function (seg, i) {
      var inSeg = steps.filter(function (st) { return st.segment === i; });
      var done = current
        ? inSeg.filter(function (st) { return steps.indexOf(st) < state.step; }).length
        : inSeg.length;
      var pct = inSeg.length ? (done / inSeg.length) * 100 : 100;
      var isCurrent = current && current.segment === i;
      return h("div", { class: "progress__seg" + (isCurrent ? " is-current" : "") },
        h("div", { class: "progress__bar" }, h("div", { class: "progress__fill", style: "width:" + pct + "%" })),
        h("div", { class: "progress__label" }, seg.label));
    }));

    if (!current) meta.textContent = "Your results";
    else if (current.type === "question") meta.textContent = "Question " + (state.step + 1) + " of " + questionCount;
    else if (current.type === "gate") meta.textContent = "Assessment complete";
    else meta.textContent = "Your details · " + (current.index + 1) + " of " + D.steps.length;
  }

  /* ---------- Render: intro ---------- */

  function renderIntro() {
    var resume = hasProgress() && state.view !== "results";

    var view = h("section", { class: "intro enter" },
      h("div", { class: "intro__main" },
        h("span", { class: "eyebrow" }, "Free assessment"),
        h("h1", null, C.brand.name + " – " + C.brand.title),
        h("p", { class: "intro__tagline" }, C.brand.tagline),
        h("p", { class: "intro__lead" },
          "Find out how resilient your supply chain really is. You'll see your score across " + C.pillars.length +
          " key areas, where you're strong, where you're exposed — and tailored advice on how to improve."),
        h("div", { class: "intro__actions" },
          resume
            ? [
                h("button", { class: "btn btn--primary", type: "button", onclick: function () { go("steps", state.step); } }, "Continue where you left off →"),
                h("button", { class: "btn btn--ghost", type: "button", onclick: restart }, "Start again"),
              ]
            : h("button", { class: "btn btn--primary", type: "button", onclick: function () { go("steps", 0); } }, "Start →")),
        resume ? h("p", { class: "resume-note" }, "We've saved your progress on this device.") : null),
      h("aside", { class: "card intro__panel" },
        h("h2", null, "What we'll look at"),
        h("ul", { class: "pillar-list" }, C.pillars.map(function (p, i) {
          return h("li", { style: "animation-delay:" + (i * 60) + "ms" }, pillarIcon(p),
            h("span", null, h("strong", null, p.name), h("small", null, p.intro)));
        }))));

    mount(view, "h1");
  }

  /* ---------- Render: steps ---------- */

  var advancing = false;

  function renderStep(direction) {
    var step = steps[state.step];
    var anim = direction === "back" ? "enter-back" : "enter";
    advancing = false;
    if (step.type === "question") renderQuestion(step, anim);
    else if (step.type === "gate") renderGate(anim);
    else renderContact(step, anim);
  }

  function optionList(labels, selected, onPick, labelledBy, badges) {
    return h("div", { class: "options", role: "radiogroup", "aria-labelledby": labelledBy },
      labels.map(function (label, i) {
        return h("button", {
          class: "option", type: "button", role: "radio",
          "aria-checked": selected === i ? "true" : "false",
          onclick: function () { onPick(i); },
        },
        h("span", { class: "option__key", "aria-hidden": "true" }, LETTERS[i]),
        h("span", { class: "option__label" }, label),
        badges && badges[i] ? h("span", { class: "option__badge" }, badges[i]) : null);
      }));
  }

  function markPicked(i) {
    app.querySelectorAll(".option").forEach(function (btn, j) {
      btn.setAttribute("aria-checked", j === i ? "true" : "false");
      if (j === i) btn.classList.add("is-picked");
    });
  }

  function renderQuestion(step, anim) {
    var q = step.q;
    var selected = state.answers[q.id];
    mount(h("section", { class: "stage " + anim },
      h("div", { class: "card stage__card" },
        h("div", { class: "q-meta" },
          pillarIcon(step.pillar),
          h("span", null, h("strong", null, step.pillar.name), " · Question " + (step.index + 1) + " of " + step.pillar.questions.length)),
        h("h2", { class: "q-title", id: "q-title" }, q.text),
        optionList(q.options.map(function (o) { return o.label; }), selected, choose, "q-title"),
        navRow({
          back: true,
          hint: "Tip: press A–" + LETTERS[q.options.length - 1] + " to answer",
          next: { label: "Next →", disabled: selected === undefined, onclick: next },
        }))), "#q-title");
  }

  function renderGate(anim) {
    var picked = state.gateChoice;
    mount(h("section", { class: "stage " + anim },
      h("div", { class: "card stage__card gate" },
        h("div", { class: "gate__icon", "aria-hidden": "true" }, "✓"),
        h("h2", { class: "q-title", id: "q-title" }, D.question),
        h("p", { class: "gate__sub" }, D.subtitle),
        optionList([D.yes, D.no], picked, chooseGate, "q-title"),
        navRow({ back: true, hint: "Tip: press A or B to answer" }))), "#q-title");
  }

  function renderContact(step, anim) {
    var def = step.def;
    var isLast = state.step === LAST;
    var body;

    if (def.fields) {
      body = h("div", { class: "fields fields--" + def.fields.length },
        def.fields.map(function (f) {
          return h("input", {
            class: "input", id: "f-" + f.name, name: f.name, type: f.type || "text",
            placeholder: f.placeholder, autocomplete: f.autocomplete,
            "aria-label": f.placeholder || def.label, "aria-required": def.required ? "true" : null,
            "aria-describedby": "step-error", value: contact[f.name] || "",
          });
        }));
    } else {
      var badges = null;
      if (def.optionsFromPillars) {
        var weakest = lowestPillarIndex();
        badges = {};
        badges[weakest] = "Your lowest score";
      }
      body = optionList(step.options, contact[def.id], function (i) { chooseContact(step, i); }, "q-title", badges);
    }

    var form = h("form", { class: "card stage__card", novalidate: true, onsubmit: function (e) { e.preventDefault(); next(); } },
      h("h2", { class: "q-title", id: "q-title" }, def.label,
        def.required ? h("span", { class: "req", "aria-hidden": "true" }, " *") : null),
      def.hint ? h("p", { class: "step-hint" }, def.hint) : null,
      body,
      h("p", { class: "step-error", id: "step-error", "aria-live": "polite" }),
      isLast && D.privacyNote ? h("p", { class: "privacy" }, D.privacyNote) : null,
      navRow({
        back: true,
        status: true,
        next: { label: isLast ? "Submit" : "Next →", submit: true, primary: isLast },
      }));

    mount(h("section", { class: "stage " + anim }, form), def.fields ? "#f-" + def.fields[0].name : "#q-title");
  }

  function navRow(opts) {
    return h("div", { class: "q-nav" },
      opts.back ? h("button", { class: "btn btn--link", type: "button", onclick: back }, "← Previous") : h("span"),
      opts.hint ? h("span", { class: "q-hint" }, opts.hint) : opts.status ? h("span", { class: "form__status", id: "form-status", "aria-live": "polite" }) : h("span"),
      opts.next
        ? h("button", {
            class: "btn " + (opts.next.primary ? "btn--primary" : "btn--ghost"),
            type: opts.next.submit ? "submit" : "button",
            disabled: opts.next.disabled, onclick: opts.next.onclick,
          }, opts.next.label)
        : h("span"));
  }

  function choose(i) {
    if (advancing) return;
    var step = steps[state.step];
    state.answers[step.q.id] = i;
    saveState();
    advancing = true;
    markPicked(i);
    setTimeout(next, 340);
  }

  function chooseGate(i) {
    if (advancing) return;
    advancing = true;
    state.gateChoice = i;
    markPicked(i);
    setTimeout(function () {
      if (i === 0) go("steps", FIRST_CONTACT);
      else finish();
    }, 340);
  }

  function chooseContact(step, i) {
    if (advancing) return;
    contact[step.def.id] = i;
    markPicked(i);
    if (state.step === LAST) return; // last step waits for Submit
    advancing = true;
    setTimeout(next, 340);
  }

  function next() {
    var step = steps[state.step];
    if (step.type === "question") {
      if (state.answers[step.q.id] === undefined) return;
      go("steps", state.step + 1);
    } else if (step.type === "contact") {
      if (!collectContactStep(step)) return;
      if (state.step < LAST) go("steps", state.step + 1);
      else submit();
    }
  }

  function back() {
    if (state.step === FIRST_CONTACT && state.fromResults) { state.fromResults = false; go("results"); }
    else if (state.step > 0) go("steps", state.step - 1, "back");
    else go("intro");
  }

  /* ---------- Contact details ---------- */

  function collectContactStep(step) {
    var def = step.def;
    var error = "";
    if (def.fields) {
      def.fields.forEach(function (f) {
        var input = document.getElementById("f-" + f.name);
        if (input) contact[f.name] = input.value.trim();
      });
      error = contactError(def);
      app.querySelectorAll(".input").forEach(function (input) {
        var v = input.value.trim();
        var bad = !!error && (def.required && !v ||
          input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
          input.type === "tel" && v && !/^[+()\d\s-]{6,}$/.test(v));
        input.classList.toggle("has-error", !!bad);
        input.setAttribute("aria-invalid", bad ? "true" : "false");
      });
    }
    var errEl = document.getElementById("step-error");
    if (errEl) errEl.textContent = error;
    if (error) {
      var firstBad = app.querySelector(".input.has-error");
      if (firstBad) firstBad.focus();
      return false;
    }
    return true;
  }

  function contactError(def) {
    if (!def.fields) return "";
    var missing = def.required && def.fields.some(function (f) { return !contact[f.name]; });
    if (missing) return "This field is required.";
    var email = def.fields.filter(function (f) { return f.type === "email"; })[0];
    if (email && contact[email.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact[email.name])) {
      return "Please enter a valid email address.";
    }
    var tel = def.fields.filter(function (f) { return f.type === "tel"; })[0];
    if (tel && contact[tel.name] && !/^[+()\d\s-]{6,}$/.test(contact[tel.name])) {
      return "Please enter a valid phone number.";
    }
    return "";
  }

  function submit() {
    // Details may be missing if the page was reloaded part-way through; send them back to that step.
    for (var i = FIRST_CONTACT; i <= LAST; i++) {
      if (contactError(steps[i].def)) { go("steps", i, "back"); return; }
    }
    var results = computeResults();
    var payload = buildPayload(results);
    var button = app.querySelector('button[type="submit"]');
    var status = document.getElementById("form-status");
    var endpoint = C.submission && C.submission.endpoint;

    function done() {
      state.submitted = true;
      var fromResults = state.fromResults;
      state.fromResults = false;
      if (fromResults) go("results");
      else finish();
    }

    if (!endpoint) {
      var to = (C.submission && C.submission.fallbackEmail) || C.brand.email;
      window.location.href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent("Supply Chain Resilience Check — " + payload.contact.company) +
        "&body=" + encodeURIComponent(emailBody(payload));
      done();
      return;
    }

    button.disabled = true;
    status.className = "form__status";
    status.textContent = "Sending…";
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      done();
    }).catch(function () {
      button.disabled = false;
      status.className = "form__status is-error";
      status.replaceChildren("Sorry, that didn't send. Please try again, or email ",
        h("a", { href: "mailto:" + C.brand.email }, C.brand.email), ".");
    });
  }

  function contactChoice(id) {
    var st = steps.filter(function (x) { return x.type === "contact" && x.def.id === id; })[0];
    return st && st.options[contact[id]] || "";
  }

  function buildPayload(results) {
    return {
      submittedAt: new Date().toISOString(),
      source: C.brand.name + " " + C.brand.title,
      contact: {
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        company: contact.company || "",
        email: contact.email || "",
        phone: contact.phone || "",
        areaToLookAt: contactChoice("focus"),
        supplyChainOperates: contactChoice("region"),
      },
      overall: { score: results.overall, level: results.level.label },
      sections: results.pillars.map(function (r) {
        return { section: r.pillar.name, score: r.score, level: r.level.label };
      }),
      answers: C.pillars.reduce(function (all, p) {
        return all.concat(p.questions.map(function (q) {
          var opt = q.options[state.answers[q.id]];
          return { section: p.name, question: q.text, answer: opt ? opt.label : "", score: opt ? opt.score : null };
        }));
      }, []),
    };
  }

  function emailBody(payload) {
    var c = payload.contact;
    var lines = [
      C.brand.title + " — deeper review request", "",
      "Name: " + c.firstName + " " + c.lastName,
      "Company: " + c.company,
      "Email: " + c.email,
      "Phone: " + c.phone,
      "Area to look at: " + c.areaToLookAt,
      "Supply chain operates: " + c.supplyChainOperates, "",
      "Overall score: " + payload.overall.score + "/100 (" + payload.overall.level + ")",
    ];
    payload.sections.forEach(function (sct) { lines.push("- " + sct.section + ": " + sct.score + "% (" + sct.level + ")"); });
    lines.push("", "Answers:");
    payload.answers.forEach(function (a) { lines.push("- " + a.question + " → " + a.answer); });
    return lines.join("\n");
  }

  /* ---------- Scoring ---------- */

  function levelFor(score) {
    var level = C.levels[0];
    C.levels.forEach(function (l) { if (score >= l.min) level = l; });
    return level;
  }

  function computeResults() {
    var pillars = C.pillars.map(function (p) {
      var got = 0, max = 0, weak = [];
      p.questions.forEach(function (q) {
        var scores = q.options.map(function (o) { return o.score; });
        var best = Math.max.apply(null, scores), worst = Math.min.apply(null, scores);
        var opt = q.options[state.answers[q.id]];
        max += best;
        if (opt) {
          got += opt.score;
          // The weaker half of the answers earns a "quick win" tip.
          if (opt.score <= (best + worst) / 2 && q.improve) weak.push({ q: q, opt: opt });
        }
      });
      weak.sort(function (a, b) { return a.opt.score - b.opt.score; });
      var score = max ? Math.round((got / max) * 100) : 0;
      return { pillar: p, got: got, max: max, score: score, level: levelFor(score), weak: weak };
    });
    var totalGot = pillars.reduce(function (sum, r) { return sum + r.got; }, 0);
    var totalMax = pillars.reduce(function (sum, r) { return sum + r.max; }, 0);
    var overall = totalMax ? Math.round((totalGot / totalMax) * 100) : 0;
    return { pillars: pillars, overall: overall, level: levelFor(overall) };
  }

  function lowestPillarIndex() {
    var res = computeResults().pillars, low = 0;
    res.forEach(function (r, i) { if (r.score < res[low].score) low = i; });
    return low;
  }

  function priorities(results) {
    var byScore = results.pillars.slice().sort(function (a, b) { return a.score - b.score; });
    var items = [];
    byScore.forEach(function (r) {
      r.weak.forEach(function (w) {
        items.push({ area: r.pillar.name, text: w.q.improve, rank: w.opt.score * 1000 + r.score });
      });
    });
    items.sort(function (a, b) { return a.rank - b.rank; });
    // Top up with section-level advice when there are fewer than three weak answers.
    byScore.forEach(function (r) {
      var advice = r.pillar.advice[r.level.key];
      if (advice && items.length < 3) items.push({ area: r.pillar.name, text: advice.actions[0] });
    });
    return items.slice(0, 3);
  }

  /* ---------- Render: calculating ---------- */

  function finish() {
    state.view = "calculating";
    saveState();
    updateChrome();
    var labels = ["Scoring your answers", "Comparing across " + C.pillars.length + " areas", "Building your recommendations"];
    var list = h("ul", { class: "calc-steps" }, labels.map(function (l) { return h("li", null, l); }));
    mount(h("section", { class: "card calculating enter" },
      h("div", { class: "spinner", "aria-hidden": "true" }),
      h("h2", null, "Analysing your supply chain…"),
      list), "h2");
    var items = list.querySelectorAll("li");
    var delay = reducedMotion() ? 150 : 650;
    items.forEach(function (li, i) { setTimeout(function () { li.classList.add("done"); }, delay * (i + 1)); });
    setTimeout(function () { go("results"); }, delay * (items.length + 1));
  }

  /* ---------- Render: results ---------- */

  function renderResults() {
    var results = computeResults();
    var sorted = results.pillars.slice().sort(function (a, b) { return b.score - a.score; });
    var strengths = sorted.slice(0, 2);
    var gaps = sorted.slice(-2).reverse();

    var view = h("div", { class: "results" },
      h("img", { class: "print-logo", src: "assets/img/blaiklock-logo-full.jpg", alt: C.brand.name }),
      heroCard(results),
      state.submitted ? thanksBanner() : null,
      h("div", { class: "split" },
        miniPanel("Your strongest areas", strengths),
        miniPanel("Your biggest opportunities", gaps)),
      h("section", { class: "card panel" },
        h("div", { class: "section-head" },
          h("div", null,
            h("h2", null, "Your top 3 priorities"),
            h("p", null, "Based on your answers, these are the changes likely to make the biggest difference first."))),
        h("ol", { class: "priorities" }, priorities(results).map(function (it) {
          return h("li", null, h("div", null, h("div", { class: "priorities__area" }, it.area), h("p", null, it.text)));
        }))),
      breakdownPanel(results, gaps[0]),
      state.submitted ? null : ctaCard(),
      h("div", { class: "card results-actions" },
        h("button", { class: "btn btn--ghost", type: "button", onclick: function () { window.print(); } }, "Download / print my report"),
        h("button", { class: "btn btn--link", type: "button", onclick: function () { go("steps", 0); } }, "Review my answers"),
        h("button", { class: "btn btn--link", type: "button", onclick: restart }, "Retake the check")));

    mount(view, "#result-title");
    animateResults(results);
    bindTooltips();
  }

  function heroCard(results) {
    var level = results.level;
    var R = 92, CIRC = 2 * Math.PI * R;
    var svg = s("svg", { viewBox: "0 0 220 220", "aria-hidden": "true" });
    svg.append(
      s("circle", { class: "gauge__track", cx: 110, cy: 110, r: R }),
      s("circle", {
        class: "gauge__value", cx: 110, cy: 110, r: R, id: "gauge-value",
        stroke: "var(--" + level.status + ")",
        "stroke-dasharray": CIRC, "stroke-dashoffset": CIRC,
      }));

    var bands = C.levels.map(function (l, i) {
      var upper = i < C.levels.length - 1 ? C.levels[i + 1].min : 100;
      return { level: l, width: upper - l.min };
    });

    return h("section", { class: "card hero", "aria-labelledby": "result-title" },
      h("div", { class: "gauge", role: "img", "aria-label": "Resilience score " + results.overall + " out of 100, " + level.label },
        svg,
        h("div", { class: "gauge__center" },
          h("div", { class: "gauge__num" }, h("span", { id: "gauge-num" }, "0"), h("small", null, "/100")),
          h("div", { class: "gauge__cap" }, "Resilience score"))),
      h("div", null,
        h("span", { class: "level-badge status-" + level.status },
          h("span", { class: "level-badge__icon", "aria-hidden": "true" }, level.icon),
          "Your level: " + level.label),
        h("h1", { id: "result-title" }, level.headline),
        h("p", null, level.description),
        h("div", { class: "scale", "aria-hidden": "true" },
          h("div", { class: "scale__bar" },
            bands.map(function (b) {
              return h("div", {
                class: "scale__band status-" + b.level.status + (b.level === level ? "" : " is-dim"),
                style: "flex:" + b.width,
              });
            }),
            h("div", { class: "scale__marker", id: "scale-marker", style: "left:0%" })),
          h("div", { class: "scale__labels" }, bands.map(function (b) {
            return h("span", { class: b.level === level ? "is-current" : "", style: "flex:" + b.width }, b.level.label);
          })))));
  }

  function thanksBanner() {
    var name = contact.firstName;
    return h("section", { class: "card banner", role: "status" },
      h("span", { class: "banner__icon", "aria-hidden": "true" }, "✓"),
      h("p", null, D.thankYou.replace("{name}", name ? ", " + name : "")));
  }

  function miniPanel(title, rows) {
    return h("section", { class: "card panel" },
      h("h3", null, title),
      h("ul", { class: "mini-list" }, rows.map(function (r) {
        return h("li", null,
          pillarIcon(r.pillar),
          h("span", { class: "mini-list__name" }, r.pillar.name),
          chip(r.level),
          h("span", { class: "mini-list__score" }, r.got + "/" + r.max));
      })));
  }

  function chip(level) {
    return h("span", { class: "chip status-" + level.status },
      h("span", { class: "chip__dot", "aria-hidden": "true" }, level.icon), level.label);
  }

  function breakdownPanel(results, openRow) {
    var rows = results.pillars.map(function (r) {
      var advice = r.pillar.advice[r.level.key] || { summary: "", actions: [] };
      var bodyId = "pillar-body-" + r.pillar.id;
      var open = r === openRow;

      var row = h("div", { class: "pillar-row", "data-open": open ? "true" : "false" });
      var head = h("button", {
          class: "pillar-row__head", type: "button", "aria-expanded": open ? "true" : "false", "aria-controls": bodyId,
          "data-tip-title": r.pillar.name,
          "data-tip": r.got + " of " + r.max + " points (" + r.score + "%) · " + r.level.label,
          onclick: function () {
            var isOpen = row.getAttribute("data-open") === "true";
            row.setAttribute("data-open", isOpen ? "false" : "true");
            head.setAttribute("aria-expanded", isOpen ? "false" : "true");
          },
        },
        h("span", { class: "pillar-row__name" }, pillarIcon(r.pillar), r.pillar.name),
        h("span", { class: "bar status-" + r.level.status, "aria-hidden": "true" },
          C.levels.slice(1).map(function (l) { return h("span", { class: "bar__tick", style: "left:" + l.min + "%" }); }),
          h("span", { class: "bar__fill", "data-width": r.score }),
          h("span", { class: "bar__tick bar__tick--avg", style: "left:" + results.overall + "%" })),
        h("span", { class: "pillar-row__score" }, r.got + "/" + r.max),
        chip(r.level),
        h("span", { class: "chevron", "aria-hidden": "true" }, "▾"));

      var body = h("div", { class: "pillar-row__body", id: bodyId },
        h("p", { class: "pillar-row__intro" }, r.pillar.intro),
        h("p", { class: "pillar-row__summary" }, advice.summary),
        h("div", { class: "advice-grid" },
          h("div", { class: "advice-block" },
            h("h4", null, "Recommended next steps"),
            h("ul", null, advice.actions.map(function (a) { return h("li", null, a); }))),
          h("div", { class: "advice-block" },
            h("h4", null, r.weak.length ? "Quick wins from your answers" : "What you're doing well"),
            r.weak.length
              ? r.weak.map(function (w) {
                  return h("div", { class: "quickwin" },
                    h("div", { class: "quickwin__q" }, w.q.text),
                    h("div", { class: "quickwin__a" }, "You said: “" + w.opt.label + "”"),
                    h("div", null, w.q.improve));
                })
              : h("p", null, "You answered strongly on every question in this area. Keep reviewing it regularly so it stays that way."))),
        r.pillar.blaiklockHelp
          ? h("div", { class: "help-note" }, h("strong", null, "How " + C.brand.name + " can help"), r.pillar.blaiklockHelp)
          : null);

      row.append(head, body);
      return row;
    });

    return h("section", { class: "card panel" },
      h("div", { class: "section-head" },
        h("div", null,
          h("h2", null, "Your score by area"),
          h("p", null, "Select an area to see tailored advice based on your answers."))),
      h("div", { class: "breakdown" }, rows),
      h("div", { class: "legend", "aria-hidden": "true" },
        C.levels.map(function (l) {
          return h("span", { class: "status-" + l.status }, h("i"), l.label + " (" + l.min + "%+)");
        }),
        h("span", null, h("i", { class: "avg" }), "Your overall score")));
  }

  function ctaCard() {
    return h("section", { class: "card cta" },
      h("div", null,
        h("h2", null, D.ctaHeading),
        h("p", null, D.ctaText)),
      h("button", {
        class: "btn btn--primary", type: "button",
        onclick: function () { state.fromResults = true; go("steps", FIRST_CONTACT); },
      }, D.ctaButton + " →"));
  }

  function animateResults(results) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var circle = document.getElementById("gauge-value");
        var circ = parseFloat(circle.getAttribute("stroke-dasharray"));
        circle.style.strokeDashoffset = circ * (1 - results.overall / 100);
        document.getElementById("scale-marker").style.left = results.overall + "%";
        app.querySelectorAll(".bar__fill").forEach(function (el) { el.style.width = el.getAttribute("data-width") + "%"; });

        var num = document.getElementById("gauge-num");
        if (reducedMotion()) { num.textContent = results.overall; return; }
        var start = performance.now(), dur = 1300;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          num.textContent = Math.round(results.overall * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    });
  }

  function bindTooltips() {
    app.querySelectorAll("[data-tip]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        tooltip.replaceChildren(h("strong", null, el.getAttribute("data-tip-title")), el.getAttribute("data-tip"));
        tooltip.hidden = false;
        var x = e.clientX + 14, y = e.clientY + 16;
        var w = tooltip.offsetWidth, ht = tooltip.offsetHeight;
        if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
        if (y + ht > window.innerHeight - 8) y = e.clientY - ht - 12;
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
      });
      el.addEventListener("pointerleave", function () { tooltip.hidden = true; });
    });
  }

  /* ---------- Navigation ---------- */

  function go(view, step, direction) {
    tooltip.hidden = true;
    state.view = view;
    if (typeof step === "number") state.step = step;
    saveState();
    updateChrome();
    if (view === "intro") renderIntro();
    else if (view === "steps") renderStep(direction);
    else if (view === "results") renderResults();
  }

  function restart() {
    contact = {};
    state = freshState();
    saveState();
    go("intro");
  }

  document.addEventListener("keydown", function (e) {
    if (state.view !== "steps" || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    var options = app.querySelectorAll(".option");
    var key = e.key.toLowerCase();

    var idx = LETTERS.toLowerCase().indexOf(key);
    if (idx === -1 && /^[1-9]$/.test(key)) idx = parseInt(key, 10) - 1;
    if (idx > -1 && idx < options.length) { e.preventDefault(); options[idx].click(); return; }
    if (key === "arrowleft") { e.preventDefault(); back(); }
    else if (key === "arrowright" && steps[state.step].type === "question") { e.preventDefault(); next(); }
  });

  document.querySelector('[data-action="home"]').addEventListener("click", function (e) {
    e.preventDefault();
    if (state.view === "steps") go("intro");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  go(state.view);
})();
