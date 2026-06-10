export const USD_TO_INR = 83.5;

export const usdToInr = (usd) => Math.round(usd * USD_TO_INR);

export const formatINR = (usd) =>
  `₹${usdToInr(usd).toLocaleString("en-IN")}`;

export const formatUSD = (usd) => `~$${usd.toFixed(2)}`;

export const CATEGORIES = [
  { id: "all", label: "All", color: "#38bdf8" },
  { id: "CBG / Biogas", label: "CBG / Biogas", color: "#22c55e" },
  { id: "Carbon / Forestry", label: "Carbon / Forestry", color: "#10b981" },
  { id: "Ocean Plastic", label: "Ocean Plastic", color: "#3b82f6" },
  { id: "Biomass", label: "Biomass", color: "#f59e0b" },
  { id: "Renewable Energy", label: "Renewable Energy", color: "#eab308" },
  { id: "Soil Carbon", label: "Soil Carbon", color: "#a78bfa" },
  { id: "Plastic / EPR", label: "EPR Plastic", color: "#ec4899" },
  { id: "Blue Carbon", label: "Blue Carbon", color: "#0891b2" },
  { id: "Clean Cooking", label: "Clean Cooking", color: "#22d3ee" },
  { id: "Green Hydrogen", label: "Green Hydrogen", color: "#14b8a6" },
];

export const TYPE_COLORS = {
  "CBG / Biogas": "#22c55e",
  "Soil Carbon": "#a78bfa",
  "Ocean Plastic": "#3b82f6",
  Biomass: "#f59e0b",
  "Renewable Energy": "#eab308",
  "Blue Carbon": "#0891b2",
  "Plastic / EPR": "#ec4899",
  "Carbon / Forestry": "#10b981",
  "Clean Cooking": "#22d3ee",
  "Green Hydrogen": "#14b8a6",
};

