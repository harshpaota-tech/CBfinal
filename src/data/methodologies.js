// =============================================================================
// Carbon Bridge — environmental credit methodology catalog
//
// Curated catalog of the methodologies under which Carbon Bridge can issue or
// list credits. Sources: Verra (verra.org), Gold Standard (goldstandard.org),
// CPCB (Plastic Waste Management Rules 2022), MNRE (National Green Hydrogen
// Mission Jan 2023). Descriptions are paraphrased — always read the original
// methodology document on the registry website before designing a project.
// =============================================================================

export const REGISTRIES = [
  { id: "verra",   name: "Verra (VCS)",      tag: "World's largest voluntary carbon program",        color: "#10b981", logo: "🌿" },
  { id: "gs",      name: "Gold Standard",    tag: "High-integrity standard backed by WWF & 80 NGOs", color: "#f59e0b", logo: "⭐" },
  { id: "india",   name: "India Schemes",    tag: "CPCB, SATAT, NGHM — domestic regulatory regimes", color: "#22c55e", logo: "🇮🇳" },
];

export const CATEGORIES = [
  { id: "all",       label: "All Methodologies" },
  { id: "afolu",     label: "Forestry & Land Use" },
  { id: "soil",      label: "Soil & Agriculture" },
  { id: "blue",      label: "Blue Carbon" },
  { id: "waste",     label: "Waste & Manure" },
  { id: "energy",    label: "Renewable Energy" },
  { id: "cooking",   label: "Cookstoves" },
  { id: "water",     label: "Water & Hygiene" },
  { id: "plastic",   label: "Plastic Waste" },
  { id: "transport", label: "Transport" },
  { id: "hydrogen",  label: "Green Hydrogen" },
];

