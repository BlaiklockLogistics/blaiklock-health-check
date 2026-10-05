# GDPR / UK data protection checklist

What the Supply Chain Resilience Check already does, and what Blaiklock still needs to do. This is a practical checklist, not legal advice. Have whoever handles data protection at Blaiklock sign it off.

## Built into the site

| Area | How it's handled |
|---|---|
| **Answers stay private by default** | Scores are calculated in the visitor's browser. Nothing is sent to Blaiklock unless they choose "Yes" to a deeper review and press Submit. |
| **No cookies or tracking** | No cookies, analytics, tracking pixels or third-party scripts, so no cookie banner is needed (PECR). |
| **No third-party requests on page load** | Montserrat is self-hosted (`assets/fonts/`) instead of loaded from Google Fonts, which would send visitors' IP addresses to Google. Tested: the page makes no outside requests until Submit. |
| **Browser storage** | Quiz progress is kept in *session* storage (cleared when the tab closes) so a refresh doesn't lose answers. That's strictly necessary for the service the visitor asked for, so no consent is needed. Contact details are never stored in the browser. |
| **Data minimisation** | Only name, company, email, optional phone, area of interest and region are collected. |
| **Transparency** | Privacy notice at `privacy.html`, linked from the footer and the Submit step. It names Blaiklock Limited (05161195) as controller and links to the main policy at blaiklock.uk.com/privacy-policy. |
| **Lawful basis** | Responding to the review request: legitimate interests / steps before a contract. Newsletter: consent. |
| **Newsletter consent (PECR)** | Separate, optional, **unticked** box naming the monthly newsletter. Submission emails show "Monthly newsletter: Yes - signed up" or "No". |
| **Processors** | Formspree (DPA accepted), Microsoft 365 and Mailchimp (newsletter), all named in the privacy notice. |
| **Retention** | 24 months for review requests; Formspree submissions deleted within 30 days; newsletter list until unsubscribe. |
| **Security** | Served over HTTPS (GitHub Pages) and submitted over HTTPS to Formspree. |

## Still to do

- [ ] **ICO registration.** No entry was found for Blaiklock on the ICO register. Most UK businesses that handle personal data must pay the annual data protection fee. Check by searching the company number (05161195) as well as the name, and if there's no entry, use the ICO's self-assessment at ico.org.uk/for-organisations/data-protection-fee and register. Then add the registration number to `privacy.html` under "Who we are".
- [ ] **Mailchimp data processing agreement.** Mailchimp's DPA is part of its standard terms. Check it applies to your account (Account → Settings, or Mailchimp's legal pages), as the privacy notice says one is in place.
- [ ] **Newsletter list.** Only add people to Mailchimp whose submission says "Monthly newsletter: Yes - signed up". When adding them, note the source (e.g. a "Resilience Check" tag) and date so you can show when and how they signed up. Mailchimp adds an unsubscribe link to every newsletter automatically; don't remove it.
- [ ] **Formspree clean-up.** Delete submissions from the Formspree dashboard within 30 days of them reaching the inbox, as the privacy notice promises.
- [ ] **24-month clean-up.** Delete review requests from Microsoft 365 that are more than 24 months past last contact (unless they became customers).
- [ ] **Main privacy policy.** Check that blaiklock.uk.com/privacy-policy is consistent with this notice (e.g. company name and contact email).
- [ ] **Data requests.** Make sure whoever monitors info@blaiklock.uk.com knows to pass on data requests (one-month deadline).
