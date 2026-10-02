/*
 * Blaiklock Supply Chain Resilience Check — content & scoring configuration
 * -------------------------------------------------------------------------
 * Everything a non-developer may want to change lives in this file:
 *   - brand details and contact info
 *   - where the "deeper review" contact details are sent
 *   - the maturity levels (score bands)
 *   - the sections ("pillars"), their questions, answer options and scores
 *   - the tailored advice shown on the results page
 *   - the "deeper review" question and contact steps
 *
 * Scoring: every answer option has a `score` from 1 (weakest) to 4 (strongest),
 * so each two-question section is out of 8. The overall score is total points
 * as a percentage of the maximum (40 points = 100).
 *
 * Per-question `improve` text is shown on the results page as a "quick win"
 * whenever the respondent picks one of the two weakest answers (1 or 2 points).
 */
window.HEALTH_CHECK_CONFIG = {
  brand: {
    name: "Blaiklock",
    title: "Supply Chain Resilience Check",
    tagline: "10 questions. Around 3 minutes. Instant results.",
    logo: "assets/img/blaiklock-logo.png",
    email: "info@blaiklock.uk.com",
  },

  // Where the "deeper review" contact details are sent.
  //   endpoint: a URL that accepts a JSON POST (Formspree, Zapier/Make webhook,
  //             Power Automate HTTP trigger, your CRM, etc.). The payload holds
  //             the contact details, every answer and every score.
  //   Leave endpoint empty to fall back to opening an email to `fallbackEmail`.
  submission: {
    endpoint: "",
    fallbackEmail: "info@blaiklock.uk.com",
  },

  // Score bands, lowest first. `status` controls colour: critical | serious | warning | good
  levels: [
    {
      key: "vulnerable", label: "Vulnerable", min: 0, status: "critical", icon: "!",
      headline: "Your supply chain is exposed to disruption.",
      description: "Key parts of your supply chain rely on reacting after problems appear. A delay, a route closure or a regulatory change is likely to reach your operation and your customers before you can respond. The good news: the biggest gains are quick to unlock from here.",
    },
    {
      key: "reactive", label: "Reactive", min: 40, status: "serious", icon: "▲",
      headline: "You cope with disruption, but mostly after it happens.",
      description: "You have some good foundations in place, but issues are often spotted late and handled by firefighting. Greater visibility, clearer ownership and stronger contingency planning would reduce both cost and pressure on your team.",
    },
    {
      key: "proactive", label: "Proactive", min: 60, status: "warning", icon: "●",
      headline: "You're well prepared, with some gaps to close.",
      description: "Your supply chain is in good shape and you anticipate many issues before they land. Closing the remaining gaps will help you respond faster and more confidently when conditions change.",
    },
    {
      key: "resilient", label: "Resilient", min: 80, status: "good", icon: "✓",
      headline: "Your supply chain is resilient and well run.",
      description: "You have strong visibility, clear ownership and real flexibility in how you move goods. The focus now is on keeping it that way as routes, regulations, suppliers and customer demands evolve.",
    },
  ],

  pillars: [
    {
      id: "visibility",
      name: "Visibility & Tracking",
      icon: "◎",
      intro: "How quickly you know what's happening to your shipments, and how reliable that information is.",
      questions: [
        {
          id: "q1",
          text: "If a critical shipment was delayed today, how quickly would you know?",
          options: [
            { label: "Almost immediately", score: 4 },
            { label: "Within a few hours", score: 3 },
            { label: "Usually once our team or logistics provider flags it", score: 2 },
            { label: "Sometimes only after the delay has started affecting the operation", score: 1 },
          ],
          improve: "Agree exception alerts with your logistics partner so a delay on a critical shipment is flagged the same day it happens — not once it has started affecting your operation.",
        },
        {
          id: "q2",
          text: "How confident are you that you have accurate, up-to-date information across your most important shipments?",
          options: [
            { label: "Very confident - we have clear visibility across critical movements", score: 4 },
            { label: "Mostly confident - information is usually available when we need it", score: 3 },
            { label: "It varies depending on the route, provider or shipment", score: 2 },
            { label: "We regularly need to chase for updates", score: 1 },
          ],
          improve: "Identify your most critical shipments and agree a standard set of milestone updates for them (booked, departed, arrived, cleared, delivered), so accurate information is in one place without chasing.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "You're often finding out about problems after they've already hit.",
          actions: [
            "List your most critical shipments and agree milestone updates for each one with your provider.",
            "Name one person responsible for monitoring critical movements each day.",
            "Start recording expected vs actual arrival dates so you can see your real lead times.",
          ],
        },
        reactive: {
          summary: "You can get the information you need, but it takes effort and often comes late.",
          actions: [
            "Move from chasing updates to receiving them: agree a standard update schedule with your provider.",
            "Set up exception alerts for delays, rollovers and customs holds.",
            "Review late shipments monthly to spot repeat issues by route, carrier or supplier.",
          ],
        },
        proactive: {
          summary: "You have good visibility and usually hear about issues in time.",
          actions: [
            "Link shipment ETAs to your stock and sales plans so delays automatically flag at-risk orders.",
            "Make sure visibility is consistent across every route and provider, not just the main ones.",
            "Share tracking with your own customers to reduce \"where's my order\" enquiries.",
          ],
        },
        resilient: {
          summary: "Visibility is a strength — you see issues early and act on them.",
          actions: [
            "Use your tracking history to measure carrier and route reliability.",
            "Explore predictive ETAs and scenario planning for peak periods.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock can set up proactive milestone updates for your critical shipments, so you hear about delays early instead of chasing for them.",
    },

    {
      id: "contingency",
      name: "Contingency Planning",
      icon: "⇄",
      intro: "How prepared you are to switch to an alternative when a main route or option becomes unavailable.",
      questions: [
        {
          id: "q3",
          text: "If one of your main routes became unavailable tomorrow, how prepared would you be to switch to an alternative?",
          options: [
            { label: "Very prepared - alternative routes or options are already identified", score: 4 },
            { label: "Fairly prepared - we know what alternatives are available but would need to arrange them", score: 3 },
            { label: "We would rely on our logistics partner to find the best alternative", score: 2 },
            { label: "We would mainly respond once the disruption happened", score: 1 },
          ],
          improve: "For each of your main routes, identify — and get quoted — at least one alternative route or mode now, so switching is a decision rather than a scramble.",
        },
        {
          id: "q4",
          text: "How often do you review alternative routes, carriers or transport options for your critical movements?",
          options: [
            { label: "Regularly, as part of our supply chain planning", score: 4 },
            { label: "Occasionally, particularly for higher-risk movements", score: 3 },
            { label: "Mainly when circumstances or market conditions change", score: 2 },
            { label: "We generally review alternatives only when a problem occurs", score: 1 },
          ],
          improve: "Build a review of alternative routes and carriers into your regular planning — for example quarterly and before peak season — rather than waiting for a problem.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Without alternatives lined up, a single disruption could stop critical movements.",
          actions: [
            "List your critical movements and the single route, port or carrier each one depends on.",
            "Get at least one alternative quoted for the most important of them.",
            "Write a one-page disruption playbook: who decides, what gets priority, who tells customers.",
          ],
        },
        reactive: {
          summary: "You'd find a way through disruption, but probably at a higher cost and with delays.",
          actions: [
            "Turn your informal knowledge of alternatives into a short written plan.",
            "Pre-agree backup options for your highest-value routes with your logistics partner.",
            "Schedule a regular review of alternatives instead of waiting for a trigger.",
          ],
        },
        proactive: {
          summary: "You know your alternatives and review them for higher-risk movements.",
          actions: [
            "Test a backup route with a trial shipment so it's proven, not theoretical.",
            "Extend your reviews to all critical movements, not just the riskiest.",
            "Agree clear trigger points for switching, e.g. a delay of more than 7 days.",
          ],
        },
        resilient: {
          summary: "Contingency planning is built into how you run your supply chain.",
          actions: [
            "Run a scenario exercise, such as a major port closure, to stress-test the plan.",
            "Keep your playbook up to date as routes, carriers and costs change.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock can help map out and pre-agree alternative routes and transport options for your critical movements, so you're ready before disruption hits.",
    },

    {
      id: "customs",
      name: "Customs & Compliance",
      icon: "⚖",
      intro: "How clearly customs responsibilities are owned, and how well you can respond to regulatory change.",
      questions: [
        {
          id: "q5",
          text: "If a customs or regulatory requirement changed next month, how confident are you that your business could respond without disrupting shipments?",
          options: [
            { label: "Very confident - responsibilities and processes are clearly defined", score: 4 },
            { label: "Fairly confident - some adjustments may be needed", score: 3 },
            { label: "We would need external support to understand and implement the change", score: 2 },
            { label: "We would largely respond once the impact became clear", score: 1 },
          ],
          improve: "Give one person clear ownership for monitoring customs and regulatory changes, and agree with your customs broker how you'll be warned about changes that affect your goods.",
        },
        {
          id: "q6",
          text: "How clearly are customs responsibilities, documentation and classifications managed across your supply chain?",
          options: [
            { label: "Very clearly - ownership and processes are well defined", score: 4 },
            { label: "Mostly clearly - responsibilities are understood in most situations", score: 3 },
            { label: "It can become unclear when shipments or requirements are more complex", score: 2 },
            { label: "We regularly experience uncertainty, delays or duplicated work", score: 1 },
          ],
          improve: "Write down who owns each customs task — classification, documentation, declarations — between you, your suppliers and your forwarder, and have your commodity codes reviewed by a specialist.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Customs is likely to be a source of delay, cost and compliance risk.",
          actions: [
            "Get a customs specialist to review your commodity codes and documentation.",
            "Create a standard document checklist for every supplier and shipment.",
            "Agree who is responsible for each customs task, internally and with your providers.",
          ],
        },
        reactive: {
          summary: "Customs mostly works, but complexity or change can cause problems.",
          actions: [
            "Audit a sample of recent entries for classification and valuation accuracy.",
            "Agree how your customs broker will alert you to regulatory changes.",
            "Brief suppliers on exactly what documentation you need from them.",
          ],
        },
        proactive: {
          summary: "Compliance is in good shape, with clear processes most of the time.",
          actions: [
            "Schedule an annual tariff and classification review.",
            "Check whether duty-saving options (preferential origin, reliefs, deferment) apply to you.",
            "Keep an eye on upcoming changes to UK and EU border requirements.",
          ],
        },
        resilient: {
          summary: "Customs and compliance are well controlled.",
          actions: [
            "Consider whether authorised status (such as AEO) would speed up your clearances further.",
            "Model the duty impact before changing suppliers or routes.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock's customs team can take ownership of clearance and documentation, check your classifications and keep you ahead of regulatory changes.",
    },

    {
      id: "flexibility",
      name: "Transport Flexibility",
      icon: "⛟",
      intro: "How dependent you are on a single route, carrier or mode, and how quickly you can adapt.",
      questions: [
        {
          id: "q7",
          text: "How dependent are your critical shipments on a single route, carrier or mode of transport?",
          options: [
            { label: "Very little - we have several viable alternatives", score: 4 },
            { label: "Somewhat - alternatives exist for most critical movements", score: 3 },
            { label: "Quite heavily - some key movements rely on a limited number of options", score: 2 },
            { label: "Very heavily - changing route, provider or mode would be difficult", score: 1 },
          ],
          improve: "Reduce reliance on a single route, carrier or mode for critical shipments by pre-agreeing a second option — for example sea-air, road vs short-sea, or an alternative port.",
        },
        {
          id: "q8",
          text: "When priorities change unexpectedly, how quickly can your logistics operation adapt?",
          options: [
            { label: "Usually within the same day", score: 4 },
            { label: "Usually within 1–2 days", score: 3 },
            { label: "It often takes several days", score: 2 },
            { label: "Significant changes are difficult to implement quickly", score: 1 },
          ],
          improve: "Agree escalation contacts and trigger points with your logistics partner in advance (e.g. when to switch priority stock to air), so changes can be made within a day.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Heavy reliance on limited options makes it hard to adapt when things change.",
          actions: [
            "Identify which critical movements depend on a single route, carrier or mode.",
            "Get quotes for a second option on the most important of them.",
            "Agree an escalation contact with your provider for urgent changes.",
          ],
        },
        reactive: {
          summary: "You can adapt, but it takes time and is usually expensive.",
          actions: [
            "Pre-agree alternative modes for priority stock (e.g. sea-air or road).",
            "Spread volume across more than one carrier to keep options open.",
            "Agree trigger points for switching mode so decisions are quick.",
          ],
        },
        proactive: {
          summary: "You have options for most critical movements and can adapt within a day or two.",
          actions: [
            "Close the remaining single points of dependency.",
            "Work with your partner on same-day escalation for urgent changes.",
            "Model the cost trade-off between holding stock and faster modes.",
          ],
        },
        resilient: {
          summary: "Your transport set-up is flexible and quick to adapt.",
          actions: [
            "Review your options regularly as rates and capacity change.",
            "Factor carbon emissions into mode choices alongside cost and speed.",
          ],
        },
      },
      blaiklockHelp: "With air, sea and road options and relationships across airlines, shipping lines and hauliers, Blaiklock can give you alternatives ready to use when priorities change.",
    },

    {
      id: "control",
      name: "Operational Control",
      icon: "◆",
      intro: "How clear ownership is when things go wrong, and whether you're kept informed without asking.",
      questions: [
        {
          id: "q9",
          text: "When something goes wrong, how clear is it who is responsible for resolving it?",
          options: [
            { label: "Completely clear - ownership is established immediately", score: 4 },
            { label: "Usually clear - the right person is normally easy to identify", score: 3 },
            { label: "It can take time to establish who is responsible", score: 2 },
            { label: "Ownership can become unclear between different teams or providers", score: 1 },
          ],
          improve: "Agree who owns each type of issue — delays, customs holds, damages, claims — internally and with your providers, and write it down so nobody has to work it out mid-crisis.",
        },
        {
          id: "q10",
          text: "How often do you receive updates before you need to ask for them?",
          options: [
            { label: "Consistently - we are usually kept informed proactively", score: 4 },
            { label: "Most of the time", score: 3 },
            { label: "Sometimes, depending on the shipment or situation", score: 2 },
            { label: "We usually need to request updates ourselves", score: 1 },
          ],
          improve: "Agree a proactive update standard with your logistics partner: key milestones and any exceptions sent to you automatically, without you having to ask.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Unclear ownership and having to chase updates slow down every problem.",
          actions: [
            "Agree a single point of contact with each of your logistics providers.",
            "Write down who owns each type of issue, and share it with your providers.",
            "Ask your providers for proactive updates rather than on request.",
          ],
        },
        reactive: {
          summary: "Problems get resolved, but working out who owns them costs time.",
          actions: [
            "Agree clear escalation routes for delays, customs holds and claims.",
            "Set expectations with your providers on how and when they update you.",
            "Review recent issues to see where ownership was unclear.",
          ],
        },
        proactive: {
          summary: "Ownership is usually clear and you're mostly kept informed.",
          actions: [
            "Make proactive updates consistent across all shipments and providers.",
            "Hold a regular review with your logistics partner covering service and issues.",
            "Agree shared KPIs, such as on-time delivery and issue resolution time.",
          ],
        },
        resilient: {
          summary: "You have clear ownership and proactive communication.",
          actions: [
            "Use issue data to drive continuous improvement with your partners.",
            "Make sure processes still hold when key people are away.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock gives you a dedicated point of contact who takes ownership of issues and keeps you updated proactively, so you don't have to chase.",
    },
  ],

  // The question asked after the scored questions, and the contact steps that
  // follow if the respondent says yes.
  deepDive: {
    question: "Your assessment is complete!",
    subtitle: "Would you like a deeper review?",
    yes: "Yes - I'd like Blaiklock to review my results",
    no: "No thanks - just show me my result",
    steps: [
      {
        id: "name", label: "Name", required: true,
        fields: [
          { name: "firstName", placeholder: "First Name", autocomplete: "given-name" },
          { name: "lastName", placeholder: "Last Name", autocomplete: "family-name" },
        ],
      },
      {
        id: "company", label: "Company", required: true,
        fields: [{ name: "company", autocomplete: "organization" }],
      },
      {
        id: "email", label: "Email", required: true,
        fields: [{ name: "email", type: "email", placeholder: "example@example.com", autocomplete: "email" }],
      },
      {
        id: "phone", label: "Phone Number", hint: "Optional",
        fields: [{ name: "phone", type: "tel", placeholder: "Please enter a valid phone number.", autocomplete: "tel" }],
      },
      {
        id: "focus", label: "Which area would you most like us to look at?",
        // Options are the section names, plus this extra choice:
        extraOption: "I'm not sure — I'd like Blaiklock to review the full result",
        optionsFromPillars: true,
      },
      {
        id: "region", label: "Where does your supply chain operate?",
        options: ["UK only", "UK & Europe", "International"],
      },
    ],
    privacyNote: "By submitting, you agree to Blaiklock contacting you about your results.",
    thankYou: "Thanks{name} — a Blaiklock specialist will review your results and be in touch shortly.",
    // Shown on the results page to people who chose "No thanks".
    ctaHeading: "Would you like a deeper review?",
    ctaText: "A Blaiklock specialist can go through your results with you, look at your actual shipments and trade lanes, and give you a practical plan to improve.",
    ctaButton: "Yes, review my results",
  },
};
