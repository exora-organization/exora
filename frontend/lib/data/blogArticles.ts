export interface BlogArticle {
  slug: string;
  title: string;
  desc: string;
  category: string;
  readTime: string;
  image: string;
  author: string;
  publishedAt: string;
  content: string;
  sources: { title: string; url?: string; org: string }[];
  keyTakeaways: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "understanding-incoterms-exw-fob-cfr-cif",
    title: "EXW, FOB, CFR, CIF: Guide to Incoterms & Which One to Choose",
    desc: "Your overseas buyer asked for a \"CIF\" quote and you're not sure what that means. Here's a plain-language guide to the four most common Incoterms.",
    category: "Incoterms",
    readTime: "5 min read",
    image: "/blog/blog1.jpg",
    author: "EXORA Trade Advisory Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "FOB means you're responsible until goods are loaded onto the ship. After that, the buyer takes over.",
      "EXW is the simplest for you: the buyer picks up from your warehouse and handles everything else.",
      "CIF means you pay for shipping AND insurance to the buyer's port. Make sure those costs are in your price.",
      "Choosing the wrong Incoterm can quietly eat your profit margin."
    ],
    sources: [
      { title: "Incoterms® 2020 Rules & Official Guidance", org: "International Chamber of Commerce (ICC)" },
      { title: "International Trade Logistics & Freight Standards", org: "World Trade Organization (WTO)" },
      { title: "Export Commercial Terms Handbook", org: "International Trade Centre (ITC)" }
    ],
    content: `
## Your Buyer Just Said "Quote Me CIF": Now What?

Picture this: you just received an inquiry from a buyer in Malaysia. They say: *"Please send us a CIF quote to Port Klang."* You open Google, and suddenly you're drowning in acronyms.

Don't worry. Let's break each one down in plain language.

---

## 1. EXW: "Come Pick It Up From My Warehouse"

**EXW (Ex Works)** is the simplest Incoterm from your side. You just make the goods available at your factory or warehouse. The buyer arranges everything: pickup, export customs, shipping, and insurance.

**Best for**: Experienced buyers who already have their own freight agent in your country.

**Your risk**: Very low. But your price will also be the lowest, since you're not including any logistics costs.

**Real example**: A garment factory in Bandung sells to a Japanese importer. The importer has their own freight agent in Jakarta, so they pick up directly from the factory. EXW price = your production cost only.

---

## 2. FOB: "Deliver to Port, Buyer Handles the Rest"

**FOB (Free On Board)** is the most commonly used Incoterm in global trade. You're responsible for getting the goods loaded onto the ship at the departure port. Once it's on the ship, all risk transfers to the buyer.

**Best for**: Sea freight exports. This is the global standard most buyers are familiar with.

**What you cover**: Inland transport to the port + export clearance + loading onto the vessel.

**What the buyer covers**: Ocean freight + cargo insurance + import duties at their end.

**Quick tip**: If the buyer says "FOB Jakarta," your quoted price must include all costs up to and including loading at Tanjung Priok Port.

---

## 3. CFR: "Pay for Freight, Insurance is Buyer's Responsibility"

**CFR (Cost and Freight)** means you pay for ocean freight to the buyer's destination port, but you do NOT arrange insurance. If cargo is damaged at sea, that is the buyer's risk.

**Best for**: Buyers who already have their own cargo insurance policy.

**What you need to calculate**: Your production cost + ocean freight to destination port. Insurance is excluded from your CFR price.

---

## 4. CIF: "All-Inclusive Delivery to Destination Port"

**CIF (Cost, Insurance, and Freight)** is the most comprehensive. You pay for ocean freight AND cargo insurance to the buyer's destination port.

**Best for**: New buyers who don't want to deal with logistics themselves.

**What to include in your CIF price**: Production cost + export packaging + inland trucking + export clearance fees + ocean freight + insurance premium.

**Warning**: Because you're covering more costs, make absolutely sure all of these are factored into your selling price. Many new exporters forget to include insurance and end up with a smaller margin or even a loss.

---

## Which One Should You Choose?

| Incoterm | Your Cost | Your Risk | Best For |
|---|---|---|---|
| EXW | Lowest | Lowest | Experienced buyers |
| FOB | Medium | Medium | General sea freight |
| CFR | Higher | Higher | Buyers with own insurance |
| CIF | Highest | Highest | Buyers who want all-inclusive |

**Advice for new exporters**: Start with **FOB**. It's the most familiar, the most commonly requested, and it splits responsibility fairly between you and your buyer.
`
  },

  {
    slug: "common-mistakes-new-exporters-should-avoid",
    title: "7 Costly Mistakes First-Time Exporters Make (And How to Avoid Them)",
    desc: "From underpricing your goods to shipping without a signed contract, here are the most expensive mistakes first-time exporters make.",
    category: "Strategy",
    readTime: "7 min read",
    image: "/blog/blog2.jpg",
    author: "EXORA Risk Advisory Board",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Never quote a price without calculating ALL costs: freight, insurance, export fees, and bank charges.",
      "Never ship to a new buyer without at least 30% deposit upfront.",
      "A Letter of Credit (L/C) is the safest payment method for large first orders.",
      "Always request a small trial order before committing to a large contract."
    ],
    sources: [
      { title: "Common Export Risks & Mitigation Strategies", org: "International Trade Centre (ITC)" },
      { title: "SME Export Readiness Framework", org: "World Trade Organization (WTO)" },
      { title: "Export Credit & Payment Risk Guide", org: "Asian Development Bank (ADB)" }
    ],
    content: `
## You Just Got an Overseas Inquiry: Don't Rush.

Getting an email from a buyer in Dubai or Singapore is exciting. But this is exactly the moment when many new exporters make costly mistakes. Let's go through the most common ones so you can avoid them.

---

## Mistake #1: Underpricing Because You Forgot Hidden Costs

This is the #1 mistake. You quote a price based on your production cost alone, forgetting to include:

- Inland trucking to the port
- Export documentation and port handling fees
- Ocean freight
- Cargo insurance premium
- Bank charges if using L/C
- Certification or labeling requirements for the destination country

**The result**: You land a big order, but after all costs are tallied, you barely break even or lose money.

**The fix**: Calculate **every cost** before sending your quotation. If you're unsure about freight costs, get a quote from a freight forwarder first.

---

## Mistake #2: Agreeing to "Pay After Delivery" for a New Buyer

If a buyer asks to pay after goods arrive, be careful. It means you've already shipped and spent your capital, but the money isn't in your hands yet.

If the buyer disappears or disputes the goods, your product is already in their country and hard to recover.

**Safer options for new buyers**:
- **30% deposit** before production + 70% before shipment
- Or use **L/C (Letter of Credit)** where the buyer's bank guarantees the payment

---

## Mistake #3: Not Checking the Buyer's Credibility

A legitimate buyer will usually have no problem sharing:
- Full company name and registered business address
- Business registration number
- References from other suppliers they've worked with

If a buyer avoids these questions, treat that as a red flag.

---

## Mistake #4: Incomplete Export Documents

Every destination country has different document requirements. The common ones include:

- **Commercial Invoice**
- **Packing List**
- **Bill of Lading** or Airway Bill
- **Certificate of Origin** (to benefit from ASEAN or bilateral trade tariffs)
- **Phytosanitary Certificate** if you're exporting agricultural products

Missing documents mean goods are held at customs. You pay demurrage fees (port storage penalties) while everything gets sorted.

---

## Mistake #5: Not Checking Destination Country Regulations

Your product may be freely sold in Indonesia, but in the destination country there could be:
- Import restrictions or bans
- Mandatory local-language labeling
- Specific packaging size or material requirements
- Maximum limits on certain ingredients (for food, cosmetics, etc.)

**Real example**: You export chili sauce to Australia. Australia has strict rules on preservative content and requires a specific nutrition label format. Without this, your product can be seized at the border.

---

## Mistake #6: Agreeing to an Incoterm You Don't Understand

Never agree to a trade term you're not familiar with. If the buyer wants "CIF Rotterdam" but you quoted "FOB Surabaya," the cost difference can reach millions of rupiah coming straight out of your pocket.

---

## Mistake #7: No Written Contract

Email threads are not contracts. Make sure you have a signed **Sales Contract** that covers:
- Product quantity and specifications
- Agreed price and Incoterm
- Delivery schedule
- Payment terms
- What happens if there's a dispute

Without a contract, you have no legal ground to stand on if the buyer complains or refuses to pay.
`
  },

  {
    slug: "how-exchange-rates-affect-export-profitability",
    title: "How Dollar Exchange Rate Fluctuations Impact Export Profit",
    desc: "You sell in USD but your costs are in Rupiah. Understanding exchange rates could be the difference between a profitable export and a loss.",
    category: "Finance",
    readTime: "6 min read",
    image: "/blog/blog3.jpg",
    author: "EXORA Financial Advisory Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "When Rupiah weakens vs USD, you earn more Rupiah per dollar, boosting your margin.",
      "When Rupiah strengthens, your Rupiah earnings shrink even if the USD price stays the same.",
      "Always calculate your profit in Rupiah, not just in USD.",
      "For large orders, ask your bank about forward contracts to lock in today's exchange rate."
    ],
    sources: [
      { title: "Exchange Rate Risk Management for SMEs", org: "International Monetary Fund (IMF)" },
      { title: "Currency Risk in International Trade", org: "Bank Indonesia" },
      { title: "Hedging Strategies for Export Businesses", org: "Asian Development Bank (ADB)" }
    ],
    content: `
## A Simple Example That Shows Why Exchange Rates Matter

You sell rattan furniture to a buyer in Europe for **$10,000 USD**.

In January, the USD/IDR rate is Rp 15,000, so you receive **Rp 150 million**.

In June, you land the same order at the same price, but now the rate is Rp 16,500. You receive **Rp 165 million**, which is Rp 15 million more just from the exchange rate.

But what if the rate dropped to Rp 14,000? You'd only receive Rp 140 million, even though production costs haven't changed.

**This is currency risk.** It affects every exporter who invoices in USD but pays costs in Rupiah.

---

## Two Real Scenarios Exporters Face

### Scenario A: The Rate Works in Your Favor
You quote a price in March when the rate is Rp 15,500. Payment comes in May when the rate is Rp 16,200.

Result: **You earn more Rupiah than expected.** This is extra profit from favorable rate movement.

### Scenario B: The Rate Works Against You
You quote a USD price in October. Production takes two months. Payment arrives in January and the Rupiah has strengthened significantly.

Result: **You receive fewer Rupiah while production costs stay the same.** Your margin shrinks or disappears entirely.

---

## Simple Ways to Protect Yourself

### 1. Always Calculate in Rupiah
Don't just look at the USD number. Every time you prepare a quotation, convert expected USD revenue into Rupiah and compare it against your Rupiah costs.

**Simple formula**:
USD price × today's exchange rate = Expected IDR revenue
Expected IDR revenue − Total IDR costs = Your actual profit

### 2. Use a Conservative Exchange Rate When Quoting
When preparing your price, use an exchange rate **3-5% lower** than today's rate as a safety buffer. If the rate doesn't move against you, you earn more. If it does, you're still safe.

### 3. Request Faster Payment
The longer the money sits with the buyer in USD, the longer you're exposed to exchange rate risk. Where possible, negotiate earlier payment terms.

### 4. Ask Your Bank About Forward Contracts
For large orders (above $50,000), you can lock in today's exchange rate for a future payment date using a **forward contract**. Many Indonesian banks offer this for SME exporters.

---

## How Exchange Rates Affect Your Competitiveness

Exchange rate movements also affect how competitive your prices look to international buyers.

When the Rupiah weakens, Indonesian products become **cheaper** for foreign buyers, creating an opportunity to win more orders over competitors.

When the Rupiah strengthens, your products become relatively more expensive. Buyers may start comparing you with suppliers from Vietnam, India, or China.

**Bottom line**: Monitor the exchange rate regularly around shipment and payment collection to keep your business profitable.
`
  },

  {
    slug: "preparing-financial-data-before-exporting",
    title: "Before You Export, You Need to Know What Your Goods Actually Cost",
    desc: "Many new exporters don't know their own cost of goods. This guide helps you calculate every cost before sending your first quotation.",
    category: "Costing",
    readTime: "8 min read",
    image: "/blog/blog4.jpg",
    author: "EXORA Costing Advisory Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Your Cost of Goods Sold (COGS) is your starting point. You must know this number before anything else.",
      "Export costs go beyond freight: packaging, certification, documents, and bank fees all add up.",
      "Target a minimum 15-25% margin above total cost to cover risks and unexpected expenses.",
      "If you don't know your exact COGS, you can't negotiate export prices with confidence."
    ],
    sources: [
      { title: "Export Costing & Pricing Methodology", org: "International Trade Centre (ITC)" },
      { title: "SME Financial Readiness for Export", org: "World Trade Organization (WTO)" },
      { title: "Export Finance & Working Capital Guide", org: "Asian Development Bank (ADB)" }
    ],
    content: `
## Be Honest: Do You Know Your Exact Cost of Goods?

Many business owners who have been selling locally for years can't answer this question precisely: *"What is your exact cost per unit?"*

In domestic markets, you can get away with rough estimates. In export, you can't. Because if you don't know your real cost, you can't:
- Quote a price that's actually profitable
- Know whether an order is worth taking
- Negotiate confidently when a buyer tries to push your price down

---

## Step 1: Calculate Your Cost of Goods Sold (COGS)

COGS is everything you spend to produce one unit of your product. It typically includes:

**Raw Materials**
The cost of every material that goes into one unit, including main materials, supporting materials, and basic packaging.

**Direct Labor**
The wages paid to produce one unit. If you pay workers per piece, this is straightforward. If you pay monthly salaries, divide total monthly wages by the number of units produced per month.

**Factory Overhead**
Electricity, water, facility rent, machine maintenance divided by monthly production volume.

**Simple Example:**

| Component | Cost Per Unit |
|---|---|
| Raw materials | Rp 45,000 |
| Direct labor | Rp 12,000 |
| Factory overhead | Rp 8,000 |
| **Total COGS** | **Rp 65,000** |

---

## Step 2: Add All Export-Specific Costs

This is what new exporters most often forget. Export costs go far beyond just ocean freight.

**Export Packaging**
Export packaging must be stronger than domestic packaging (reinforced cartons, bubble wrap, wooden pallets). This adds Rp 3,000-15,000 per unit depending on your product.

**Certifications**
Depending on your product and destination country, you may need halal certification, phytosanitary certificate, SNI standard compliance, or lab testing. Divide these costs across your total export volume.

**Export Documentation**
Export declaration (PEB), Certificate of Origin, and other documents. Typically Rp 500,000-2,000,000 per shipment.

**Inland Trucking to Port**
From your warehouse to the departure port. Get quotes from at least 3 freight forwarders to compare.

**Ocean Freight**
Depends on cargo volume, weight, and destination port. Your freight forwarder will provide this.

**Cargo Insurance**
Typically 0.2%-0.5% of cargo value. Don't skip this. If goods are damaged or lost without insurance, the loss is yours entirely.

---

## Step 3: Set a Selling Price That Makes Sense

Once you know your total cost, add your profit margin. For export, **a minimum of 15-20%** above total cost is a safe target to cover currency risk, potential returns, and unexpected costs.

**Complete Example:**

| Component | Per Unit |
|---|---|
| COGS | Rp 65,000 |
| Export packaging | Rp 8,000 |
| Certification (divided) | Rp 2,000 |
| Export documents (divided) | Rp 1,500 |
| Trucking (divided) | Rp 3,000 |
| Ocean freight (divided) | Rp 15,000 |
| Insurance (divided) | Rp 1,500 |
| **Total cost** | **Rp 96,000** |
| 20% margin | Rp 19,200 |
| **FOB Selling Price** | **Rp 115,200** |

If today's USD/IDR rate = Rp 15,800, your FOB price in USD = **$7.29 per unit**.

---

## Why This Matters Before You Negotiate

When you know these numbers, you can negotiate with confidence. You know exactly where your floor price is: the minimum price below which you'd lose money. You know when an offer makes sense and when to walk away.

Without this data, you're guessing. And guessing in export can turn into real financial losses.
`
  },

  {
    slug: "using-ai-to-support-export-decisions",
    title: "AI in Export: What It Actually Does for Exporters Like You",
    desc: "You don't need to be a tech expert to benefit from AI. Here's how it helps first-time exporters make smarter, safer decisions.",
    category: "Technology",
    readTime: "4 min read",
    image: "/blog/blog5.jpg",
    author: "EXORA Advisory Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "AI in export platforms is like an always-available advisor: ask it anything, anytime.",
      "AI doesn't replace your decisions; it helps you see risks you might have missed.",
      "The more accurate data you put in, the more useful the recommendation you get out.",
      "Use AI as a second opinion before committing to a large contract."
    ],
    sources: [
      { title: "AI Applications in SME Trade Finance", org: "World Economic Forum (WEF)" },
      { title: "Digital Trade Facilitation Tools for Exporters", org: "International Trade Centre (ITC)" },
      { title: "Technology Adoption in Export SMEs", org: "McKinsey Global Institute" }
    ],
    content: `
## Practical AI for Exporters: No Coding Required

When you hear "AI" or "artificial intelligence," you might picture robots or lines of code: things that feel far from exporting crafts, agricultural products, or garments.

But in the context of export business tools, AI works like this:

> You enter your business data → AI analyzes it and gives you a recommendation → You decide what to do with it.

That's it. No coding required.

---

## The Problem Exporters Face Without This Kind of Help

Imagine you receive an inquiry from a new buyer in Nigeria for 5,000 units of your handcraft product worth $15,000. Questions immediately start piling up:

- Is this price profitable enough after all costs?
- How risky is this market? What's the economic situation like in Nigeria right now?
- They want to pay by bank transfer 60 days after goods arrive. Is that safe?
- What Incoterm should I use?

If you had to research all of this yourself, it could take days and findings might still be incomplete.

---

## What AI Can Actually Do for You

### 1. Instantly Check if an Order Makes Financial Sense
You enter your production cost, target selling price, freight cost, and payment terms. The AI immediately tells you: is the margin healthy? Is this order worth taking, based on real numbers?

Think of it like having an accountant who can answer your questions in seconds.

### 2. Flag Risks You Might Have Overlooked
AI can identify risks you might not have thought of, such as:
- Destination country has elevated political or economic risk right now
- Payment terms requested by buyer are unusual and potentially dangerous
- Incoterm being discussed doesn't match the type of goods or destination port

### 3. Answer "What If" Questions
You can ask: *"What if ocean freight goes up 20%?"* or *"What if the exchange rate drops to 14,500?"* and the AI immediately shows the impact on your margin.

This helps you prepare for different scenarios before you sign any contract.

---

## Important Things to Keep in Mind

**AI is only as good as the data you give it.** If your cost figures are rough estimates, the recommendations will also be rough. The more accurate and complete your data, the more useful the output.

**AI doesn't make decisions for you.** It gives you an analysis, not a final answer. You still decide whether to take the order because you know your business situation best.

**Think of AI as a second opinion.** It's like having a knowledgeable business partner available 24/7.

---

## Who Benefits Most From AI Export Tools?

Small and first-time exporters benefit most from these tools. Large companies already have finance teams, legal teams, and paid consultants.

AI tools level the playing field by giving access to analysis previously reserved for large corporations.

Using these tools from day one is a practical way to make better decisions.
`
  }
];