export const CREDITS = [
  // ---------------------------- INDIA — CBG & BIOGAS ----------------------------
  {
    id: 1,
    name: "Odisha CBG Plant — 10,000 Cow Herd",
    type: "CBG / Biogas",
    country: "India",
    flag: "🇮🇳",
    state: "Odisha",
    icon: "🐄",
    color: "#22c55e",
    price: 8.5,
    vintage: 2025,
    available: 18000,
    creditsLeft: 18000,
    registry: "Verra AMS-III.R",
    standard: "Verra AMS-III.R",
    certId: "VCS-CB-001-OD",
    desc:
      "Compressed Biogas plant in Khordha district, Odisha. Processes 1,00,000 kg/day cow dung via anaerobic digestion, avoiding open-storage methane emissions from 10,000 cattle and displacing fossil CNG in local transport.",
    sdgs: [7, 13, 8],
  },
  {
    id: 6,
    name: "SATAT CBG Cluster — Haryana 5 Plants",
    type: "CBG / Biogas",
    country: "India",
    flag: "🇮🇳",
    state: "Haryana",
    icon: "⚡",
    color: "#06b6d4",
    price: 7.8,
    vintage: 2025,
    available: 90000,
    creditsLeft: 90000,
    registry: "Verra AMS-III.R + SATAT",
    standard: "Verra AMS-III.R + SATAT",
    certId: "VCS-CB-006-HR",
    desc:
      "Five SATAT-registered CBG plants in Sonipat, Panipat, and Karnal aggregated under one Carbon Bridge PoA. Combined 90,000 tCO₂e/year from manure methane avoidance and fossil CNG displacement with IOCL offtake.",
    sdgs: [7, 13, 9],
  },
  {
    id: 12,
    name: "Punjab Dairy CBG — 3,000 Head Cluster",
    type: "CBG / Biogas",
    country: "India",
    flag: "🇮🇳",
    state: "Punjab",
    icon: "🥛",
    color: "#22c55e",
    price: 8.1,
    vintage: 2025,
    available: 24000,
    creditsLeft: 24000,
    registry: "Verra AMS-III.D + SATAT",
    standard: "Verra AMS-III.D + SATAT",
    certId: "VCS-CB-012-PB",
    desc:
      "Three cooperative dairy clusters in Ludhiana and Jalandhar converting lagoon manure to compressed biogas. SATAT-registered with BPCL offtake; Carbon Bridge PoA cuts per-farm registration cost for 180 member dairy households.",
    sdgs: [7, 13, 2],
  },
  {
    id: 13,
    name: "Maharashtra MSW Methane Recovery — Pune",
    type: "CBG / Biogas",
    country: "India",
    flag: "🇮🇳",
    state: "Maharashtra",
    icon: "♻️",
    color: "#22c55e",
    price: 9.4,
    vintage: 2024,
    available: 11200,
    creditsLeft: 11200,
    registry: "Verra AMS-III.AO",
    standard: "Verra AMS-III.AO",
    certId: "VCS-CB-013-MH",
    desc:
      "Organic fraction of municipal solid waste diverted from Uruli Devachi landfill to a controlled hydrolysis digester. Captures landfill methane and produces biogas for captive industrial heat — aligned with SBM-Urban waste-to-energy goals.",
    sdgs: [11, 13, 12],
  },

  // ---------------------------- INDIA — FORESTRY & SOIL ----------------------------
  {
    id: 2,
    name: "Jharkhand FPO Agroforestry — 200 Farmers",
    type: "Carbon / Forestry",
    country: "India",
    flag: "🇮🇳",
    state: "Jharkhand",
    icon: "🌱",
    color: "#10b981",
    price: 7.2,
    vintage: 2024,
    available: 4500,
    creditsLeft: 4500,
    registry: "Verra VCS VM0047",
    standard: "Verra VCS VM0047",
    certId: "VCS-CB-002-JH",
    desc:
      "200 smallholder farmers in Gumla and Simdega planting 50,000 native and fruit trees on degraded land under agroforestry. Carbon Bridge aggregated under one Programme of Activity, reducing registration cost by 90%.",
    sdgs: [13, 1, 15],
  },
  {
    id: 5,
    name: "Odisha Regenerative Soil Carbon — 500 FPOs",
    type: "Soil Carbon",
    country: "India",
    flag: "🇮🇳",
    state: "Odisha",
    icon: "🌍",
    color: "#a78bfa",
    price: 9.0,
    vintage: 2025,
    available: 6000,
    creditsLeft: 6000,
    registry: "Verra Soil VM0042",
    standard: "Verra Soil VM0042",
    certId: "VCS-CB-005-OD",
    desc:
      "500 FPO farmers in Koraput and Kalahandi adopting zero-tillage, cover cropping, and biochar application. GPS soil sampling plus satellite MRV by Carbon Bridge reduces verification cost by 60%.",
    sdgs: [2, 13, 15],
  },
  {
    id: 14,
    name: "Kerala Agroforestry PoA — 120 Spice Growers",
    type: "Carbon / Forestry",
    country: "India",
    flag: "🇮🇳",
    state: "Kerala",
    icon: "🌴",
    color: "#10b981",
    price: 8.8,
    vintage: 2025,
    available: 3200,
    creditsLeft: 3200,
    registry: "Verra VCS VM0017",
    standard: "Verra VCS VM0017",
    certId: "VCS-CB-014-KL",
    desc:
      "Cardamom and pepper growers in Idukki intercropping shade trees on sloped plantations. SALM methodology with community-conserved buffer zones along Periyar tributaries.",
    sdgs: [13, 15, 8],
  },

  // ---------------------------- INDIA — PLASTIC & BLUE CARBON ----------------------------
  {
    id: 3,
    name: "Puri Coast Ocean Plastic Credits",
    type: "Ocean Plastic",
    country: "India",
    flag: "🇮🇳",
    state: "Odisha",
    icon: "🌊",
    color: "#3b82f6",
    price: 14.0,
    vintage: 2025,
    available: 2200,
    creditsLeft: 2200,
    registry: "Verra W+",
    standard: "Verra W+",
    certId: "VCS-CB-003-OR",
    desc:
      "Marine plastic collection along Odisha's Puri–Chilika coastline by 500 waste collectors. Each credit = 1 tonne plastic removed from ocean-bound waterways before it reaches the Bay of Bengal.",
    sdgs: [14, 1, 11],
  },
  {
    id: 7,
    name: "Karnataka EPR Plastic Credits",
    type: "Plastic / EPR",
    country: "India",
    flag: "🇮🇳",
    state: "Karnataka",
    icon: "♻️",
    color: "#ec4899",
    price: 11.5,
    vintage: 2025,
    available: 3400,
    creditsLeft: 3400,
    registry: "CPCB EPR",
    standard: "CPCB EPR",
    certId: "CPCB-EPR-CB-007-KA",
    desc:
      "EPR plastic credits from Bengaluru and Hubli recyclers registered on the CPCB EPR Portal. PIBOs use these to meet Extended Producer Responsibility targets under India's Plastic Waste Management Rules 2022.",
    sdgs: [12, 11, 13],
  },
  {
    id: 8,
    name: "West Bengal Mangrove Blue Carbon",
    type: "Blue Carbon",
    country: "India",
    flag: "🇮🇳",
    state: "West Bengal",
    icon: "🌿",
    color: "#0891b2",
    price: 19.5,
    vintage: 2024,
    available: 1800,
    creditsLeft: 1800,
    registry: "Verra VCS VM0033",
    standard: "Verra VCS VM0033",
    certId: "VCS-CB-008-WB",
    desc:
      "Sundarban mangrove restoration covering 3,000 hectares in South 24 Parganas. Blue carbon sequestration in sediment-rich tidal wetlands while protecting coastal communities from cyclones and storm surge.",
    sdgs: [14, 13, 15],
  },

  // ---------------------------- INDIA — BIOMASS & RENEWABLES ----------------------------
  {
    id: 4,
    name: "Rajasthan Biomass Pellet Programme",
    type: "Biomass",
    country: "India",
    flag: "🇮🇳",
    state: "Rajasthan",
    icon: "🌾",
    color: "#f59e0b",
    price: 6.5,
    vintage: 2024,
    available: 9800,
    creditsLeft: 9800,
    registry: "Verra AMS-I.C",
    standard: "Verra AMS-I.C",
    certId: "VCS-CB-004-RJ",
    desc:
      "500 farmers in Sri Ganganagar converting paddy straw and sugarcane bagasse into biomass pellets replacing coal in industrial boilers, avoiding 9,800 tCO₂e per year across three brick-kiln clusters.",
    sdgs: [7, 13, 8],
  },
  {
    id: 15,
    name: "Rajasthan Wind Power — Jaisalmer 150 MW",
    type: "Renewable Energy",
    country: "India",
    flag: "🇮🇳",
    state: "Rajasthan",
    icon: "💨",
    color: "#eab308",
    price: 5.9,
    vintage: 2024,
    available: 142000,
    creditsLeft: 142000,
    registry: "Verra AMS-I.D",
    standard: "Verra AMS-I.D",
    certId: "VCS-CB-015-RJ",
    desc:
      "Grid-connected wind farm in Jaisalmer feeding into the Rajasthan DISCOM. India's high grid emission factor (~0.71 tCO₂/MWh) makes each MWh especially credit-rich under AMS-I.D.",
    sdgs: [7, 13, 9],
  },
  {
    id: 16,
    name: "Gujarat Solar Farm — Kutch 80 MW",
    type: "Renewable Energy",
    country: "India",
    flag: "🇮🇳",
    state: "Gujarat",
    icon: "☀️",
    color: "#eab308",
    price: 6.2,
    vintage: 2025,
    available: 76000,
    creditsLeft: 76000,
    registry: "Gold Standard GS-REN",
    standard: "Gold Standard GS-REN",
    certId: "GS-CB-016-GJ",
    desc:
      "Utility-scale solar in Bhuj, Kutch with verified SDG co-benefits for local employment and water conservation. Gold Standard certification commands a premium over standard VCS renewables.",
    sdgs: [7, 13, 8],
  },

  // ---------------------------- INDIA — GREEN HYDROGEN ----------------------------
  {
    id: 11,
    name: "Gujarat Green Hydrogen — SIGHT Phase II",
    type: "Green Hydrogen",
    country: "India",
    flag: "🇮🇳",
    state: "Gujarat",
    icon: "💧",
    color: "#14b8a6",
    price: 25.0,
    vintage: 2026,
    available: 4500,
    creditsLeft: 4500,
    registry: "NGHM + BIS IS 18435:2023",
    standard: "NGHM + BIS IS 18435:2023",
    certId: "NGHM-CB-011-GJ",
    desc:
      "Carbon Bridge's first green hydrogen listing under India's National Green Hydrogen Mission. 30 MW grid-connected electrolyzer powered by captive solar, producing 4,500 tonnes of green H₂/year for a Gujarat refinery under SECI SIGHT Phase II.",
    sdgs: [7, 9, 13],
  },
  {
    id: 17,
    name: "Andhra Pradesh Green H₂ — SIGHT Tranche B",
    type: "Green Hydrogen",
    country: "India",
    flag: "🇮🇳",
    state: "Andhra Pradesh",
    icon: "⚗️",
    color: "#14b8a6",
    price: 24.5,
    vintage: 2026,
    available: 3800,
    creditsLeft: 3800,
    registry: "NGHM SIGHT Phase II",
    standard: "NGHM SIGHT Phase II",
    certId: "NGHM-CB-017-AP",
    desc:
      "Letter of intent signed with a SIGHT Phase II awardee in Visakhapatnam. Biomass-assisted electrolysis route targeting steel-sector offtake; BIS IS 18435:2023 compliant at ≤ 2 kgCO₂e/kg H₂.",
    sdgs: [7, 9, 13],
  },

  // ---------------------------- INTERNATIONAL DEMO PROJECTS ----------------------------
  {
    id: 9,
    name: "Amazon Rainforest REDD+",
    type: "Carbon / Forestry",
    country: "Brazil",
    flag: "🇧🇷",
    state: "Amazonas",
    icon: "🌳",
    color: "#10b981",
    price: 14.5,
    vintage: 2024,
    available: 12400,
    creditsLeft: 12400,
    registry: "Verra VCS VM0007",
    standard: "Verra VCS VM0007",
    certId: "VCS-CB-009-BR",
    demo: true,
    desc:
      "REDD+ avoided-deforestation project in Amazonas, Brazil, protecting 80,000 hectares of primary rainforest in partnership with indigenous communities. Demo listing showing Carbon Bridge global sourcing capability.",
    sdgs: [13, 15, 1],
  },
  {
    id: 10,
    name: "Kenya Improved Cookstoves",
    type: "Clean Cooking",
    country: "Kenya",
    flag: "🇰🇪",
    state: "Nairobi",
    icon: "🔥",
    color: "#22d3ee",
    price: 18.2,
    vintage: 2025,
    available: 3100,
    creditsLeft: 3100,
    registry: "Gold Standard GS-TPDDTEC",
    standard: "Gold Standard GS-TPDDTEC",
    certId: "GS-CB-010-KE",
    demo: true,
    desc:
      "Distribution of 25,000 high-efficiency biomass cookstoves to rural Kenyan households, displacing open-fire wood combustion. Reduces emissions and indoor air pollution — demo international project via partner registry.",
    sdgs: [7, 3, 13],
  },
  {
    id: 18,
    name: "Methane Capture Landfill — Mexico City",
    type: "CBG / Biogas",
    country: "Mexico",
    flag: "🇲🇽",
    state: "Mexico City",
    icon: "🏭",
    color: "#22c55e",
    price: 10.8,
    vintage: 2024,
    available: 8600,
    creditsLeft: 8600,
    registry: "Verra AMS-III.AO",
    standard: "Verra AMS-III.AO",
    certId: "VCS-CB-018-MX",
    demo: true,
    desc:
      "Controlled hydrolysis of organic MSW diverted from Bordo Poniente landfill. Captures methane that would have escaped from open dumpsite decomposition — demo international waste-to-energy project.",
    sdgs: [11, 13, 12],
  },
  {
    id: 19,
    name: "Himalayan Community Biogas — Nepal",
    type: "CBG / Biogas",
    country: "Nepal",
    flag: "🇳🇵",
    state: "Gandaki",
    icon: "🏔️",
    color: "#22c55e",
    price: 12.4,
    vintage: 2025,
    available: 1900,
    creditsLeft: 1900,
    registry: "Gold Standard GS-MA",
    standard: "Gold Standard GS-MA",
    certId: "GS-CB-019-NP",
    demo: true,
    desc:
      "Community-scale anaerobic digesters in Pokhara valley serving 400 households. Gold Standard methane-avoidance credits with mandatory community consultation and SDG impact reporting — demo Himalayan programme.",
    sdgs: [7, 13, 1],
  },
];