// =============================================================================
// VERRA (VCS) methodologies
// =============================================================================
const VERRA = [
  // ---------- AFOLU: Forestry & Land Use ----------
  {
    code: "VM0007",
    name: "REDD+ Methodology Framework",
    registry: "verra", category: "afolu",
    scope: "Avoided deforestation and forest degradation (REDD+) across multiple project activities under a single modular framework.",
    desc: "The umbrella methodology for projects that prevent deforestation in tropical and sub-tropical forests. Modular design lets you combine VM0007 with sub-modules for biomass loss, soil carbon, and leakage so each project can match local conditions while staying VCS-compliant.",
    used: "Demo project: Amazon Rainforest REDD+ (Brazil).",
  },
  {
    code: "VM0010",
    name: "Improved Forest Management — Logged to Protected Forest",
    registry: "verra", category: "afolu",
    scope: "Conversion of commercial logging concessions to long-term protected forests.",
    desc: "For forest managers who give up logging revenue in exchange for permanent protection. Credits are issued against the carbon stock that would have been removed under business-as-usual logging.",
    used: "Reserved for large-area concession converters (>10,000 ha).",
  },
  {
    code: "VM0015",
    name: "Avoided Unplanned Deforestation",
    registry: "verra", category: "afolu",
    scope: "Projects that prevent agent-driven, unplanned deforestation by smallholders and migrants.",
    desc: "Targets the most common form of tropical deforestation: incremental clearing by communities for fuelwood and agriculture. Requires a deforestation risk model and a reference region.",
    used: "Suitable for Sundarban buffer zones and Western Ghats community-conserved areas.",
  },
  {
    code: "VM0047",
    name: "Afforestation, Reforestation & Revegetation (ARR)",
    registry: "verra", category: "afolu",
    scope: "Carbon sequestration from planting and regenerating trees on previously non-forested land.",
    desc: "Replaces the older AR-AMS0007. Accepts both monoculture plantations and native species mixes; requires a 30-year permanence buffer. Carbon Bridge aggregates smallholder farmers into Programmes of Activity to cut per-hectare registration cost by ~90%.",
    used: "Active: Jharkhand FPO Agroforestry — 200 smallholder farmers, 50,000 trees.",
  },
  {
    code: "VM0048",
    name: "Reducing Emissions from Deforestation (consolidated)",
    registry: "verra", category: "afolu",
    scope: "Updated 2023 framework for jurisdictional and project-scale REDD with stricter additionality and leakage rules.",
    desc: "Replaces VM0007 / VM0015 for new projects after 2024. Includes mandatory jurisdictional alignment so country-level forest accounting and project-level credits don't double-count.",
    used: "Future replacement for any new Indian REDD+ project starts.",
  },

  // ---------- Soil & Agriculture ----------
  {
    code: "VM0017",
    name: "Sustainable Agricultural Land Management (SALM)",
    registry: "verra", category: "soil",
    scope: "Soil carbon and emissions reductions from improved cropland management practices.",
    desc: "Covers cover cropping, reduced tillage, residue retention, agroforestry, and improved nutrient management. Most popular methodology for smallholder soil carbon projects globally.",
    used: "Adopted by Carbon Bridge in Jharkhand and Odisha FPO programmes.",
  },
  {
    code: "VM0042",
    name: "Improved Agricultural Land Management",
    registry: "verra", category: "soil",
    scope: "Direct measurement-and-modelling of soil organic carbon increases from changed management practices.",
    desc: "More rigorous than VM0017 — requires GPS-tagged soil sampling on a randomised grid every 5 years plus a Tier-3 biogeochemical model (DNDC / DayCent). Higher cost but unlocks premium-priced 'high-integrity' soil carbon.",
    used: "Active: Odisha Regenerative Soil Carbon — 500 FPO farmers with satellite + GPS MRV.",
  },
  {
    code: "VM0044",
    name: "Biochar Utilization in Soil & Non-Soil Applications",
    registry: "verra", category: "soil",
    scope: "Carbon removal via biochar produced from sustainable biomass and applied to soil or durable products.",
    desc: "One of the first VCS removal methodologies (vs. avoidance). Counts the recalcitrant carbon fraction of biochar locked away for 100+ years. Eligible feedstocks: agricultural residue, sustainably-harvested wood, manure.",
    used: "Pipeline for Punjab paddy-straw + Rajasthan agri-residue clusters.",
  },

  // ---------- Blue Carbon ----------
  {
    code: "VM0033",
    name: "Tidal Wetland & Seagrass Restoration",
    registry: "verra", category: "blue",
    scope: "Carbon sequestration from restoring mangroves, salt marshes, tidal flats, and seagrass meadows.",
    desc: "The only Verra methodology for coastal 'blue carbon'. Accounts for both above-ground biomass and below-ground organic-rich sediment which can sequester 4-10x more carbon than tropical forest per hectare.",
    used: "Active: West Bengal Mangrove Blue Carbon — 3,000 ha Sundarban restoration.",
  },

  // ---------- Waste & Manure ----------
  {
    code: "AMS-III.R",
    name: "Methane Recovery in Agricultural Activities (Household / Small Farm)",
    registry: "verra", category: "waste",
    scope: "Methane avoided by capturing manure or agricultural residue in anaerobic digesters at small-farm scale.",
    desc: "Cornerstone methodology for compressed biogas (CBG) and on-farm biogas projects. Each CBG plant displaces both methane emissions (would have escaped from open manure storage) AND fossil natural gas (the biogas substitutes for CNG).",
    used: "Active: Odisha CBG Plant (10,000 cow herd) + SATAT CBG Cluster Haryana (5 plants).",
  },
  {
    code: "AMS-III.D",
    name: "Methane Recovery in Animal Manure Management",
    registry: "verra", category: "waste",
    scope: "Large-scale livestock manure-to-biogas systems.",
    desc: "Industrial cousin of AMS-III.R for dairy farms / piggeries with >1,000 head. Captures methane that would have been emitted from anaerobic lagoons.",
    used: "Pipeline for SATAT-registered dairy clusters in Punjab and Maharashtra.",
  },
  {
    code: "AMS-III.H",
    name: "Methane Recovery in Wastewater Treatment",
    registry: "verra", category: "waste",
    scope: "Capturing methane from municipal and industrial wastewater treatment.",
    desc: "Applies to sewage treatment plants and industrial effluent (distilleries, paper mills, food processing) that switch from anaerobic open lagoons to closed digesters with methane capture.",
    used: "Candidate for SBM-Urban tie-ups with municipal corporations.",
  },
  {
    code: "AMS-III.AO",
    name: "Methane Recovery through Controlled Hydrolysis of Organic Waste",
    registry: "verra", category: "waste",
    scope: "Methane avoided by diverting organic municipal solid waste from open dumpsites.",
    desc: "For waste-to-energy plants that intercept the organic fraction of MSW before it reaches a landfill. Reduces direct methane plus produces displacement fuel.",
    used: "Active: Methane Capture Landfill (Mexico) — demo international project.",
  },

  // ---------- Renewable Energy ----------
  {
    code: "AMS-I.D",
    name: "Grid-Connected Renewable Electricity Generation",
    registry: "verra", category: "energy",
    scope: "Solar, wind, small-hydro, biomass and tidal generation feeding into a national grid.",
    desc: "The workhorse renewable methodology. Credits = MWh generated × grid emission factor. India's grid factor (~0.71 tCO₂/MWh) is one of the highest in the world, making Indian renewables especially credit-rich.",
    used: "Active: Wind Power Rajasthan + Solar Farm Gujarat.",
  },
  {
    code: "AMS-I.C",
    name: "Thermal Energy Production (with or without electricity)",
    registry: "verra", category: "energy",
    scope: "Heat generation from renewable biomass that displaces fossil fuel boilers.",
    desc: "Used for biomass pellet boilers in industrial settings (textile, brick kilns, paper) replacing coal or fuel oil. Often co-applied with AMS-III.R for paired methane + thermal credits.",
    used: "Active: Rajasthan Biomass Pellet Programme — 500 farmers, displacing industrial coal.",
  },
  {
    code: "AMS-I.F",
    name: "Renewable Electricity Generation for Captive Use",
    registry: "verra", category: "energy",
    scope: "Behind-the-meter solar / wind for industrial captive consumption.",
    desc: "For rooftop solar and on-site wind at factories. Faster registration than grid-connected since there's no PPA / scheduling complexity.",
    used: "Open to corporate solar rooftop programmes (>1 MW).",
  },
  {
    code: "VM0018",
    name: "Energy Efficiency in Building Sector",
    registry: "verra", category: "energy",
    scope: "Retrofits like LED lighting, efficient HVAC, building envelope improvements.",
    desc: "Lower volume per project but useful for ESCO-led portfolios of small buildings aggregated under one PoA. India's BEE programme provides supporting baseline data.",
    used: "Future Carbon Bridge module for hospital / school PoAs.",
  },

  // ---------- Transport ----------
  {
    code: "VM0038",
    name: "Electric Vehicle Charging Systems",
    registry: "verra", category: "transport",
    scope: "Emissions avoided when EVs displace ICE vehicles.",
    desc: "Credits issued per kWh dispensed at registered charging stations. India's grid will continue to clean over the credit period, so projects are eligible for full lifecycle benefit using a dynamic grid factor.",
    used: "Open for OEM and CPO (charge point operator) tie-ups.",
  },
];

