/*
 * Blaiklock Supply Chain Health Check — content & scoring configuration
 * ----------------------------------------------------------------------
 * Everything a non-developer may want to change lives in this file:
 *   - brand details and contact info
 *   - where the "deeper dive" contact form is sent
 *   - the maturity levels (score bands)
 *   - the sections ("pillars"), their questions, answer options and scores
 *   - the tailored advice shown on the results page
 *
 * Scoring: every answer option has a `score` from 0 (weakest) to 3 (strongest).
 * A section's score is the % of the maximum available in that section, and the
 * overall score is the average of the section scores.
 *
 * Per-question `improve` text is shown on the results page as a "quick win"
 * whenever the respondent picks an answer scoring 0 or 1 on that question.
 */
window.HEALTH_CHECK_CONFIG = {
  brand: {
    name: "Blaiklock",
    fullName: "Blaiklock International Logistics",
    title: "Supply Chain Health Check",
    website: "https://www.blaiklock.com",
    email: "info@blaiklock.com",
    phone: "",
  },

  // Where the "deeper dive" contact form is sent.
  //   endpoint: a URL that accepts a POST (Formspree, Zapier/Make webhook,
  //             Power Automate HTTP trigger, your CRM, etc.). The payload is JSON
  //             containing the contact details, every answer and every score.
  //   Leave endpoint empty to fall back to opening an email to `fallbackEmail`.
  submission: {
    endpoint: "",
    fallbackEmail: "info@blaiklock.com",
  },

  // Score bands, lowest first. `status` controls colour: critical | serious | warning | good
  levels: [
    {
      key: "vulnerable", label: "Vulnerable", min: 0, status: "critical", icon: "!",
      headline: "Your supply chain is exposed to disruption.",
      description: "Key parts of your supply chain rely on manual effort, single points of failure or reactive fixes. A disruption — a port delay, a customs hold, a supplier failure — is likely to hit your customers and your margins. The good news: the biggest gains are quick to unlock from here.",
    },
    {
      key: "reactive", label: "Reactive", min: 40, status: "serious", icon: "▲",
      headline: "You cope with disruption, but mostly after it happens.",
      description: "You have some good foundations in place, but problems are usually spotted late and fixed by firefighting. Building more visibility and contingency into how you plan and move goods will reduce cost and stress.",
    },
    {
      key: "proactive", label: "Proactive", min: 60, status: "warning", icon: "●",
      headline: "You're well organised, with some gaps to close.",
      description: "Your supply chain is in good shape and you anticipate many issues before they land. Closing the remaining gaps will turn your logistics into a genuine competitive advantage.",
    },
    {
      key: "resilient", label: "Resilient", min: 80, status: "good", icon: "✓",
      headline: "Your supply chain is resilient and well run.",
      description: "You have strong visibility, robust compliance and real flexibility in how you move goods. The focus now is on continuous improvement, optimising cost and staying ahead of regulatory and market change.",
    },
  ],

  // Optional, unscored "about you" questions asked before the scored sections.
  profile: [
    {
      id: "industry", text: "Which best describes your business?",
      options: ["Manufacturing", "Retail & e-commerce", "Wholesale & distribution", "Food & drink", "Healthcare & pharma", "Other"],
    },
    {
      id: "trade", text: "How does your business trade internationally?",
      options: ["Mostly importing", "Mostly exporting", "Both importing and exporting", "Planning to start trading internationally"],
    },
    {
      id: "volume", text: "Roughly how many international shipments do you move each month?",
      options: ["Fewer than 5", "5 – 20", "21 – 100", "More than 100"],
    },
  ],

  pillars: [
    {
      id: "visibility",
      name: "Visibility & Tracking",
      icon: "◎",
      intro: "How well you can see where your goods are, and how early you hear about problems.",
      questions: [
        {
          id: "vis1",
          text: "How do you know where your shipments are at any given moment?",
          options: [
            { label: "We usually find out when they arrive (or don't)", score: 0 },
            { label: "We chase our forwarder or carrier by phone / email", score: 1 },
            { label: "We get regular milestone updates from our forwarder", score: 2 },
            { label: "We have live, proactive tracking across all shipments", score: 3 },
          ],
          improve: "Ask your forwarder for proactive milestone updates (booked, departed, arrived, cleared, delivered) on every shipment, so you stop chasing and start planning.",
        },
        {
          id: "vis2",
          text: "When a shipment is delayed, when do you typically find out?",
          options: [
            { label: "When the customer complains or stock runs out", score: 0 },
            { label: "On or after the expected delivery date", score: 1 },
            { label: "A few days before it affects us", score: 2 },
            { label: "As soon as the risk appears, with options to react", score: 3 },
          ],
          improve: "Agree exception alerts with your logistics partner: you should be told about a rollover, missed connection or customs hold the same day it happens, not when the goods fail to arrive.",
        },
        {
          id: "vis3",
          text: "How confident are you in your landed cost per shipment (freight, duty, VAT, local charges)?",
          options: [
            { label: "We don't really know until invoices arrive", score: 0 },
            { label: "We have a rough idea but are often surprised", score: 1 },
            { label: "We estimate it accurately most of the time", score: 2 },
            { label: "We know it up front and track it against actuals", score: 3 },
          ],
          improve: "Build a simple landed-cost template (freight + duty + VAT + port/handling + delivery) and get all-in quotes up front, so pricing and margin decisions are made on real numbers.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "You're largely operating blind once goods leave your supplier.",
          actions: [
            "Get milestone tracking in place for every shipment — even a shared spreadsheet updated by your forwarder is a step change.",
            "Name one person responsible for monitoring inbound and outbound shipments each day.",
            "Start recording expected vs actual arrival dates so you can see your real lead times.",
          ],
        },
        reactive: {
          summary: "You can find out what's happening, but it takes effort and comes late.",
          actions: [
            "Move from chasing updates to receiving them: agree a standard update schedule with your forwarder.",
            "Set up exception alerts for delays, rollovers and customs holds.",
            "Review late shipments monthly to spot repeat offenders (routes, carriers, suppliers).",
          ],
        },
        proactive: {
          summary: "You have good visibility and usually hear about issues in time.",
          actions: [
            "Link shipment ETAs to your stock and sales plans so delays automatically flag at-risk orders.",
            "Track carrier and route reliability to inform future bookings.",
            "Share tracking with your own customers to reduce \"where's my order\" enquiries.",
          ],
        },
        resilient: {
          summary: "Visibility is a strength — you see issues early and act on them.",
          actions: [
            "Use your historical tracking data to negotiate better service levels.",
            "Explore predictive ETAs and scenario planning for peak seasons.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock provides proactive milestone updates and a dedicated point of contact who flags problems early — so you hear about delays before your customers do.",
    },

    {
      id: "customs",
      name: "Customs & Compliance",
      icon: "⚖",
      intro: "How smoothly your goods clear borders, and how well you manage duty, documentation and regulation.",
      questions: [
        {
          id: "cus1",
          text: "How often are your shipments held up by customs or documentation issues?",
          options: [
            { label: "Frequently — it's a regular headache", score: 0 },
            { label: "Occasionally, and it's costly when it happens", score: 1 },
            { label: "Rarely", score: 2 },
            { label: "Almost never — our paperwork is right first time", score: 3 },
          ],
          improve: "Introduce a pre-shipment document check (commercial invoice, packing list, origin, commodity codes) before goods leave the supplier — most customs holds are caused by avoidable paperwork errors.",
        },
        {
          id: "cus2",
          text: "How confident are you that your commodity codes and duty rates are correct?",
          options: [
            { label: "Not confident / we've never checked", score: 0 },
            { label: "We rely on suppliers or the forwarder and hope", score: 1 },
            { label: "Fairly confident — they were checked at some point", score: 2 },
            { label: "Very confident — reviewed regularly by a specialist", score: 3 },
          ],
          improve: "Have your commodity codes reviewed by a customs specialist. Incorrect codes are one of the most common causes of overpaid duty — and of penalties from HMRC.",
        },
        {
          id: "cus3",
          text: "Are you making use of duty-saving opportunities (preferential origin, relief schemes, deferment)?",
          options: [
            { label: "I'm not sure what's available to us", score: 0 },
            { label: "We know about them but don't use them", score: 1 },
            { label: "We use some of them", score: 2 },
            { label: "Yes — we've reviewed and use everything relevant", score: 3 },
          ],
          improve: "Ask for a duty and relief review: preferential origin under trade agreements, inward/outward processing, returned goods relief and a duty deferment account can all reduce cost and improve cash flow.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Customs is a significant source of delay, cost and compliance risk for you.",
          actions: [
            "Get a specialist to review your commodity codes and documentation — this is the single biggest quick win.",
            "Create a standard document checklist for every supplier and shipment.",
            "Check you have the right registrations in place (EORI, and a duty deferment account if you import regularly).",
          ],
        },
        reactive: {
          summary: "Customs mostly works, but issues are dealt with as they arise.",
          actions: [
            "Audit a sample of recent entries for code and valuation accuracy.",
            "Review whether preferential origin could reduce duty on your key products.",
            "Brief your suppliers on exactly what documentation you need from them.",
          ],
        },
        proactive: {
          summary: "Compliance is in good shape with room to unlock savings.",
          actions: [
            "Schedule an annual tariff and relief review to catch regulatory changes.",
            "Explore customs special procedures (e.g. warehousing, inward processing) where relevant.",
            "Keep an eye on upcoming changes such as new border controls and carbon reporting (CBAM).",
          ],
        },
        resilient: {
          summary: "Customs and compliance are well controlled.",
          actions: [
            "Consider whether authorised status (e.g. AEO) would speed up your clearances further.",
            "Use your compliance data to model duty impacts before changing suppliers or routes.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock's in-house customs team handles import and export clearance, checks classifications and can review your duty position for savings.",
    },

    {
      id: "risk",
      name: "Supplier & Route Resilience",
      icon: "⛓",
      intro: "How exposed you are to a single supplier, port, carrier or route failing.",
      questions: [
        {
          id: "risk1",
          text: "If your main supplier or main shipping route was disrupted tomorrow, what would happen?",
          options: [
            { label: "We'd be stuck — there's no alternative", score: 0 },
            { label: "We'd scramble to find an alternative", score: 1 },
            { label: "We have alternatives identified but untested", score: 2 },
            { label: "We have tested backup suppliers / routes ready to go", score: 3 },
          ],
          improve: "Identify at least one alternative supplier or route for your most critical products, and get it quoted now — not during a crisis.",
        },
        {
          id: "risk2",
          text: "How flexible are you in switching transport mode (sea, air, road, rail) when needed?",
          options: [
            { label: "We only ever use one mode and have no other options", score: 0 },
            { label: "We've switched before but it was slow and expensive", score: 1 },
            { label: "We can switch with a bit of notice", score: 2 },
            { label: "We plan multi-modal options as standard", score: 3 },
          ],
          improve: "Work with a forwarder that can offer sea, air, road and rail, and agree in advance when you'd switch (e.g. sea-air for urgent stock) so the decision is quick when it matters.",
        },
        {
          id: "risk3",
          text: "Do you have a documented plan for handling major disruption (strikes, port closures, geopolitical events)?",
          options: [
            { label: "No", score: 0 },
            { label: "Informally — it's in people's heads", score: 1 },
            { label: "Yes, but it's not reviewed regularly", score: 2 },
            { label: "Yes, documented, owned and reviewed regularly", score: 3 },
          ],
          improve: "Write a one-page disruption playbook: who decides, which shipments get priority, which alternatives to activate and who tells customers.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Single points of failure leave you highly exposed.",
          actions: [
            "List your top 10 products and identify the single supplier, port or route each depends on.",
            "Get quotes for at least one alternative for the most critical items.",
            "Agree with your forwarder what a 'plan B' route looks like for your main lanes.",
          ],
        },
        reactive: {
          summary: "You'd find a way through disruption, but at a high cost.",
          actions: [
            "Turn your informal contingency knowledge into a short written playbook.",
            "Pre-qualify a backup supplier or route for your highest-value lanes.",
            "Agree trigger points for switching mode (e.g. sea delay > 7 days = air for priority stock).",
          ],
        },
        proactive: {
          summary: "You have alternatives in mind and can adapt with some notice.",
          actions: [
            "Test your backup routes with a trial shipment so they're proven, not theoretical.",
            "Review your disruption plan twice a year against current events.",
            "Spread volume across carriers to keep options open.",
          ],
        },
        resilient: {
          summary: "You're well protected against single points of failure.",
          actions: [
            "Run a scenario exercise (e.g. a major port closure) to stress-test the plan.",
            "Consider nearshoring or dual sourcing for strategic products.",
          ],
        },
      },
      blaiklockHelp: "With sea, air, road and rail options and long-standing carrier relationships, Blaiklock can design and pre-agree backup routes for your key trade lanes.",
    },

    {
      id: "planning",
      name: "Planning & Inventory",
      icon: "▦",
      intro: "How well your stock levels and order timing account for real-world lead times.",
      questions: [
        {
          id: "plan1",
          text: "How do you set the lead times you plan your orders around?",
          options: [
            { label: "We don't plan with lead times — we order when we run low", score: 0 },
            { label: "We use the supplier's or carrier's quoted transit times", score: 1 },
            { label: "We use our own experience with a buffer", score: 2 },
            { label: "We use measured actual door-to-door lead times, reviewed regularly", score: 3 },
          ],
          improve: "Measure actual door-to-door lead times (order placed to goods in your warehouse) for your main lanes — quoted transit times typically leave out production, customs and delivery.",
        },
        {
          id: "plan2",
          text: "How often do you experience stock-outs or excess stock because of shipping delays?",
          options: [
            { label: "Very often", score: 0 },
            { label: "Often during peak periods", score: 1 },
            { label: "Occasionally", score: 2 },
            { label: "Rarely", score: 3 },
          ],
          improve: "Set safety stock for your top sellers based on how variable your lead times are, not just their average — that's what protects you from delays.",
        },
        {
          id: "plan3",
          text: "How far ahead do you share forecasts with your suppliers and logistics partner?",
          options: [
            { label: "We don't share forecasts", score: 0 },
            { label: "Only when placing orders", score: 1 },
            { label: "A month or two ahead", score: 2 },
            { label: "Rolling 3–6+ month forecasts, updated regularly", score: 3 },
          ],
          improve: "Share a simple rolling forecast with your forwarder ahead of peak season — it helps secure space and rates before capacity tightens.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Planning is reactive, so delays quickly turn into stock problems.",
          actions: [
            "Start tracking actual lead times for your main suppliers.",
            "Identify your top 20% of products by revenue and protect them with safety stock.",
            "Plan peak-season orders (e.g. Q4, Chinese New Year) earlier.",
          ],
        },
        reactive: {
          summary: "You plan around lead times, but variability still catches you out.",
          actions: [
            "Replace quoted transit times with measured door-to-door times.",
            "Review safety stock levels each quarter for your key lines.",
            "Share forecasts with your forwarder so space can be secured ahead of time.",
          ],
        },
        proactive: {
          summary: "Planning is solid and well connected to logistics.",
          actions: [
            "Link live shipment ETAs to your stock plan.",
            "Consider consolidating orders to optimise container fill and freight cost.",
            "Review slow-moving stock to free up working capital.",
          ],
        },
        resilient: {
          summary: "Your planning is mature and data-driven.",
          actions: [
            "Explore collaborative planning with key suppliers.",
            "Model the cost trade-off between inventory holding and faster freight modes.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock can share real lead-time data for your lanes, help plan peak-season bookings and offer consolidation and warehousing options to balance cost and stock.",
    },

    {
      id: "cost",
      name: "Cost & Partner Management",
      icon: "£",
      intro: "How well you control freight spend and how you work with your logistics partners.",
      questions: [
        {
          id: "cost1",
          text: "How do you buy freight?",
          options: [
            { label: "Ad hoc — whoever is available at the time", score: 0 },
            { label: "Spot quotes from a regular provider", score: 1 },
            { label: "A mix of agreed rates and spot quotes", score: 2 },
            { label: "Structured agreements reviewed against the market", score: 3 },
          ],
          improve: "Consolidate your freight buying with a trusted partner and agree rates for your regular lanes, benchmarking them against the market at least twice a year.",
        },
        {
          id: "cost2",
          text: "How often are you hit by unexpected charges (demurrage, detention, storage, surcharges)?",
          options: [
            { label: "Regularly", score: 0 },
            { label: "Sometimes", score: 1 },
            { label: "Rarely", score: 2 },
            { label: "Almost never — we know exactly what to expect", score: 3 },
          ],
          improve: "Unexpected charges are usually caused by late collections or late paperwork. Agree free-time allowances up front and plan deliveries so containers are collected and returned on time.",
        },
        {
          id: "cost3",
          text: "How would you describe the relationship with your current logistics provider(s)?",
          options: [
            { label: "Transactional — we struggle to get help when it matters", score: 0 },
            { label: "OK, but we're just a number", score: 1 },
            { label: "Good — they respond well when we ask", score: 2 },
            { label: "A true partnership — they proactively suggest improvements", score: 3 },
          ],
          improve: "Look for a logistics partner who gives you a named contact, regular reviews and proactive suggestions — not just quotes.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Freight costs are unpredictable and partner support is limited.",
          actions: [
            "Get all-in quotes that spell out every charge before you book.",
            "Track demurrage, detention and storage charges for three months to find the root causes.",
            "Talk to a partner who will give you a dedicated contact and a regular review.",
          ],
        },
        reactive: {
          summary: "Costs are reasonably controlled, but there's money being left on the table.",
          actions: [
            "Agree fixed or indexed rates on your regular lanes.",
            "Hold a quarterly review with your forwarder covering cost, service and upcoming volumes.",
            "Check invoices against quotes as standard.",
          ],
        },
        proactive: {
          summary: "You manage freight spend well.",
          actions: [
            "Benchmark your rates against the market every six months.",
            "Look at consolidation, routing and mode choices for further savings.",
            "Set shared KPIs (on-time, cost per unit, claims) with your logistics partner.",
          ],
        },
        resilient: {
          summary: "Cost control and partner management are strengths.",
          actions: [
            "Work with your partner on longer-term capacity and rate strategies.",
            "Factor carbon emissions into routing decisions alongside cost.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock's long-standing relationships with airlines, shipping lines and hauliers mean competitive, transparent rates — backed by a dedicated team who know your business.",
    },

    {
      id: "data",
      name: "Data & Technology",
      icon: "⌁",
      intro: "How you capture, share and use supply chain data to make decisions.",
      questions: [
        {
          id: "data1",
          text: "Where is your shipment and supply chain information kept?",
          options: [
            { label: "Mostly in email inboxes", score: 0 },
            { label: "Spreadsheets maintained manually", score: 1 },
            { label: "A shared system or portal, partly connected", score: 2 },
            { label: "Integrated systems (ERP / WMS / forwarder portal) with a single view", score: 3 },
          ],
          improve: "Pull your shipment information into one place — a shared tracker or your forwarder's portal — so anyone on the team can answer a status question in seconds.",
        },
        {
          id: "data2",
          text: "Do you measure supply chain KPIs (e.g. on-time delivery, lead time, cost per shipment)?",
          options: [
            { label: "No", score: 0 },
            { label: "Occasionally, when there's a problem", score: 1 },
            { label: "Some KPIs, reviewed now and then", score: 2 },
            { label: "Yes — a regular KPI review drives decisions", score: 3 },
          ],
          improve: "Pick three KPIs — on-time delivery, average door-to-door lead time and freight cost per unit — and review them monthly.",
        },
        {
          id: "data3",
          text: "How much of your shipment administration (bookings, documents, updates) is manual?",
          options: [
            { label: "Almost all of it", score: 0 },
            { label: "Most of it", score: 1 },
            { label: "Some of it", score: 2 },
            { label: "Very little — it's largely automated", score: 3 },
          ],
          improve: "Identify the most repetitive admin task (often re-keying documents or chasing updates) and ask your logistics partner how they can take it off your hands.",
        },
      ],
      advice: {
        vulnerable: {
          summary: "Information is scattered, which makes it hard to act quickly.",
          actions: [
            "Create one shared shipment tracker for the whole team.",
            "Start measuring on-time delivery — even manually.",
            "Ask your forwarder what reporting they can provide.",
          ],
        },
        reactive: {
          summary: "You have the data, but it takes effort to use it.",
          actions: [
            "Agree a monthly KPI report with your logistics partner.",
            "Reduce re-keying by asking suppliers and partners for documents in a standard format.",
            "Give key staff access to your forwarder's tracking tools.",
          ],
        },
        proactive: {
          summary: "Data is used well to run the operation.",
          actions: [
            "Connect shipment data to your stock or ERP system.",
            "Use KPI trends to drive supplier and carrier reviews.",
            "Automate routine notifications to your customers.",
          ],
        },
        resilient: {
          summary: "You're data-driven and well automated.",
          actions: [
            "Explore predictive analytics for demand and lead times.",
            "Use emissions data to support sustainability reporting.",
          ],
        },
      },
      blaiklockHelp: "Blaiklock can provide regular shipment reporting and KPIs for your account, cutting down manual admin and giving you a single view of your freight.",
    },
  ],

  // Text for the "deeper dive" (lead capture) section on the results page.
  deepDive: {
    heading: "Want a deeper dive?",
    text: "Book a free, no-obligation supply chain review with a Blaiklock specialist. We'll go through your results, look at your actual shipments and trade lanes, and give you a practical action plan.",
    benefits: [
      "A 30-minute call with a Blaiklock specialist",
      "A review of your customs, routing and freight costs",
      "A tailored, prioritised improvement plan",
    ],
    thankYou: "Thank you — a member of the Blaiklock team will be in touch within one working day.",
  },
};
