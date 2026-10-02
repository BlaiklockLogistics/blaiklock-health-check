# Blaiklock Supply Chain Health Check

An interactive supply chain health check for Blaiklock International Logistics. Respondents answer one question at a time, then get:

- an **overall score out of 100** with a maturity level (Vulnerable → Reactive → Proactive → Resilient)
- a **score for each of the six areas**, so they can see where they're strong and where they're exposed
- their **top 3 priorities**, picked from their weakest answers
- **tailored advice for each area**: next steps for their level, "quick wins" tied to the answers they gave, and how Blaiklock can help
- a **"deeper dive" contact form** that sends their details, answers and scores to Blaiklock
- a printable / PDF version of their report

It's a static site (HTML, CSS and JavaScript only), so there's no build step and no server code.

## Files

| File | What it's for |
|---|---|
| `index.html` | Page shell |
| `assets/config.js` | **All content**: questions, answer scores, levels, advice, contact-form settings |
| `assets/app.js` | Flow, scoring and rendering (you shouldn't need to edit this) |
| `assets/styles.css` | Styling. Brand colours are the `--brand` / `--accent` variables at the top |

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also open `index.html` directly in a browser.

## Editing the questions and advice

Everything is in `assets/config.js`:

- **`profile`**: unscored "about you" questions asked first.
- **`pillars`**: the scored sections. Each question has `options` with a `score` from 0 (weakest) to 3 (strongest), plus an `improve` tip that appears as a "quick win" when someone picks an answer scoring 0 or 1.
- **`pillars[].advice`**: a summary and next steps for each level (`vulnerable`, `reactive`, `proactive`, `resilient`).
- **`levels`**: score bands and the headline and description shown for each.

Scoring: each section's score is the percentage of the maximum points available in that section. The overall score is the average of the section scores.

## Receiving the "deeper dive" submissions

Set `submission.endpoint` in `assets/config.js` to any URL that accepts a JSON `POST`, for example:

- [Formspree](https://formspree.io) (emails each submission to you)
- a Zapier, Make or Power Automate webhook (forward to email, a CRM, a spreadsheet, etc.)
- your CRM's web-form endpoint

The payload contains the contact details, the "about you" answers, the overall and per-section scores, and every answer.

If `endpoint` is left empty, the form opens the respondent's email app with a pre-filled email to `submission.fallbackEmail`. That's fine for testing, but set up an endpoint before going live.

## Hosting

Upload the folder to any web host, or turn on GitHub Pages for this repo. To embed it on the Blaiklock website:

```html
<iframe src="https://YOUR-HOST/index.html" style="width:100%;height:900px;border:0" title="Supply Chain Health Check"></iframe>
```

Progress is saved in the visitor's browser, so a refresh doesn't lose their answers.