// =============================================================================
// GOLD STANDARD methodologies
// =============================================================================
const GOLD = [
  {
    code: "GS-TPDDTEC",
    name: "Technologies & Practices to Displace Decentralised Thermal Energy Consumption",
    registry: "gs", category: "cooking",
    scope: "Improved cookstoves, biogas digesters, solar water heaters for off-grid households.",
    desc: "Gold Standard's flagship household-scale methodology. Quantifies fuelwood savings + black-carbon co-benefit + health co-benefit from cleaner combustion. Credits include a women's-empowerment premium when distribution targets women household heads.",
    used: "Active: Kenya Improved Cookstoves — 25,000 high-efficiency biomass stoves.",
  },
  {
    code: "GS-A/R",
    name: "Afforestation & Reforestation Requirements",
    registry: "gs", category: "afolu",
    scope: "Tree planting projects under stricter biodiversity and community-benefit rules than VCS A/R.",
    desc: "Gold Standard's tree-planting methodology requires native species, ecosystem-services co-benefits, and mandatory community consultation. Lower volume per project but commands a price premium (typically +20-40% vs. VCS).",
    used: "Future module for tribal-community agroforestry in Odisha / Jharkhand.",
  },
  {
    code: "GS-REN",
    name: "Renewable Energy Methodology",
    registry: "gs", category: "energy",
    scope: "Solar, wind, biomass and small-hydro at all scales.",
    desc: "Gold Standard's renewable methodology with stricter sustainable development goals (SDG) impact verification than VCS. Each project must demonstrate measurable contribution to at least 3 SDGs beyond climate.",
    used: "Active: Solar Farm Gujarat + Himalayan Biogas (both certified under GS).",
  },
  {
    code: "GS-WBC",
    name: "Water Benefit Certificates",
    registry: "gs", category: "water",
    scope: "Water saved, purified, or replenished — measured in cubic metres.",
    desc: "Not strictly a carbon methodology but issued under the same Gold Standard governance. WBCs are used by corporates to offset operational water use, often paired with carbon credits in beverage and apparel supply chains.",
    used: "Pipeline for Maharashtra check-dam rehabilitation programmes.",
  },
  {
    code: "GS-SDW",
    name: "Safe Drinking Water Activities",
    registry: "gs", category: "water",
    scope: "Household and community water filtration that displaces fuelwood (otherwise used to boil water).",
    desc: "A clever methodology that earns CARBON credits from WATER projects — purified water means households no longer need to boil water, which saves fuelwood and reduces emissions. Strong SDG-3 (health) story.",
    used: "Pipeline for tribal-belt water filtration tie-ups.",
  },
  {
    code: "GS-MA",
    name: "Methane Avoidance Methodology",
    registry: "gs", category: "waste",
    scope: "Anaerobic digestion of organic waste at community / small-farm scale.",
    desc: "Gold Standard's equivalent of AMS-III.R, with mandatory community consultation and a separate SDG-impact reporting requirement. Suitable for community biogas plants.",
    used: "Active: Himalayan Biogas — Nepal community digester programme.",
  },
];

