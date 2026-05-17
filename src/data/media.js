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

// Helper for the photo-as-background pattern used everywhere
export const bgImage = (url) => ({
  backgroundImage: `url(${url})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});
