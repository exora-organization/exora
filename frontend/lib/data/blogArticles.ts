export interface BlogArticle {
  slug: string;
  title: string;
  desc: string;
  category: string;
  readTime: string;
  image: string;
  author: string;
  publishedAt: string;
  content: string; // Markdown or HTML content
  sources: { title: string; url?: string; org: string }[];
  keyTakeaways: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "understanding-incoterms-exw-fob-cfr-cif",
    title: "Understanding Incoterms: EXW, FOB, CFR, and CIF",
    desc: "Learn how different Incoterms influence export pricing, responsibilities, and logistics.",
    category: "Incoterms",
    readTime: "5 min read",
    image: "/blog/blog1.jpg",
    author: "EXORA Trade Advisory Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Incoterms define exact risk and cost transfer boundaries between seller and buyer.",
      "FOB (Free On Board) is the most widely used rule for sea freight exports.",
      "CIF includes Marine Insurance, whereas CFR leaves insurance to the buyer.",
      "Choosing the wrong Incoterm can lead to unexpected transport costs or unhedged transit risks."
    ],
    sources: [
      { title: "Incoterms® 2020 Rules & Official Guidance", org: "International Chamber of Commerce (ICC)" },
      { title: "International Trade Logistics & Freight Standards", org: "World Trade Organization (WTO)" },
      { title: "Export Commercial Terms Handbook", org: "International Trade Centre (ITC)" }
    ],
    content: `
## Introduction to Incoterms 2020

International Commercial Terms (**Incoterms**) are a set of 11 standardized trade rules published by the **International Chamber of Commerce (ICC)**. They establish clear boundaries regarding:
1. **Cost Allocation**: Who pays for transport, packaging, port handling, freight, and insurance?
2. **Risk Transfer**: At what exact physical location does risk pass from exporter to buyer?
3. **Documentary Responsibility**: Who is responsible for customs clearance and licenses?

Understanding the core differences between **EXW**, **FOB**, **CFR**, and **CIF** is essential to prevent costly pricing misunderstandings.

---

## 1. EXW — Ex Works (Factory Pick-up)

Under **EXW**, the exporter's sole obligation is to make the goods available at their factory or warehouse. 

* **Seller Responsibility**: HPP (COGS), export packaging, and certificate of origin.
* **Buyer Responsibility**: Inland transport in origin country, export customs clearance, ocean freight, marine insurance, and import clearance.
* **Risk Transfer**: At the seller's premises when goods are placed at buyer's disposal.
* **Best Used For**: E-commerce or experienced buyers with strong domestic freight forwarding networks in the seller's country.

---

## 2. FOB — Free On Board (Loaded at Origin Port)

**FOB** is the gold standard for ocean container shipping. The exporter delivers goods onto the vessel nominated by the buyer at the named origin port.

* **Seller Responsibility**: HPP, packaging, certification, and inland transport + origin port loading fees.
* **Buyer Responsibility**: Ocean freight, marine insurance, destination port charges, and import customs.
* **Risk Transfer**: Once the goods are loaded on board the vessel at the port of shipment.
* **Best Used For**: Containerized ocean freight where buyer has preferred shipping lines and better volume rates.

---

## 3. CFR — Cost and Freight (Freight Paid to Destination)

Under **CFR**, the exporter pays for ocean freight to transport the goods to the named destination port. However, marine transit risk passes to the buyer as soon as goods are on board.

* **Seller Responsibility**: HPP, packaging, certification, inland transport, and ocean freight.
* **Buyer Responsibility**: Marine cargo insurance, destination port unloading, and import clearance.
* **Risk Transfer**: On board the vessel at the origin port (same as FOB).
* **Best Used For**: Buyers who prefer seller to handle shipping logistics but maintain their own cargo insurance policy.

---

## 4. CIF — Cost, Insurance & Freight (Full Coverage)

Under **CIF**, the exporter pays for ocean freight AND marine cargo insurance covering transit to the destination port.

* **Seller Responsibility**: HPP, packaging, certification, inland transport, ocean freight, and marine cargo insurance.
* **Buyer Responsibility**: Destination port charges, import customs clearance, and inland transport to final warehouse.
* **Risk Transfer**: On board the vessel at origin port.
* **Best Used For**: Initial export transactions where buyers require a complete turnkey delivered price.

---

## Summary Responsibility Matrix

| Cost Component | EXW | FOB | CFR | CIF |
| :--- | :---: | :---: | :---: | :---: |
| **Packaging & COGS** | Seller | Seller | Seller | Seller |
| **Inland Transport to Port** | Buyer | Seller | Seller | Seller |
| **Export Customs & Loading** | Buyer | Seller | Seller | Seller |
| **Ocean Freight** | Buyer | Buyer | Seller | Seller |
| **Marine Insurance** | Buyer | Buyer | Buyer | Seller |
| **Import Clearance** | Buyer | Buyer | Buyer | Buyer |

`
  },
  {
    slug: "common-mistakes-new-exporters-should-avoid",
    title: "Common Mistakes New Exporters Should Avoid",
    desc: "Discover the financial and operational mistakes that often lead to unsuccessful export projects.",
    category: "Strategy",
    readTime: "7 min read",
    image: "/blog/blog2.jpg",
    author: "EXORA Risk Advisory Board",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Never ship on Open Account (O/A) with first-time international buyers.",
      "Calculate complete landed costs early to avoid margin erosion from hidden port fees.",
      "Verify destination country health, labeling, and import permit compliance before shipping.",
      "Hedge against foreign exchange volatility when quoting in foreign currencies."
    ],
    sources: [
      { title: "SME Export Readiness & Risk Guide", org: "International Trade Centre (ITC)" },
      { title: "Exporting Best Practices & Common Pitfalls", org: "U.S. Commercial Service" },
      { title: "International Trade Finance & Risk Mitigation", org: "Export-Import Bank" }
    ],
    content: `
## Navigating the Challenges of First-Time Exporting

Expanding into international markets offers immense growth opportunities for businesses. However, emerging exporters frequently encounter operational and financial pitfalls that can erode profit margins or result in confiscated cargo.

Here are the **top 5 mistakes** new exporters must avoid to ensure sustainable global operations.

---

## 1. Accepting Unsecured Payment Terms for New Buyers

Offering **Open Account (O/A)** terms to an unverified overseas buyer exposes your business to catastrophic non-payment risk. Overseas debt collection is extremely complex, expensive, and often unrecoverable.

* **Solution**: Demand **30% - 50% T/T Advance Deposit** prior to production, with the remaining balance due against shipping documents (Bill of Lading), or request an **Irrevocable Letter of Credit (L/C)** issued by a reputable international bank.

---

## 2. Underestimating Hidden Logistics & Port Demurrage Costs

Many new exporters calculate prices based solely on production costs and ocean freight, forgetting secondary charges such as terminal handling charges (THC), container detention, storage fees, and customs inspection costs.

* **Solution**: Build a comprehensive cost structure that includes packaging, certificates of origin, domestic transport, forwarding fees, and a **5% contingency buffer**.

---

## 3. Ignoring Destination Country Technical Standards & Labeling Rules

Shipping goods without confirming destination import requirements (such as food safety regulations, ingredient bans, language labeling, or mandatory certification) often leads to custom holds or mandatory destruction at the buyer's port.

* **Examples**:
  * **Singapore (SFA)**: Requires strict pesticide residue testing for food imports.
  * **South Korea (MFDS)**: Mandates detailed Korean-language allergen labels on packaging.
* **Solution**: Request exact import permit checklists from your buyer or destination customs broker before dispatching cargo.

---

## 4. Failing to Protect Against Currency Exchange Rate Shifts

When quoting prices in foreign currency (such as USD, EUR, or SGD), a 5% - 10% currency devaluation against your local currency between quotation date and payment arrival can completely wipe out your profit margin.

* **Solution**: Factor in realistic exchange rate buffers or utilize financial hedging tools like **Forward Exchange Contracts (FEC)** with your banking partner.

---

## 5. Relying on Informal or Incomplete Export Documentation

Discrepancies in commercial documents (e.g., misspelled buyer names, mismatched HS codes, or incorrect net weights between Invoice and Packing List) will cause bank rejections under Letter of Credit processing and customs delays.

* **Solution**: Implement standardized document verification protocols before releasing original Bill of Lading documents.

`
  },
  {
    slug: "how-exchange-rates-affect-export-profitability",
    title: "How Exchange Rates Affect Export Profitability",
    desc: "Understand how currency fluctuations influence pricing and overall business performance.",
    category: "Finance",
    readTime: "6 min read",
    image: "/blog/blog3.jpg",
    author: "EXORA Financial Analytics Group",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Currency fluctuations directly impact export revenue and competitiveness.",
      "Local currency strengthening reduces IDR export revenue when quoting in USD.",
      "Forward Exchange Contracts (FEC) lock in exchange rates to protect profit margins.",
      "Natural hedging occurs when export costs and revenues are denominated in the same currency."
    ],
    sources: [
      { title: "Foreign Exchange Risk Management Guidelines", org: "Bank Indonesia (BI)" },
      { title: "Currency Volatility & International Trade Stability", org: "International Monetary Fund (IMF)" },
      { title: "Trade Finance FX Risk Strategies", org: "Trade Finance Global (TFG)" }
    ],
    content: `
## The Impact of Foreign Exchange Dynamics on Export Business

For international exporters, price calculations and profit margins are inextricably linked to foreign exchange (FX) rates. Because export contracts are quoted in hard currencies like **USD**, **SGD**, or **EUR**, while local production costs are incurred in **IDR**, exchange rate shifts can make the difference between a profitable shipment and a net financial loss.

---

## 1. Understanding Transaction Exposure in Exporting

**Transaction exposure** occurs when an export sale contract is agreed upon at time $t_0$, but the buyer pays in foreign currency at a later date $t_1$.

### Practical Scenario:
* **Production Cost**: Rp 150.000.000
* **Quoted Selling Price**: USD 12.000
* **Rate at Quotation ($t_0$)**: USD 1 = Rp 15.000 $\rightarrow$ **Expected Revenue**: Rp 180.000.000 *(Expected Margin: 16.7%)*

If the IDR appreciates by 5% to **USD 1 = Rp 14.250** when buyer pays 60 days later:
* **Actual Received Revenue**: $12.000 \times 14.250 =$ **Rp 171.000.000**
* **Actual Profit Margin**: Drops to **12.2%** *(Loss of Rp 9.000.000 due to currency shift alone!)*

---

## 2. Key Foreign Exchange Strategies for Exporters

To mitigate currency volatility, successful exporters employ three proven strategies:

### A. Forward Exchange Contracts (FEC)
A **Forward Contract** allows an exporter to lock in a specific exchange rate with their commercial bank for a transaction set to settle at a future date (e.g. 30, 60, or 90 days ahead). This guarantees exact local currency revenue regardless of spot market fluctuations.

### B. FX Clause / Exchange Adjustment Clauses
Include an **Exchange Adjustment Clause** in commercial contracts stating that if the spot exchange rate fluctuates by more than $\pm 5\%$, the USD contract price will be adjusted proportionally.

### C. Natural Hedging
Procure imported raw materials or machinery in the same foreign currency (USD) used for export invoicing. This creates an automatic balance between USD inflows and outflows.

---

## 3. Best Practices for Setting Baseline Exchange Rates

* **Never Use Spot Rate Directly for Long-Term Quotes**: Always apply a 2% - 3% safety margin below current spot rates when calculating minimum acceptable unit prices.
* **Monitor Central Bank Benchmark Rates**: Track Bank Indonesia (JISDOR) and Federal Reserve interest rate announcements to anticipate currency trends.

`
  },
  {
    slug: "preparing-financial-data-before-exporting",
    title: "Preparing Financial Data Before Exporting",
    desc: "A practical guide to gathering production costs, logistics expenses, and pricing information.",
    category: "Costing",
    readTime: "8 min read",
    image: "/blog/blog4.jpg",
    author: "EXORA Export Costing Specialist",
    publishedAt: "July 2026",
    keyTakeaways: [
      "Export costing requires adding packaging, certification, and transport onto base HPP.",
      "Accurate quantity calculation is crucial because fixed logistics costs are amortized per unit.",
      "Target margin must account for unexpected port fees and payment term financing costs.",
      "Clean financial data is mandatory for obtaining trade finance from commercial banks."
    ],
    sources: [
      { title: "Export Costing & Pricing Management Framework", org: "ACCA Global" },
      { title: "Trade Logistics Cost Structure Standards", org: "Global Trade Review (GTR)" },
      { title: "SME Export Financial Planning Manual", org: "Indonesian Ministry of Trade" }
    ],
    content: `
## Why Accurate Financial Preparation Matters

Before issuing a single proforma invoice to an overseas buyer, an exporting company must construct a rigorous financial cost model. Oversights in initial cost accounting cannot be easily rectified once a binding international contract is signed.

---

## 1. The 6 Building Blocks of Export Costing

A comprehensive export cost calculation consists of 6 sequential layers:

### Layer 1: HPP / COGS (Cost of Goods Sold)
Direct raw materials, direct labor, and manufacturing overhead required to produce one unit of product.

### Layer 2: Export Packaging & Bundling
Specialized export packaging (e.g. moisture-resistant barrier bags, heat-treated wooden pallets ISPM-15, strapping, and corrugated master cartons).

### Layer 3: Certification & Compliance Fees
Phytosanitary certificates, Halal certification, Health Certificates, COO (Certificate of Origin / Form E), and lab testing fees required by destination authorities.

### Layer 4: Domestic Transportation to Origin Port
Trucking costs from factory warehouse to origin container terminal (ICD/Port), container stuffing charges, and origin customs inspection fees.

### Layer 5: Ocean / Air Freight & Port Handling (THC)
Container freight rates, shipping line documentation fees, terminal handling charges, and bunker adjustment factors (BAF).

### Layer 6: Marine Cargo Insurance & Contingency
Insurance policy covering "All Risks" Institute Cargo Clauses (A) plus a 5% contingency buffer for currency fluctuations and unexpected port waiting times.

---

## 2. Formula for Export Price Determination

To determine the minimum selling price per unit under target margin $M\%$:

$$\text{Total Base Cost} = \text{HPP} + \text{Packaging} + \text{Certifications} + \text{Transport} + \text{Freight} + \text{Insurance}$$

$$\text{Unit Base Cost} = \frac{\text{Total Base Cost}}{\text{Quantity}}$$

$$\text{Export Selling Price (IDR)} = \frac{\text{Unit Base Cost}}{1 - \frac{M}{100}}$$

$$\text{Export Selling Price (USD)} = \frac{\text{Export Selling Price (IDR)}}{\text{Exchange Rate}}$$

---

## 3. Financial Checklist Before First Export Order

- [x] Verified factory HPP per unit with exact material bill of materials (BOM).
- [x] Obtained written quotes from 2+ licensed freight forwarders.
- [x] Verified heat-treatment compliance (ISPM-15) for wooden pallets.
- [x] Validated current exchange rate and set 3% safety margin buffer.
- [x] Confirmed target profit margin aligns with company financial targets.

`
  },
  {
    slug: "using-ai-to-support-export-decisions",
    title: "Using AI to Support Export Decisions",
    desc: "Learn how AI powered recommendations can assist businesses in evaluating export opportunities.",
    category: "Technology",
    readTime: "4 min read",
    image: "/blog/blog5.jpg",
    author: "EXORA Tech & AI Development Team",
    publishedAt: "July 2026",
    keyTakeaways: [
      "AI models automate complex multi-variable export feasibility calculations in seconds.",
      "Fact-grounded RAG (Retrieval-Augmented Generation) prevents AI hallucinations.",
      "AI Decision Advisors combine Incoterms, market risk, and financial margins for executive insights.",
      "Data integrity & security standards (ISO 27001) ensure trade confidentiality."
    ],
    sources: [
      { title: "Trade Tech Report: Artificial Intelligence in Global Trade", org: "World Economic Forum (WEF)" },
      { title: "AI-Driven Supply Chain Transformation", org: "McKinsey & Company" },
      { title: "ISO/IEC 27001 Information Security in AI Decision Systems", org: "ISO Organization" }
    ],
    content: `
## The Evolution of Artificial Intelligence in International Trade

International export operations involve analyzing vast amounts of fragmented data: freight rates, Incoterm risk allocations, currency exchange rates, country risk indices, destination tariff structures, and complex trade documentation.

Modern AI systems — specifically **Retrieval-Augmented Generation (RAG)** architecture — allow exporting companies to evaluate trade opportunities with unprecedented speed, accuracy, and confidence.

---

## 1. How AI Decision Assistance Works in Export Management

Rather than relying on generic AI models that can generate unverified claims, enterprise export platforms like **EXORA** utilize a structured 3-stage AI advisory workflow:


> **EXORA AI Workflow:**
>
> **[System Cost & Case Data]** + **[Curated Trade Knowledge Base]**
>
> ↓
>
> **[Strict Low-Temperature Prompting (0.15)]**
>
> ↓
>
> **[Executive Feasibility & Risk Recommendation Report]**


### Key Capabilities:
1. **Automated Feasibility Scoring**: Instantly combines Profitability (50%), Country Risk (30%), and Payment Term Security (20%) into an objective 0–100 feasibility score.
2. **Context-Aware Risk Assessment**: Evaluates specific Incoterms (EXW, FOB, CFR, CIF) against buyer payment terms to highlight hidden financial risks.
3. **Conversational Trade Q&A**: Allows trade managers to simulate "what-if" scenarios (e.g. *"What happens if ocean freight increases by 15%?"*) without altering official reports.

---

## 2. Preventing AI Hallucinations in Financial Trade Advice

For AI to be usable in corporate trade decision-making, it must adhere to strict **Anti-Hallucination Guardrails**:
* **Low Temperature Settings (0.15)**: Ensures deterministic, factual responses anchored strictly in verified numerical data.
* **Verbatim Fact Grounding**: Every price, margin, and percentage cited by the AI must come directly from verified system inputs.
* **Fallback to Knowledge Base**: When specific country regulations are requested, the AI retrieves information from verified, curated trade repositories rather than unverified web sources.

---

## 3. The Future of Smart Export Operations

By combining human expertise with AI-powered analytics, exporters can reduce case evaluation time from days to seconds, minimize costly logistics errors, and execute international trade expansion with maximum profitability.

`
  }
];
