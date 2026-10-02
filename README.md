# Blaiklock Supply Chain Resilience Check

An interactive version of Blaiklock's Supply Chain Resilience Check. It uses the same 10 questions as the original Jotform, but instead of a single score with a generic paragraph, respondents get:

- an **overall resilience score out of 100** with a maturity level (Vulnerable → Reactive → Proactive → Resilient)
- a **score for each of the five areas** (Visibility & Tracking, Contingency Planning, Customs & Compliance, Transport Flexibility, Operational Control), showing where they're strong and where they're exposed
- their **top 3 priorities**, picked from their weakest answers
- **tailored advice for each area**: next steps for their level, "quick wins" tied to the answers they gave, and how Blaiklock can help
- a printable / PDF version of their report

## Flow

1. Intro: "10 questions. Around 3 minutes. Instant results."
2. 10 questions, one per screen, two per area
3. "Your assessment is complete! Would you like a deeper review?"
   - **Yes:** Name → Company → Email → Phone (optional) → Which area to look at → Where the supply chain operates → Submit → results
   - **No thanks:** straight to results. The results page still offers a "Would you like a deeper review?" button that leads into the same contact steps.

It's a static site (HTML, CSS and JavaScript only), so there's no build step and no server code.

## Files

| File | What it's for |
|---|---|
| `index.html` | Page shell |
| `assets/config.js` | **All content**: questions, answer scores, levels, advice, contact steps, where submissions go |
| `assets/app.js` | Flow, scoring and rendering (you shouldn't need to edit this) |
| `assets/styles.css` | Styling. Brand colours are the `--brand`, `--accent` and `--grad-*` variables at the top |
| `assets/img/blaiklock-logo.png` | The "B" mark used in the header and browser tab |
| `assets/img/blaiklock-logo-full.jpg` | Full logo with wordmark, shown at the top of the printed / PDF report |

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Editing the questions and advice

Everything is in `assets/config.js`:

- **`pillars`**: the five areas. Each question's answers go from strongest to weakest, scoring 4, 3, 2, 1, so each area is out of 8. Each question also has an `improve` tip that appears as a "quick win" when someone picks one of the two weakest answers (1 or 2 points).
- **`pillars[].advice`**: a summary and next steps for each level (`vulnerable`, `reactive`, `proactive`, `resilient`).
- **`pillars[].blaiklockHelp`**: the "How Blaiklock can help" note for each area.
- **`levels`**: score bands and the headline and description shown for each.
- **`deepDive`**: the "deeper review?" question, contact steps, and thank-you text.

Scoring: each area is scored out of 8 (two questions, 1–4 points each). The overall score is total points out of 40, shown out of 100, so the lowest possible score is 25/100. Levels: Vulnerable below 40, Reactive 40+, Proactive 60+, Resilient 80+.

## Receiving the "deeper review" submissions

Submissions currently go to the Formspree form `https://formspree.io/f/mzezlbpa`, which emails info@blaiklock.uk.com. Each email has the person's name, company and score in the subject. It lists their contact details, the area they want looked at, where their supply chain operates, their overall and per-area scores, and every answer. Replying to the email goes straight to the person who submitted it. Manage the form, spam settings and the destination address in the Formspree dashboard. The free plan allows 50 submissions a month.

To send submissions somewhere else, set `submission.endpoint` in `assets/config.js` to any URL that accepts a JSON `POST`, for example:

- [Formspree](https://formspree.io) (emails each submission to you)
- a Zapier, Make or Power Automate webhook (forward to email, a CRM, a spreadsheet, etc.)
- your CRM's web-form endpoint

The payload contains the contact details, the area they want looked at, where their supply chain operates, the overall and per-area scores, and every answer.

If `endpoint` is left empty, submitting opens the respondent's email app with a pre-filled email to `submission.fallbackEmail`. That's fine for testing, but set up an endpoint before going live.

Contact details are never saved in the browser; only the quiz answers are, so a refresh doesn't lose progress.

## Hosting

Upload the folder to any web host, or turn on GitHub Pages for this repo. To embed it on the Blaiklock website:

```html
<iframe src="https://YOUR-HOST/index.html" style="width:100%;height:900px;border:0" title="Supply Chain Resilience Check"></iframe>
```
