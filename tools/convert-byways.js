/**
 * convert-byways.js
 *
 * Converts the Esri ArcGIS FeatureSet export (florida.json) to the PathWeaver
 * GeoJSON schema defined in docs/DATA_SCHEMA.md.
 *
 * What it does:
 *   - Groups 281 road segments into 27 byway features (one feature per byway)
 *   - Converts Esri "paths" geometry to GeoJSON MultiLineString
 *   - Calculates length_miles from Shape__Length (meters)
 *   - Collects all counties per byway
 *   - Applies curated metadata: name, description, color, tags, url, designation
 *
 * Usage:
 *   node convert-byways.js
 *
 * Output:
 *   florida.geojson — drop this into data/byways/florida.geojson in the project
 */

const fs = require('fs');
const path = require('path');

const METERS_PER_MILE = 1609.344;

// ---------------------------------------------------------------------------
// Curated metadata per byway code
// These fields cannot be derived from the source data — they are authored here.
// Fields marked TODO need your review before shipping.
// ---------------------------------------------------------------------------

const BYWAY_METADATA = {
  A1AHB: {
    name: 'A1A Historic Byway',
    description: "Follows the Atlantic coast through historic Flagler Beach and the Matanzas Inlet area, connecting Spanish colonial heritage with coastal marshes and barrier island scenery.",
    color: '#4A90D9',
    tags: ['coastal', 'historic', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  A1AOIT: {
    name: 'A1A Ocean Islands Trail',
    description: "Traces the northern Atlantic coast from Jacksonville Beach through Ponte Vedra and Amelia Island, passing sea turtle nesting beaches and salt marshes.",
    color: '#60A8E8',
    tags: ['coastal', 'wildlife', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  BBH: {
    name: 'Bradenton Beach Highway',
    description: "A short scenic corridor along Anna Maria Island's Gulf-facing shore, known for its Old Florida beach town character and calm turquoise waters.",
    color: '#F5A623',
    tags: ['coastal', 'beach'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  BBSB: {
    name: 'Big Bend Scenic Byway',
    description: "One of Florida's most remote and rewarding drives, hugging the Gulf coast through Wakulla, Jefferson, Taylor, and Dixie counties where the Panhandle meets the Peninsula. Manatees, ospreys, and near-empty roads.",
    color: '#7ED321',
    tags: ['coastal', 'nature', 'wildlife', 'photography'],
    designation: ['florida_scenic', 'national_scenic'],
    url: 'https://www.bigbendscenicbyway.com/',
  },
  BCASH: {
    name: 'Broward County A1A Scenic Highway',
    description: "The Fort Lauderdale stretch of A1A runs between Deerfield Beach and Hollywood, mixing beachfront parks, marinas, and Art Deco-era commercial strips.",
    color: '#6B8CFF',
    tags: ['coastal', 'urban'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  CC: {
    name: 'Courtney Campbell Scenic Highway',
    description: "A 11-mile causeway crossing Old Tampa Bay between Tampa and Clearwater, with unobstructed water views in both directions and a dedicated recreational trail alongside.",
    color: '#50E3C2',
    tags: ['coastal', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  FBB: {
    name: 'Florida Black Bear Scenic Byway',
    description: "Winds through the Ocala National Forest — the largest sand pine scrub forest in the world — with frequent wildlife sightings including the Florida black bear, deer, and sandhill cranes.",
    color: '#A0785A',
    tags: ['forest', 'wildlife', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  FKH: {
    name: 'Florida Keys Scenic Highway',
    description: "US-1 through the Florida Keys, crossing 42 bridges over open water from Key Largo to Key West. One of the most iconic drives in the United States.",
    color: '#00BCD4',
    tags: ['coastal', 'photography', 'historic'],
    designation: ['florida_scenic', 'all_american_road'],
    url: 'https://www.floridakeysnationalmarinesanctuary.org/',
  },
  GMB: {
    name: 'Green Mountain Scenic Byway',
    description: "Climbs through the Lake Wales Ridge in Lake County — Florida's most unusual terrain, with ancient sand scrub habitat, citrus groves, and some of the highest elevation in the state.",
    color: '#4CAF50',
    tags: ['nature', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  HCH: {
    name: 'Heritage Crossroads Scenic Highway',
    description: "Crosses the agricultural heartland of Alachua and Columbia counties, passing through communities that preserve cracker Florida heritage, tobacco barns, and longleaf pine forests.",
    color: '#FF7043',
    tags: ['historic', 'heritage', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  HHB: {
    name: 'Halifax Heritage Scenic Byway',
    description: "Follows the Halifax River through the Daytona Beach area, connecting Ormond Beach to Port Orange along the Intracoastal Waterway with a backdrop of old estates and riverfront parks.",
    color: '#CE93D8',
    tags: ['historic', 'coastal', 'heritage'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  IRL: {
    name: 'Indian River Lagoon Scenic Highway',
    description: "Runs alongside the Indian River Lagoon in Brevard and Indian River counties — one of the most biodiverse estuaries in North America, with manatees, dolphins, and 600+ species of fish.",
    color: '#26C6DA',
    tags: ['coastal', 'wildlife', 'nature', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  IRLTC: {
    name: 'Indian River Lagoon — Treasure Coast',
    description: "The southern extension of the Indian River Lagoon corridor through Martin County, where the lagoon narrows and deepens near the St. Lucie Inlet.",
    color: '#0097A7',
    tags: ['coastal', 'wildlife', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  JCPMH: {
    name: 'JC Penney Memorial Highway',
    description: "Passes through the rural creek lands of Clay County near Penney Farms, an early 20th-century retirement community founded by the department store magnate, surrounded by cypress swamps and Black Creek.",
    color: '#FFB74D',
    tags: ['historic', 'heritage', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  LBMT: {
    name: 'Lemon Bay / Myakka River Trail',
    description: "Explores the Charlotte County coast between Englewood and Venice, where Lemon Bay's mangrove-lined shores meet the Myakka River's freshwater corridor.",
    color: '#66BB6A',
    tags: ['coastal', 'nature', 'wildlife'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  MGH: {
    name: 'Martin Grade Scenic Highway',
    description: "A rural corridor through Martin County's western agricultural lands, connecting the coast to the Everglades agricultural area through scrub flatwoods and cattle country.",
    color: '#EF5350',
    tags: ['nature', 'heritage'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  OFH: {
    name: 'Old Florida Heritage Highway',
    description: "Traces SR-25 through Gilchrist and Alachua counties, where longleaf pine forests and sinkhole lakes characterize a landscape that looks much as it did a century ago.",
    color: '#8D6E63',
    tags: ['historic', 'heritage', 'nature', 'forest'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  OLAT: {
    name: 'Ormond Loop and Trail',
    description: "A scenic loop north of Daytona Beach through Ormond Beach and the Tomoka Basin, passing the birthplace of Florida's auto racing heritage alongside moss-draped live oak hammocks.",
    color: '#AB47BC',
    tags: ['historic', 'heritage', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  PBH: {
    name: 'Pensacola Bluffs Highway',
    description: "Follows the high bluffs above Escambia Bay in northwest Florida, offering panoramic views unusual for Florida along with Civil War-era fortifications and longleaf pine restoration areas.",
    color: '#42A5F5',
    tags: ['historic', 'nature', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  PSH: {
    name: 'Palma Sola Scenic Highway',
    description: "A short but distinctive corridor along the Palma Sola Bay causeway in Manatee County, flanked by water on both sides and popular with birders for its shorebird and wading bird populations.",
    color: '#FFD54F',
    tags: ['coastal', 'wildlife', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  ROLHC: {
    name: 'River of Lakes Heritage Corridor',
    description: "Follows the St. Johns River corridor through Volusia and Lake counties — a chain of shallow lakes and wetlands that form one of Florida's most important freshwater ecosystems.",
    color: '#26A69A',
    tags: ['nature', 'wildlife', 'heritage', 'photography'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  SH30A: {
    name: 'Scenic Highway 30-A',
    description: "Threads through the South Walton beach communities of Seaside, Rosemary Beach, and Grayton Beach — Florida's emerald coast, with rare coastal dune lakes found almost nowhere else on earth.",
    color: '#EC407A',
    tags: ['coastal', 'beach', 'photography'],
    designation: ['florida_scenic', 'national_scenic'],
    url: 'https://www.30a.com/',
  },
  SSHBC: {
    name: 'Scenic Sumter Heritage Byway',
    description: "Winds through Sumter County's rolling hills and small towns, past The Villages and into the older agricultural landscape of Bushnell and Webster.",
    color: '#7E57C2',
    tags: ['historic', 'heritage'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  SSP: {
    name: 'Suncoast Scenic Parkway',
    description: "The northern approach to Tampa through Pasco and Hillsborough counties, with preserved wetland buffers and wildlife crossings that make it a model for Florida highway design.",
    color: '#29B6F6',
    tags: ['nature', 'wildlife'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  TRH: {
    name: 'The Ridge Scenic Highway',
    description: "Climbs the Lake Wales Ridge in Polk County, passing through citrus groves, ancient scrub preserves, and Bok Tower Gardens — one of Florida's most beautiful designed landscapes.",
    color: '#D4E157',
    tags: ['nature', 'photography', 'heritage'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  TTH: {
    name: 'Tamiami Trail: Windows to the Gulf Coast',
    description: "The southwest Florida stretch of the historic Tamiami Trail through Charlotte and Lee counties, running through Charlotte Harbor — one of Florida's most productive estuaries for fishing and wildlife.",
    color: '#FFA726',
    tags: ['coastal', 'historic', 'wildlife', 'nature'],
    designation: ['florida_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
  WBT: {
    name: 'William Bartram Scenic and Historic Highway',
    description: "Follows the path of 18th-century naturalist William Bartram through Putnam County along the St. Johns River, through the same forests and rivers he documented in his landmark 1791 travel narrative.",
    color: '#A5D6A7',
    tags: ['historic', 'nature', 'heritage', 'wildlife'],
    designation: ['florida_scenic', 'national_scenic'],
    url: 'https://fdot.gov/environment/scenic-highways/',
  },
};

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

const sourceData = JSON.parse(
  fs.readFileSync('/mnt/user-data/uploads/florida.json', 'utf8')
);

// Build a lookup: code → full name from the domain definition
const codeToName = {};
const domain = sourceData.fields
  .find(f => f.name === 'SCENEHWY')
  ?.domain?.codedValues ?? [];
domain.forEach(({ name, code }) => {
  codeToName[code] = name;
});

// Group segments by byway code
const segmentsByCode = {};
sourceData.features.forEach(feature => {
  const code = feature.attributes.SCENEHWY;
  if (!code || !code.trim()) return;
  if (!segmentsByCode[code]) segmentsByCode[code] = [];
  segmentsByCode[code].push(feature);
});

// Convert each byway group to a single GeoJSON feature
const geojsonFeatures = [];
const warnings = [];

Object.entries(segmentsByCode).forEach(([code, segments]) => {
  const meta = BYWAY_METADATA[code];
  if (!meta) {
    warnings.push(`No metadata for code: ${code} — skipped`);
    return;
  }

  // Collect all path arrays as MultiLineString coordinates
  // Esri paths: array of arrays of [lng, lat] — same order as GeoJSON, no conversion needed
  const allPaths = [];
  segments.forEach(seg => {
    if (seg.geometry?.paths) {
      seg.geometry.paths.forEach(path => {
        allPaths.push(path);
      });
    }
  });

  // Calculate total length in miles from Shape__Length (meters)
  const totalMeters = segments.reduce(
    (sum, seg) => sum + (seg.attributes.Shape__Length ?? 0),
    0
  );
  const lengthMiles = Math.round((totalMeters / METERS_PER_MILE) * 10) / 10;

  // Collect unique counties
  const counties = [
    ...new Set(
      segments
        .map(seg => seg.attributes.COUNTY)
        .filter(Boolean)
        .map(c => c.trim())
    ),
  ].sort();

  // Use MultiLineString if multiple paths, LineString if exactly one
  const geometry =
    allPaths.length === 1
      ? { type: 'LineString', coordinates: allPaths[0] }
      : { type: 'MultiLineString', coordinates: allPaths };

  geojsonFeatures.push({
    type: 'Feature',
    id: `fl-${code.toLowerCase()}`,
    geometry,
    properties: {
      id: `fl-${code.toLowerCase()}`,
      name: meta.name,
      state: 'FL',
      designation: meta.designation,
      length_miles: lengthMiles,
      description: meta.description,
      counties,
      url: meta.url,
      color: meta.color,
      tags: meta.tags,
      // Preserve source code for debugging
      _source_code: code,
    },
  });
});

// Sort features alphabetically by name
geojsonFeatures.sort((a, b) =>
  a.properties.name.localeCompare(b.properties.name)
);

const output = {
  type: 'FeatureCollection',
  metadata: {
    state: 'florida',
    state_code: 'FL',
    source: 'Florida Department of Transportation',
    source_url: 'https://fdot.gov/environment/scenic-highways/',
    converted_from: 'Esri ArcGIS FeatureSet export',
    version: '1.0.0',
    updated: new Date().toISOString().split('T')[0],
    feature_count: geojsonFeatures.length,
  },
  features: geojsonFeatures,
};

const outputPath = '/home/claude/florida.geojson';
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log('\n✅ Conversion complete\n');
console.log(`Input:  ${sourceData.features.length} Esri segments`);
console.log(`Output: ${geojsonFeatures.length} GeoJSON byway features`);
console.log(`File:   ${outputPath}`);

if (warnings.length) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(w => console.log('   ' + w));
}

console.log('\nByways converted:');
geojsonFeatures.forEach(f => {
  const p = f.properties;
  const geomType = f.geometry.type;
  const pathCount =
    geomType === 'MultiLineString'
      ? f.geometry.coordinates.length
      : 1;
  console.log(
    `  [${p._source_code}] ${p.name} — ${p.length_miles} mi, ${p.counties.length} counties, ${pathCount} paths`
  );
});

console.log('\n📋 Review checklist before shipping:');
console.log('  - Verify descriptions are accurate for each byway');
console.log('  - Replace generic FDOT URLs with official byway-specific URLs where possible');
console.log('  - Review color assignments for visual distinctiveness on the dark map');
console.log('  - Flag/remove any byways that are fully decommissioned (none detected in this data)');