export const FEATURED_IDS = [1, 6, 11];

/** Every marketplace listing is illustrative — no real projects are listed yet. */
export const ALL_LISTINGS_ARE_DEMO = true;

export const INDIA_CREDITS = CREDITS.filter((c) => c.country === "India");
export const INDIA_DEMO_COUNT = INDIA_CREDITS.length;
export const INDIA_STATE_COUNT = new Set(INDIA_CREDITS.map((c) => c.state)).size;
export const INTERNATIONAL_DEMO_COUNT = CREDITS.length - INDIA_DEMO_COUNT;

export const isDemoCredit = (credit) =>
  ALL_LISTINGS_ARE_DEMO || Boolean(credit?.demo);

export const DEMO_CREDITS = CREDITS;
export const LIVE_CREDITS = [];

export const getFeatured = () =>
  FEATURED_IDS.map((id) => CREDITS.find((c) => c.id === id)).filter(Boolean);

export const STATES = [...new Set(CREDITS.map((c) => c.state))].sort();
export const STATE_COUNT = STATES.length;

export const COUNTRIES = [...new Set(CREDITS.map((c) => c.country))].sort();
export const COUNTRY_COUNT = COUNTRIES.length;

export const BRAND = {
  company: "Carbon Bridge Pvt. Ltd.",
  shortCompany: "Carbon Bridge",
  tagline:
    "India's First Environmental Credit Marketplace — Carbon · Soil · Plastic · CBG · Biogas Credits",
  taglineShort: "India's First Environmental Credit Marketplace",
};

export const CONTACT = {
  founder: "Harsh Bhavrayat",
  email: "harshpaota@gmail.com",
  phone: "+91 90248 49162",
  phoneRaw: "+919024849162",
  company: BRAND.company,
  tagline: BRAND.tagline,
};
