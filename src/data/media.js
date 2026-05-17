// =============================================================================
// Curated media library — Unsplash photos + Pexels videos
//
// Everything here is from open/free CDNs (Unsplash & Pexels) which serve the
// images themselves (no scraping). Each URL points at a real photo we picked
// to match the carbon-credit / nature / Indian-agriculture aesthetic.
//
// To swap a photo, just paste a new Unsplash photo ID into the helper below.
// =============================================================================

const UNSPLASH = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=80`;

// Hero background photo. We use a Ken Burns animation in CSS rather than a
// real MP4 because the major free video CDNs (Pexels/Coverr) block hotlinking,
// and self-hosting MB-scale video on Render's free static plan is wasteful.
// The slow zoom-and-pan gives an alive feel without the network cost.
export const HERO_MEDIA = {
  // 4K rainforest canopy aerial (verified)
  poster: UNSPLASH("1448375240586-882707db888b", 2400),
};

// Full-bleed parallax banner photos
export const IMPACT_BANNER = UNSPLASH("1441974231531-c6227db76b6e", 1920); // forest mist aerial
export const CTA_BANNER = UNSPLASH("1500076656116-558758c991c1", 1920);    // paddy field at sunset

// Programs grid — one photo per credit category
export const PROGRAM_PHOTOS = {
  forestry:  UNSPLASH("1448375240586-882707db888b", 900), // rainforest canopy
  cbg:       UNSPLASH("1500595046743-cd271d694d30", 900), // pasture cattle
  renewable: UNSPLASH("1466611653911-95081537e5b7", 900), // wind turbines
  soil:      UNSPLASH("1416879595882-3373a0480b5b", 900), // hands holding soil
  bluecarbon:UNSPLASH("1518837695005-2083093ee35b", 900), // mangrove water
  plastic:   UNSPLASH("1532996122724-e3c354a0b15b", 900), // plastic waste sorting
  cooking:   UNSPLASH("1488521787991-ed7bbaae773c", 900), // cooking fire
  biomass:   UNSPLASH("1574943320219-553eb213f72d", 900), // wheat / agri residue
};

// Photo for each featured project on the home page (uses credit id as key)
export const PROJECT_PHOTOS = {
  1:  UNSPLASH("1500595046743-cd271d694d30", 1200), // Odisha CBG cattle
  2:  UNSPLASH("1426604966848-d7adac402bff", 1200), // tree planting hands (agroforestry)
  3:  UNSPLASH("1532996122724-e3c354a0b15b", 1200), // ocean plastic collection
  4:  UNSPLASH("1574943320219-553eb213f72d", 1200), // biomass / wheat fields
  5:  UNSPLASH("1416879595882-3373a0480b5b", 1200), // hands holding soil
  6:  UNSPLASH("1466611653911-95081537e5b7", 1200), // wind/clean energy
  7:  UNSPLASH("1532996122724-e3c354a0b15b", 1200), // plastic waste sorting
  8:  UNSPLASH("1518837695005-2083093ee35b", 1200), // mangrove sundarban
  9:  UNSPLASH("1448375240586-882707db888b", 1200), // amazon rainforest
  10: UNSPLASH("1488521787991-ed7bbaae773c", 1200), // cooking
};

// Editorial news/announcement photos
export const NEWS_PHOTOS = [
  UNSPLASH("1542601906990-b4d3fb778b09", 1000), // wind farm
  UNSPLASH("1470770841072-f978cf4d019e", 1000), // winding forest road
  UNSPLASH("1500076656116-558758c991c1", 1000), // Indian rural field
];

// One photo per methodology category. Used by the Methodologies page so every
// card has a thumbnail and the category 'feels' tangible. All IDs HEAD-checked.
export const CATEGORY_PHOTOS = {
  afolu:     UNSPLASH("1448375240586-882707db888b", 800), // rainforest canopy
  soil:      UNSPLASH("1416879595882-3373a0480b5b", 800), // hands holding soil
  blue:      UNSPLASH("1518837695005-2083093ee35b", 800), // mangrove water
  waste:     UNSPLASH("1582408921715-18e7806365c1", 800), // waste sorting
  energy:    UNSPLASH("1466611653911-95081537e5b7", 800), // wind turbines
  cooking:   UNSPLASH("1488521787991-ed7bbaae773c", 800), // cooking fire
  water:     UNSPLASH("1541544537156-7627a7a4aa1c", 800), // water hands
  plastic:   UNSPLASH("1532996122724-e3c354a0b15b", 800), // plastic waste
  transport: UNSPLASH("1593941707882-a5bba14938c7", 800), // EV charging
  hydrogen:  UNSPLASH("1581094271901-8022df4466f9", 800), // industrial / hydrogen plant
};

// Top-of-page banner photos for each main subpage. Half-height "hero strip"
// gives every internal page the same editorial weight as the home page.
export const PAGE_BANNERS = {
  methodologies: UNSPLASH("1502082553048-f009c37129b9", 1920), // misty mountain forest
  howitworks:    UNSPLASH("1500076656116-558758c991c1", 1920), // paddy field at sunset
  marketplace:   UNSPLASH("1542601906990-b4d3fb778b09", 1920), // wind farm
  business:      UNSPLASH("1448375240586-882707db888b", 1920), // rainforest canopy
  sell:          UNSPLASH("1497436072909-60f360e1d4b1", 1920), // tree row / agroforestry
};

// Helper for the photo-as-background pattern used everywhere
export const bgImage = (url) => ({
  backgroundImage: `url(${url})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});
