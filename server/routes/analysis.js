'use strict';

const { Router } = require('express');
const Groq = require('groq-sdk');

const router = Router();

// ─── Format KPI data as a readable text summary for Claude ─────────────────

function summariseKpis(d, range) {
  const s   = d.store      || {};
  const c   = d.customers  || {};
  const m   = d.meta       || {};
  const g   = d.google     || {};
  const ltv = d.ltv        || {};
  const exp = d.expenses   || {};

  const v = (obj) => obj?.value ?? 0;
  const chg = (obj) => {
    const n = obj?.change;
    if (n == null) return '';
    return ` (${n >= 0 ? '+' : ''}${n}% vs prior period)`;
  };

  const adSpend = v(m.spend) + v(g.spend);

  return `BUSINESS KPI REPORT — ${range.toUpperCase()} PERIOD

STORE PERFORMANCE:
  Revenue:             $${v(s.orderRevenue).toLocaleString()}${chg(s.orderRevenue)}
  Orders:              ${v(s.orders).toLocaleString()}${chg(s.orders)}
  Units Sold:          ${v(s.unitsSold).toLocaleString()}
  Net Profit:          $${v(s.netProfit).toLocaleString()}${chg(s.netProfit)}
  Contribution Margin: $${v(s.contributionMargin).toLocaleString()}${chg(s.contributionMargin)}
  Net Margin:          ${v(s.netMargin)}%
  ROAS:                ${v(s.roas)}x
  NC-ROAS:             ${v(s.ncRoas)}x
  POAS:                ${v(s.poas)}x
  AOV:                 $${v(s.aov)}
  True AOV:            $${v(s.trueAov)}
  Blended CPA:         $${v(s.blendedCpa)}
  MER:                 ${v(s.mer)}%
  NCPA:                $${v(s.ncpa)}
  Returns:             $${v(s.returns).toLocaleString()}
  Discounts:           $${v(s.discounts).toLocaleString()}

ADVERTISING (Total Spend: $${adSpend.toLocaleString()}):
  Meta Ads:
    Spend:       $${v(m.spend).toLocaleString()}
    ROAS:        ${v(m.roas)}x
    Purchases:   ${v(m.purchases)}
    CPA:         $${v(m.cpa)}
    CTR:         ${v(m.ctr)}%
    CPM:         $${v(m.cpm)}
  Google Ads:
    Spend:       $${v(g.spend).toLocaleString()}
    ROAS:        ${v(g.roas)}x
    Conversions: ${v(g.conversions)}
    CPA:         $${v(g.cpa)}
    CTR:         ${v(g.ctr)}%
    CPM:         $${v(g.cpm)}

CUSTOMERS:
  New Customer %:       ${v(c.newPct)}%
  Returning %:          ${v(c.returningPct)}%
  New Customer Revenue: $${v(c.newCustomerRevenue).toLocaleString()}
  Returning Revenue:    $${v(c.returningRevenue).toLocaleString()}
  New Orders:           ${v(c.newCustomerOrders)}
  Unique Customers:     ${v(c.uniqueCustomers)}
  LTV:                  $${v(ltv.ltv)}
  Purchase Frequency:   ${v(ltv.frequency)}x
  LTV / CPA Ratio:      ${v(ltv.ltvCpa)}x

EXPENSES:
  COGS:             $${v(exp.cogs).toLocaleString()}
  Shipping:         $${v(exp.shipping).toLocaleString()}
  Payment Gateways: $${v(exp.paymentGateways).toLocaleString()}
  Custom Expenses:  $${v(exp.customExpenses).toLocaleString()}
  Total Expenses:   $${v(exp.totalExpenses).toLocaleString()}`;
}

// ─── Build the analysis prompt ─────────────────────────────────────────────

function buildPrompt(kpis, range) {
  return `You are an expert eCommerce business analyst specialising in Shopify DTC brands.
Analyse the following KPI data and return a JSON object with your findings.

${summariseKpis(kpis, range)}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation outside the JSON.
Use this exact structure:

{
  "score": <integer 0-100 — overall business health>,
  "scoreLabel": "<one of: Excellent | Good | Fair | Needs Attention | Critical>",
  "summary": "<2-3 sentence executive summary a business owner can act on>",
  "strengths": [
    { "title": "<short title>", "detail": "<1-2 sentence explanation with specific numbers>" }
  ],
  "warnings": [
    { "title": "<short title>", "detail": "<1-2 sentence explanation with specific numbers and why it matters>" }
  ],
  "actions": [
    {
      "priority": "<High | Medium | Low>",
      "title": "<clear action title>",
      "detail": "<2-3 specific steps the owner can take this week>",
      "impact": "<estimated revenue or profit impact>"
    }
  ],
  "sections": {
    "profitability": { "score": <0-100>, "insight": "<1 sentence>", "color": "<green|amber|red>" },
    "advertising":   { "score": <0-100>, "insight": "<1 sentence>", "color": "<green|amber|red>" },
    "customers":     { "score": <0-100>, "insight": "<1 sentence>", "color": "<green|amber|red>" },
    "expenses":      { "score": <0-100>, "insight": "<1 sentence>", "color": "<green|amber|red>" }
  }
}

Rules:
- Include 2-4 strengths, 1-3 warnings, and 3-5 prioritised actions (High first).
- Be specific — reference actual numbers from the data.
- Actions must be concrete steps the owner can take this week, not vague advice.
- If ad spend is $0, skip advertising metrics and focus on organic growth advice.
- Score color guide: green = 70+, amber = 40-69, red = 0-39.`;
}

// ─── Route ─────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: 'GROQ_API_KEY not configured',
      hint: 'Add GROQ_API_KEY to your .env file. Get a free key at console.groq.com.',
    });
  }

  const { range = '7d', start, end } = req.body;

  try {
    // Fetch KPI data using the same logic as the /api/kpis route
    let kpis;
    if (process.env.SHOPIFY_SHOP && process.env.SHOPIFY_TOKEN) {
      const { getKpisFromShopify } = require('../data/shopify-kpis');
      kpis = await getKpisFromShopify(range, start, end);
    } else {
      const { getKpis } = require('../data/kpis');
      kpis = getKpis(range, start, end);
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPrompt(kpis, range) }],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const raw = completion.choices[0].message.content.trim();

    // Strip accidental code fences
    const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const analysis = JSON.parse(json);

    res.json({ ...analysis, generatedAt: new Date().toISOString(), range });
  } catch (err) {
    console.error('[analysis] Error:', err.message);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

module.exports = router;