// =============================================================================
// INDIA-SPECIFIC REGULATORY SCHEMES
// =============================================================================
const INDIA = [
  {
    code: "CPCB-EPR",
    name: "Plastic Waste Management Rules 2022 (EPR)",
    registry: "india", category: "plastic",
    scope: "Extended Producer Responsibility credits for plastic recovered and recycled.",
    desc: "Mandatory regime under India's Plastic Waste Management (Amendment) Rules 2022. All Producers, Importers, and Brand-owners (PIBOs) of plastic must meet annual recovery targets, met by buying EPR certificates from registered processors on the CPCB EPR Portal.",
    used: "Active: Karnataka EPR Plastic Credits — recyclers issuing certificates to PIBO buyers.",
  },
  {
    code: "VERRA-W+",
    name: "Verra Plastic Waste Reduction Program (PWRP)",
    registry: "verra", category: "plastic",
    scope: "Voluntary plastic credits for collection and recycling above business-as-usual baselines.",
    desc: "Voluntary parallel to India's mandatory CPCB EPR. Used by global brands that want plastic-neutral / plastic-negative claims with international verification. Two sub-methodologies: Plastic Waste Collection and Plastic Waste Recycling.",
    used: "Active: Puri Coast Ocean Plastic Credits — 500-collector marine-bound waste programme.",
  },
  {
    code: "SATAT",
    name: "Sustainable Alternative Towards Affordable Transportation",
    registry: "india", category: "energy",
    scope: "MoPNG's flagship CBG production + offtake scheme. 5,000 plants targeted by 2030.",
    desc: "Launched 2018 by Ministry of Petroleum & Natural Gas. Oil marketing companies (IOCL, BPCL, HPCL) commit to buying compressed biogas from registered plants at fixed prices. Provides revenue floor that makes Carbon Bridge's CBG carbon credits a true co-benefit, not the primary revenue.",
    used: "Active: SATAT CBG Cluster Haryana — 5 plants under one Carbon Bridge PoA.",
  },
  {
    code: "NGHM",
    name: "National Green Hydrogen Mission",
    registry: "india", category: "hydrogen",
    scope: "₹19,744 cr (~US$2.4B) outlay to make India a green hydrogen production hub by 2030.",
    desc: "Approved January 2023, total outlay ₹19,744 crore through FY 2029-30. Targets 5 MMT/year green H2 production by 2030, displacing 50 MMT CO₂e/year. Two pillars: (1) SIGHT — Strategic Interventions for Green Hydrogen Transition, covering electrolyzer manufacturing PLI and H2 production incentives; (2) pilot deployment in steel, mobility, shipping, and refineries. Implementing agency: SECI.",
    used: "New: Carbon Bridge launching Green Hydrogen credit category covering NGHM-eligible projects (see news).",
  },
  {
    code: "SIGHT-PHASE2",
    name: "SIGHT Phase II — Green H2 Production Incentive",
    registry: "india", category: "hydrogen",
    scope: "Direct production-linked incentive (PLI) for green hydrogen produced via grid-connected or captive renewable electrolysis.",
    desc: "Tender released by SECI in March 2024 for 4.5 lakh tonnes (450,000 t/yr) of green hydrogen across three production routes (biomass, electrolysis, biomass+electrolysis). Awarded to 10 producers in tranches; incentive of ₹50/kg in year 1 declining to ₹40/kg by year 3. Carbon Bridge can layer voluntary VCS hydrogen-specific credits on top once the methodology finalises (expected H2 2026).",
    used: "Pipeline: 2 letters of intent signed with SIGHT Phase II awardees in Gujarat and Andhra Pradesh.",
  },
  {
    code: "BIS-H2",
    name: "BIS IS 18435:2023 Green Hydrogen Standard",
    registry: "india", category: "hydrogen",
    scope: "Bureau of Indian Standards definition of 'green' hydrogen for regulatory and credit purposes.",
    desc: "Officially defines green hydrogen as H2 produced with non-fossil fuels OR from biomass, with emissions ≤ 2 kgCO₂e/kg H2 averaged over 12 months at the production facility gate. Sets the baseline for any future Indian green-H2 credit methodology.",
    used: "Reference standard for Carbon Bridge's NGHM credit pipeline.",
  },
  {
    code: "PAT",
    name: "Perform, Achieve & Trade (PAT) Scheme",
    registry: "india", category: "energy",
    scope: "Mandatory energy-intensity reduction targets for ~1,000 large industrial units, traded as ESCerts.",
    desc: "Run by Bureau of Energy Efficiency since 2012. Industrial units with energy consumption above sector thresholds get binding intensity targets; over-performers earn Energy Saving Certificates (ESCerts) tradable on IEX. Carbon Bridge can advise PAT-covered entities on bundling ESCerts with voluntary VCS energy-efficiency credits.",
    used: "Advisory module for steel and cement clients.",
  },
];

export const ALL_METHODOLOGIES = [...VERRA, ...GOLD, ...INDIA];

// Recent / forthcoming additions, shown at the top of the page as 'Latest'.
export const LATEST_METHODOLOGY_CODES = ["NGHM", "SIGHT-PHASE2", "VM0048", "VM0044", "BIS-H2"];

// Quick counts for the page header
export const METHODOLOGY_COUNTS = {
  total: ALL_METHODOLOGIES.length,
  verra: VERRA.length,
  gs: GOLD.length,
  india: INDIA.length,
  categories: new Set(ALL_METHODOLOGIES.map((m) => m.category)).size,
};
