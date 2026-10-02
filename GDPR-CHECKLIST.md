# GDPR / UK data protection checklist

What the Supply Chain Resilience Check already does, and what Blaiklock needs to confirm or do before going live. This is a practical checklist, not legal advice. Have whoever handles data protection at Blaiklock sign it off.

## Built into the site

| Area | How it's handled |
|---|---|
| **Answers stay private by default** | Scores are calculated in the visitor's browser. Nothing is sent to Blaiklock unless they choose "Yes" to a deeper review and press Submit. |
| **No cookies or tracking** | No cookies, analytics, tracking pixels or third-party scripts, so no cookie banner is needed (PECR). |
| **No third-party requests on page load** | Montserrat is self-hosted (`assets/fonts/`) instead of loaded from Google Fonts, which transfers visitors' IP addresses to Google; a German court ruled that a GDPR breach in 2022. Tested: the page makes no outside requests until Submit. |
| **Browser storage** | Quiz progress is kept in *session* storage (cleared when the tab closes) so a refresh doesn't lose answers. That's strictly necessary for the service the visitor asked for, so no consent is needed. Contact details are never stored in the browser. |
| **Data minimisation** | Only name, company, email, optional phone, area of interest and region are collected. Phone is optional. |
| **Transparency** | Privacy notice at `privacy.html`, linked from the footer and from the Submit step. |
| **Lawful basis** | Responding to the review request: legitimate interests / steps at the person's request before a contract. Marketing: consent. |
| **Marketing consent (PECR)** | Separate, optional, **unticked** tick box. The submission email shows "Marketing emails: Yes - opted in" or "No". Only email people marketing if it says Yes. |
| **Security** | Served over HTTPS (GitHub Pages) and submitted over HTTPS to Formspree. |

## Blaiklock to confirm or do

- [ ] **Fill in the highlighted gaps in `privacy.html`**: legal entity name, company number, registered address, ICO registration number, email provider, and retention periods. Or point `brand.privacyUrl` in `assets/config.js` at Blaiklock's existing website privacy policy, if that policy covers this tool.
- [ ] **ICO registration**: check Blaiklock has paid the ICO data protection fee (most UK businesses that handle personal data must). Search the register at ico.org.uk.
- [ ] **Formspree data processing agreement**: Formspree stores submissions in the USA. Accept or download Formspree's DPA, and confirm which UK transfer safeguard applies (UK Extension to the EU–US Data Privacy Framework, or the UK International Data Transfer Addendum). Update the "Who we share it with" section to match.
- [ ] **Retention**: decide how long review requests are kept (e.g. 24 months after last contact). Delete submissions from the Formspree dashboard regularly once they've reached your inbox or CRM.
- [ ] **Record of processing**: add "Supply Chain Resilience Check enquiries" to Blaiklock's record of processing activities, if you keep one.
- [ ] **Marketing list**: only add people who ticked the box. Include an unsubscribe link in every marketing email.
- [ ] **Subject access and deletion**: make sure whoever monitors info@blaiklock.uk.com knows to pass on data requests (one-month deadline).
