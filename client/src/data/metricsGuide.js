export const METRIC_GUIDE = {
  // ── Store ────────────────────────────────────────────────────────────────
  'Order Revenue':
    'Total dollars collected from orders in the selected period. Your top-line number — what came in before any costs are removed.',
  'Orders':
    'How many orders were placed in the selected period.',
  'Net Profit':
    "What's left after paying for everything: product cost, shipping, payment fees, ad spend, and other expenses. The number that actually matters.",
  'Contribution Margin':
    'Revenue minus the variable costs tied to each sale (COGS, shipping, payment fees, ad spend). If this is negative, every sale makes things worse.',
  'Net Margin':
    'Net profit as a % of revenue. Example: 29% means $0.29 of every $1 in sales is actual profit. Healthy eComm brands target 15–30%.',
  'ROAS':
    'Return on Ad Spend. Revenue per dollar spent on ads. A ROAS of 4.0 means $4 in revenue for every $1 in ads. Doesn\'t account for costs — high ROAS can still mean losing money if margins are thin.',
  'NC-ROAS':
    'New Customer ROAS. Same as ROAS but counts only revenue from first-time buyers. Tells you whether ads are growing your customer base or just recapturing existing customers.',
  'POAS':
    'Profit on Ad Spend. Net profit per dollar spent on ads. Unlike ROAS this accounts for all costs. POAS above 1.0 means ads are actually profitable.',
  'True AOV':
    'Average order value after discounts are removed. More accurate than regular AOV when the store runs frequent promotions.',
  'Avg Order Value':
    'Total revenue ÷ number of orders. Raising AOV through upsells, bundles, or free-shipping thresholds is one of the highest-leverage moves in eComm.',
  'Units Sold':
    'Total number of individual items sold across all orders in the period.',
  'Returns':
    'Dollar value of refunded or returned orders. High returns signal product quality issues, misleading descriptions, or fulfillment problems.',
  'Blended CPA':
    'Cost Per Acquisition. Total ad spend ÷ total orders. How much you paid in ads to get one order across all channels combined. Lower is better.',
  'MER':
    'Marketing Efficiency Ratio. Ad spend as a % of revenue. An MER of 25% means 25 cents of every revenue dollar went to ads. Most brands target 15–25%.',
  'NCPA':
    'New Customer CPA. Ad spend ÷ new customer orders. What it costs to acquire a brand-new customer. Compare against LTV — if NCPA is $40 and LTV is $170, that\'s a great return.',
  'Discounts':
    'Total dollar value of discount codes and promotions applied to orders in the period.',
  'Taxes':
    'Total taxes collected across orders in the period.',

  // ── Customers ────────────────────────────────────────────────────────────
  'New Customer %':
    'Percentage of revenue from first-time buyers. High = strong acquisition but weak retention. Low = strong loyalty but possibly not growing.',
  'Returning %':
    'Percentage of revenue from repeat customers. Higher means better brand loyalty and lower acquisition costs over time.',
  'New Cust Revenue':
    'Total revenue specifically from customers placing their first ever order.',
  'Returning Revenue':
    'Total revenue from customers who have ordered before.',
  'New Cust Orders':
    'Count of orders placed by first-time buyers.',
  'Unique Customers':
    'How many distinct people placed an order in the period. One customer can place multiple orders, so this is always ≤ total orders.',

  // ── Ads (Meta & Google — shared labels) ──────────────────────────────────
  'Spend':
    'Total dollars spent on ads in the period.',
  'Purchases':
    'Number of purchases attributed to Meta ads.',
  'Conversions':
    'Number of purchases Google attributes to its ads.',
  'CPA':
    'Ad spend ÷ attributed purchases. How much it costs to get one purchase through this channel. Lower is better.',
  'CPC':
    'Cost Per Click. How much each ad click cost. Lower CPC means cheaper traffic.',
  'CTR':
    'Click-Through Rate. % of people who saw the ad and clicked it. Higher CTR means more compelling creative or tighter targeting.',
  'Conv. Value':
    'Total revenue attributed to this ad platform for the period.',
  'CPM':
    'Cost per 1,000 impressions. Rising CPM means the ad auction is getting more expensive — often seasonal or due to increased competition.',

  // ── LTV ──────────────────────────────────────────────────────────────────
  'LTV':
    'Lifetime Value. Predicted total revenue a customer generates over their relationship with the store (True AOV × purchase frequency). The key number for justifying ad spend.',
  'Frequency':
    'Average number of times a customer orders in the measured period. Subscription-style products like coffee should see higher frequency.',
  'LTV / CPA':
    'LTV ÷ blended CPA. How many times over does a customer pay back their acquisition cost? Anything above 3× is generally healthy.',

  // ── Expenses ─────────────────────────────────────────────────────────────
  'COGS':
    'Cost of Goods Sold. What the store paid to produce or buy the products sold — includes materials, manufacturing, and packaging.',
  'Shipping':
    'Fulfillment costs — postage, boxes, and packing materials.',
  'Payment Gateways':
    'Shopify Payments / Stripe / PayPal processing fees. Typically ~2.9% of revenue.',
  'Custom Expenses':
    'Any other costs added through the Expenses tab — software subscriptions, contractor pay, rent allocation, etc.',
  'Total Expenses':
    'Sum of COGS, shipping, payment fees, and custom expenses. Subtract from revenue to get net profit.',
};
