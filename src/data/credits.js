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
  { id: "Soil Carbon", label: "Soil Carbon", color: "#a78bfa" },
  { id: "Plastic / EPR", label: "EPR Plastic", color: "#ec4899" },
  { id: "Blue Carbon", label: "Blue Carbon", color: "#0891b2" },
];

export const TYPE_COLORS = {
  "CBG / Biogas": "#22c55e",
  "Soil Carbon": "#a78bfa",
  "Ocean Plastic": "#3b82f6",
  "Biomass": "#f59e0b",
  "Blue Carbon": "#0891b2",
  "Plastic / EPR": "#ec4899",
  "Carbon / Forestry": "#10b981",
};

export const CREDITS = [
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
      "Compressed Biogas plant in Khordha district, Odisha. Processes 1,00,000 kg/day cow dung via anaerobic digestion, avoiding open storage methane emissions from 10,000 cattle.",
    sdgs: [7, 13, 8],
  },
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
    registry: "Verra VCS VM0017",
    standard: "Verra VCS VM0017",
    certId: "VCS-CB-002-JH",
    desc:
      "200 smallholder farmers in Jharkhand planting 50,000 trees on degraded land under agroforestry. Carbon Bridge aggregated under one Programme of Activity, reducing registration cost by 90%.",
    sdgs: [13, 1, 15],
  },
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
      "Marine plastic collection along Odisha's Puri-Chilika coastline by 500 waste collectors. Each credit = 1 tonne plastic removed from ocean-bound waterways.",
    sdgs: [14, 1, 11],
  },
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
      "500 farmers converting agricultural residue (paddy straw, sugarcane bagasse) into biomass pellets replacing coal in industrial boilers, avoiding 9,800 tCO₂e per year.",
    sdgs: [7, 13, 8],
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
      "500 FPO farmers in Odisha adopting zero-tillage, cover cropping, and biochar application. GPS + satellite MRV by Carbon Bridge reduces verification cost by 60%.",
    sdgs: [2, 13, 15],
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
    registry: "Verra AMS-III.R + AMS-I.C",
    standard: "Verra AMS-III.R + AMS-I.C",
    certId: "VCS-CB-006-HR",
    desc:
      "5 SATAT-registered CBG plants in Haryana aggregated under one Carbon Bridge PoA. Combined 90,000 tCO₂e/year from methane avoidance and fossil CNG displacement.",
    sdgs: [7, 13, 9],
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
      "EPR plastic credits from Karnataka recyclers. Companies use these to meet their Extended Producer Responsibility targets under India's Plastic Waste Management Rules 2022.",
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
    registry: "Verra VCS",
    standard: "Verra VCS",
    certId: "VCS-CB-008-WB",
    desc:
      "Sundarban mangrove restoration covering 3,000 hectares in West Bengal. Blue carbon sequestration while protecting coastal communities from cyclones and storm surge.",
    sdgs: [14, 13, 15],
  },
];

export const FEATURED_IDS = [1, 6, 8];

export const getFeatured = () =>
  FEATURED_IDS.map((id) => CREDITS.find((c) => c.id === id)).filter(Boolean);

export const STATES = [...new Set(CREDITS.map((c) => c.state))].sort();
export const STATE_COUNT = STATES.length;

export const COUNTRY_COUNT = new Set(CREDITS.map((c) => c.country)).size;

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
