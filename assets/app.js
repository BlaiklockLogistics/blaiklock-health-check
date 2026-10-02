/* Blaiklock Supply Chain Health Check — application logic.
   Content lives in config.js; this file only handles flow, scoring and rendering. */
(function () {
  "use strict";

  var C = window.HEALTH_CHECK_CONFIG;
  var STORAGE_KEY = "blaiklock-health-check-v1";
  var LETTERS = "ABCDEFGH";
  var app = document.getElementById("app");
  var tooltip = document.getElementById("tooltip");

  /* ---------- Steps ---------- */

  var steps = [];
  C.profile.forEach(function (q, i) {
    steps.push({ type: "profile", segment: 0, q: q, index: i });
  });
  C.pillars.forEach(function (p, pi) {
    steps.push({ type: "section", segment: pi + 1, pillar: p, pillarIndex: pi });
    p.questions.forEach(function (q, qi) {
      steps.push({ type: "question", segment: pi + 1, pillar: p, pillarIndex: pi, q: q, index: qi });
    });
  });
  var questionSteps = steps.filter(function (s) { return s.type !== "section"; });
  var segments = [{ label: "About you" }].concat(C.pillars.map(function (p) { return { label: p.name }; }));

  /* ---------- State ---------- */

  function freshState() {
    return { view: "intro", step: 0, answers: {}, profile: {}, submitted: false };
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!s || typeof s !== "object") return null;
      s.answers = s.answers || {};
      s.profile = s.profile || {};
      // Drop answers that no longer fit the current config (questions edited since).
      steps.forEach(function (st) {
        if (st.type === "question" && !st.q.options[s.answers[st.q.id]]) delete s.answers[st.q.id];
        if (st.type === "profile" && st.q.options[s.profile[st.q.id]] === undefined) delete s.profile[st.q.id];
      });
      if (typeof s.step !== "number" || s.step < 0 || s.step >= steps.length) s.step = 0;
      if (s.view === "results" || s.view === "calculating") s.view = allAnswered() ? "results" : "intro";
      if (s.view !== "steps" && s.view !== "results") s.view = "intro";
      return s;
    } catch (e) {
      return null;
    }
    function allAnswered() {
      return questionSteps.every(function (st) { return getAnswer(st, s) !== undefined; });
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  var state = loadState() || freshState();

  function getAnswer(step, s) {
    s = s || state;
    if (step.type === "profile") return s.profile[step.q.id];
    if (step.type === "question") return s.answers[step.q.id];
    return undefined;
  }

  function setAnswer(step, value) {
    if (step.type === "profile") state.profile[step.q.id] = value;
    else state.answers[step.q.id] = value;
    saveState();
  }

  function hasProgress() {
    return Object.keys(state.answers).length > 0 || Object.keys(state.profile).length > 0;
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
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }

  function pillarIcon(p) {
    return h("span", { class: "pillar-icon", "aria-hidden": "true" }, p.icon || p.name.charAt(0));
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
      var inSeg = questionSteps.filter(function (st) { return st.segment === i; });
      var done = current
        ? inSeg.filter(function (st) { return steps.indexOf(st) < state.step; }).length
        : inSeg.length;
      var pct = inSeg.length ? (done / inSeg.length) * 100 : 100;
      var isCurrent = current && current.segment === i;
      return h("div", { class: "progress__seg" + (isCurrent ? " is-current" : "") },
        h("div", { class: "progress__bar" }, h("div", { class: "progress__fill", style: "width:" + pct + "%" })),
        h("div", { class: "progress__label" }, seg.label));
    }));

    if (current && current.type !== "section") {
      meta.textContent = "Question " + (questionSteps.indexOf(current) + 1) + " of " + questionSteps.length;
    } else if (current) {
      meta.textContent = "Section " + (current.pillarIndex + 1) + " of " + C.pillars.length;
    } else {
      meta.textContent = "Your results";
    }
  }

  /* ---------- Render: intro ---------- */

  function renderIntro() {
    var minutes = Math.max(3, Math.round(questionSteps.length * 0.25));
    var resume = hasProgress() && state.view !== "results";

    var view = h("section", { class: "intro enter" },
      h("div", null,
        h("span", { class: "eyebrow" }, "Free assessment"),
        h("h1", null, "How healthy is your supply chain?"),
        h("p", { class: "intro__lead" },
          "Answer " + questionSteps.length + " quick questions across " + C.pillars.length +
          " areas of your supply chain. You'll get an instant score, see exactly where you're strong and where you're exposed, and get tailored advice from Blaiklock on how to improve."),
        h("ul", { class: "intro__facts" },
          h("li", null, "Takes around " + minutes + " minutes"),
          h("li", null, "Instant, personalised results"),
          h("li", null, "No sign-up needed")),
        h("div", { class: "intro__actions" },
          resume
            ? [
                h("button", { class: "btn btn--primary", type: "button", onclick: function () { go("steps", state.step); } }, "Continue where you left off →"),
                h("button", { class: "btn btn--ghost", type: "button", onclick: restart }, "Start again"),
              ]
            : h("button", { class: "btn btn--primary", type: "button", onclick: function () { go("steps", 0); } }, "Start the health check →")),
        resume ? h("p", { class: "resume-note" }, "We've saved your progress on this device.") : null),
      h("aside", { class: "card intro__panel" },
        h("h2", null, "What we'll look at"),
        h("ul", { class: "pillar-list" }, C.pillars.map(function (p, i) {
          return h("li", { style: "animation-delay:" + (i * 60) + "ms" }, pillarIcon(p), p.name);
        }))));

    mount(view, "h1");
  }

  /* ---------- Render: steps ---------- */

  var advancing = false;

  function renderStep(direction) {
    var step = steps[state.step];
    var anim = direction === "back" ? "enter-back" : "enter";
    advancing = false;

    if (step.type === "section") {
      var p = step.pillar;
      mount(h("section", { class: "stage" },
        h("div", { class: "card section-intro " + anim },
          pillarIcon(p),
          h("div", { class: "section-intro__step" }, "Section " + (step.pillarIndex + 1) + " of " + C.pillars.length),
          h("h2", null, p.name),
          h("p", null, p.intro),
          h("button", { class: "btn btn--primary", type: "button", onclick: next },
            "Start section · " + p.questions.length + " questions →")),
        navRow(step, true)), "h2");
      return;
    }

    var q = step.q;
    var selected = getAnswer(step);
    var labels = step.type === "profile"
      ? q.options
      : q.options.map(function (o) { return o.label; });
    var context = step.type === "profile"
      ? [h("strong", null, "About you")]
      : [pillarIcon(step.pillar), h("span", null, h("strong", null, step.pillar.name), " · Question " + (step.index + 1) + " of " + step.pillar.questions.length)];

    var options = h("div", { class: "options", role: "radiogroup", "aria-labelledby": "q-title" },
      labels.map(function (label, i) {
        return h("button", {
          class: "option", type: "button", role: "radio",
          "aria-checked": selected === i ? "true" : "false",
          "data-index": i,
          onclick: function () { choose(i); },
        }, h("span", { class: "option__key", "aria-hidden": "true" }, LETTERS[i]), h("span", null, label));
      }));

    mount(h("section", { class: "stage " + anim },
      h("div", { class: "q-meta" }, context),
      h("h2", { class: "q-title", id: "q-title" }, q.text),
      options,
      navRow(step, selected !== undefined)), "#q-title");
  }

  function navRow(step, canContinue) {
    return h("div", { class: "q-nav" },
      h("button", { class: "btn btn--link", type: "button", onclick: back }, "← Back"),
      step.type === "section"
        ? h("span")
        : h("span", { class: "q-hint" }, "Tip: press ", h("kbd", null, "A"), "–", h("kbd", null, LETTERS[step.q.options.length - 1]), " to answer"),
      step.type === "section"
        ? h("span")
        : h("button", { class: "btn btn--ghost", type: "button", disabled: !canContinue, onclick: next }, "Next →"));
  }

  function choose(i) {
    if (advancing) return;
    var step = steps[state.step];
    if (step.type === "section" || i >= step.q.options.length) return;
    setAnswer(step, i);
    advancing = true;
    app.querySelectorAll(".option").forEach(function (btn, j) {
      btn.setAttribute("aria-checked", j === i ? "true" : "false");
      if (j === i) btn.classList.add("is-picked");
    });
    setTimeout(next, 340);
  }

  function next() {
    var step = steps[state.step];
    if (step.type !== "section" && getAnswer(step) === undefined) return;
    if (state.step < steps.length - 1) go("steps", state.step + 1);
    else finish();
  }

  function back() {
    if (state.step > 0) go("steps", state.step - 1, "back");
    else go("intro");
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
        var best = Math.max.apply(null, q.options.map(function (o) { return o.score; }));
        var opt = q.options[state.answers[q.id]];
        max += best;
        if (opt) {
          got += opt.score;
          if (opt.score <= 1 && q.improve) weak.push({ q: q, opt: opt });
        }
      });
      weak.sort(function (a, b) { return a.opt.score - b.opt.score; });
      var score = max ? Math.round((got / max) * 100) : 0;
      return { pillar: p, got: got, max: max, score: score, level: levelFor(score), weak: weak };
    });
    var overall = Math.round(pillars.reduce(function (sum, r) { return sum + r.score; }, 0) / pillars.length);
    return { pillars: pillars, overall: overall, level: levelFor(overall) };
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
    mount(h("section", { class: "calculating enter" },
      h("div", { class: "spinner", "aria-hidden": "true" }),
      h("h2", null, "Analysing your supply chain…"),
      list), "h2");
    var items = list.querySelectorAll("li");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var delay = reduce ? 150 : 650;
    items.forEach(function (li, i) { setTimeout(function () { li.classList.add("done"); }, delay * (i + 1)); });
    setTimeout(function () { go("results"); }, delay * (items.length + 1));
  }

  /* ---------- Render: results ---------- */

  function renderResults() {
    var results = computeResults();
    var sorted = results.pillars.slice().sort(function (a, b) { return b.score - a.score; });
    var strengths = sorted.slice(0, 2);
    var gaps = sorted.slice(-2).reverse();
    var weakest = gaps[0];

    var view = h("div", { class: "results" },
      heroCard(results),
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
      breakdownPanel(results, weakest),
      deepDive(results, weakest),
      h("div", { class: "results-actions" },
        h("button", { class: "btn btn--ghost", type: "button", onclick: function () { window.print(); } }, "Download / print my report"),
        h("button", { class: "btn btn--link", type: "button", onclick: function () { go("steps", 0); } }, "Review my answers"),
        h("button", { class: "btn btn--link", type: "button", onclick: restart }, "Retake the health check")));

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
      h("div", { class: "gauge", role: "img", "aria-label": "Overall score " + results.overall + " out of 100, " + level.label },
        svg,
        h("div", { class: "gauge__center" },
          h("div", { class: "gauge__num" }, h("span", { id: "gauge-num" }, "0"), h("small", null, "/100")),
          h("div", { class: "gauge__cap" }, "Overall health score"))),
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

  function miniPanel(title, rows) {
    return h("section", { class: "card panel" },
      h("h3", null, title),
      h("ul", { class: "mini-list" }, rows.map(function (r) {
        return h("li", null,
          pillarIcon(r.pillar),
          h("span", { class: "mini-list__name" }, r.pillar.name),
          chip(r.level),
          h("span", { class: "mini-list__score" }, r.score + "%"));
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
          "data-tip": r.score + "% · " + r.level.label + " · " + r.got + " of " + r.max + " points",
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
        h("span", { class: "pillar-row__score" }, r.score + "%"),
        chip(r.level),
        h("span", { class: "chevron", "aria-hidden": "true" }, "▾"));

      var body = h("div", { class: "pillar-row__body", id: bodyId },
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
          ? h("div", { class: "help-note" }, h("strong", null, "How Blaiklock can help"), r.pillar.blaiklockHelp)
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

  function animateResults(results) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var circle = document.getElementById("gauge-value");
        var circ = parseFloat(circle.getAttribute("stroke-dasharray"));
        circle.style.strokeDashoffset = circ * (1 - results.overall / 100);
        document.getElementById("scale-marker").style.left = results.overall + "%";
        app.querySelectorAll(".bar__fill").forEach(function (el) { el.style.width = el.getAttribute("data-width") + "%"; });

        var num = document.getElementById("gauge-num");
        if (reduce) { num.textContent = results.overall; return; }
        var start = performance.now(), dur = 1300;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          num.textContent = Math.round(results.overall * eased);
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

  /* ---------- Deep dive (lead capture) ---------- */

  function deepDive(results, weakest) {
    var D = C.deepDive;
    var wrap = h("section", { class: "card deepdive", id: "deep-dive", "aria-labelledby": "deepdive-title" });
    var intro = h("div", { class: "deepdive__intro" },
      h("h2", { id: "deepdive-title" }, D.heading),
      h("p", null, D.text),
      h("ul", null, D.benefits.map(function (b) { return h("li", null, b); })));

    if (state.submitted) {
      wrap.append(intro, thanks(D.thankYou));
      return wrap;
    }

    function field(name, label, opts) {
      opts = opts || {};
      var id = "f-" + name;
      var control;
      if (opts.type === "select") {
        control = h("select", { id: id, name: name, required: opts.required },
          opts.options.map(function (o) { return h("option", { value: o, selected: o === opts.value }, o); }));
      } else if (opts.type === "textarea") {
        control = h("textarea", { id: id, name: name, placeholder: opts.placeholder });
      } else {
        control = h("input", {
          id: id, name: name, type: opts.type || "text", required: opts.required,
          autocomplete: opts.autocomplete, placeholder: opts.placeholder,
        });
      }
      return h("div", { class: "field" + (opts.full ? " field--full" : "") },
        h("label", { for: id }, label, opts.required ? h("span", { class: "req", "aria-hidden": "true" }, " *") : null),
        control,
        h("div", { class: "field__error", id: id + "-error", "aria-live": "polite" }));
    }

    var focusOptions = C.pillars.map(function (p) { return p.name; }).concat(["A full supply chain review"]);
    var status = h("p", { class: "form__status", "aria-live": "polite" });
    var form = h("form", { class: "form", novalidate: true },
      field("firstName", "First name", { required: true, autocomplete: "given-name" }),
      field("lastName", "Last name", { required: true, autocomplete: "family-name" }),
      field("email", "Work email", { required: true, type: "email", autocomplete: "email" }),
      field("phone", "Phone number", { type: "tel", autocomplete: "tel" }),
      field("company", "Company", { required: true, autocomplete: "organization" }),
      field("jobTitle", "Job title", { autocomplete: "organization-title" }),
      field("focus", "What would you most like help with?", { type: "select", options: focusOptions, value: weakest.pillar.name, full: true }),
      field("message", "Anything else we should know? (optional)", { type: "textarea", full: true, placeholder: "e.g. your main trade lanes, products, or a current challenge" }),
      h("input", { class: "hp", type: "text", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
      h("div", { class: "field field--full" },
        h("label", { class: "check" },
          h("input", { type: "checkbox", name: "consent", id: "f-consent", required: true }),
          h("span", null, "I agree to Blaiklock contacting me about my results and storing my details for this purpose.")),
        h("div", { class: "field__error", id: "f-consent-error", "aria-live": "polite" })),
      h("div", { class: "form__actions" },
        h("button", { class: "btn btn--primary", type: "submit" }, "Book my free review →"),
        status));

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      if (form.elements.website.value) return; // honeypot: silently ignore bots
      submitLead(form, results, status, function (usedEmailClient) {
        state.submitted = true;
        saveState();
        wrap.replaceChildren(intro, thanks(usedEmailClient
          ? "Your email app should have opened with your details and results — just press send and a member of the Blaiklock team will be in touch."
          : D.thankYou));
        wrap.querySelector(".thanks h3").focus();
      });
    });

    wrap.append(intro, form);
    return wrap;
  }

  function thanks(text) {
    return h("div", { class: "thanks" },
      h("div", { class: "thanks__icon", "aria-hidden": "true" }, "✓"),
      h("h3", { tabindex: "-1" }, "Thanks — we've got your details"),
      h("p", null, text));
  }

  function validate(form) {
    var ok = true, firstBad = null;
    var checks = {
      firstName: function (v) { return v.trim() ? "" : "Please enter your first name."; },
      lastName: function (v) { return v.trim() ? "" : "Please enter your last name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      company: function (v) { return v.trim() ? "" : "Please enter your company name."; },
    };
    Object.keys(checks).forEach(function (name) {
      var input = form.elements[name];
      var msg = checks[name](input.value);
      setError(input, msg);
      if (msg) { ok = false; firstBad = firstBad || input; }
    });
    var consent = form.elements.consent;
    var consentMsg = consent.checked ? "" : "Please tick to let us contact you.";
    setError(consent, consentMsg);
    if (consentMsg) { ok = false; firstBad = firstBad || consent; }
    if (firstBad) firstBad.focus();
    return ok;
  }

  function setError(input, msg) {
    var fieldEl = input.closest(".field");
    fieldEl.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    input.setAttribute("aria-describedby", input.id + "-error");
    document.getElementById(input.id + "-error").textContent = msg;
  }

  function buildPayload(form, results) {
    var el = form.elements;
    return {
      submittedAt: new Date().toISOString(),
      source: "Blaiklock Supply Chain Health Check",
      contact: {
        firstName: el.firstName.value.trim(),
        lastName: el.lastName.value.trim(),
        email: el.email.value.trim(),
        phone: el.phone.value.trim(),
        company: el.company.value.trim(),
        jobTitle: el.jobTitle.value.trim(),
        focus: el.focus.value,
        message: el.message.value.trim(),
        consent: el.consent.checked,
      },
      profile: C.profile.map(function (q) {
        return { question: q.text, answer: q.options[state.profile[q.id]] || "" };
      }),
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
      "Supply Chain Health Check — deeper dive request", "",
      "Name: " + c.firstName + " " + c.lastName,
      "Company: " + c.company,
      "Job title: " + c.jobTitle,
      "Email: " + c.email,
      "Phone: " + c.phone,
      "Wants help with: " + c.focus,
      "Message: " + c.message, "",
      "Overall score: " + payload.overall.score + "/100 (" + payload.overall.level + ")",
    ];
    payload.sections.forEach(function (sct) { lines.push("- " + sct.section + ": " + sct.score + "% (" + sct.level + ")"); });
    lines.push("");
    payload.profile.forEach(function (p) { lines.push(p.question + " " + p.answer); });
    return lines.join("\n");
  }

  function submitLead(form, results, status, done) {
    var payload = buildPayload(form, results);
    var endpoint = C.submission && C.submission.endpoint;
    var button = form.querySelector('button[type="submit"]');

    if (!endpoint) {
      var to = (C.submission && C.submission.fallbackEmail) || C.brand.email;
      window.location.href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent("Supply Chain Health Check — " + payload.contact.company) +
        "&body=" + encodeURIComponent(emailBody(payload));
      done(true);
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
      done(false);
    }).catch(function () {
      button.disabled = false;
      status.className = "form__status is-error";
      status.replaceChildren("Sorry, something went wrong sending your details. Please try again, or email us at ",
        h("a", { href: "mailto:" + C.brand.email }, C.brand.email), ".");
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
    state = freshState();
    saveState();
    go("intro");
  }

  document.addEventListener("keydown", function (e) {
    if (state.view !== "steps" || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    var step = steps[state.step];
    var key = e.key.toLowerCase();

    if (step.type !== "section") {
      var idx = LETTERS.toLowerCase().indexOf(key);
      if (idx === -1 && /^[1-9]$/.test(key)) idx = parseInt(key, 10) - 1;
      if (idx > -1 && idx < step.q.options.length) { e.preventDefault(); choose(idx); return; }
    }
    if (key === "enter" && tag !== "button") { e.preventDefault(); next(); }
    else if (key === "arrowright" && (step.type === "section" || getAnswer(step) !== undefined)) { e.preventDefault(); next(); }
    else if (key === "arrowleft") { e.preventDefault(); back(); }
  });

  document.querySelector('[data-action="home"]').addEventListener("click", function (e) {
    e.preventDefault();
    if (state.view === "steps") go("intro");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  go(state.view);
})();
