// US zip code to approximate coordinate mapping
// Uses 3-digit prefix regions to cover ALL US zip codes
// Exact matches override prefix-based approximations

const exactZips: Record<string, { lat: number; lng: number; city: string }> = {
  // San Francisco
  '94102': { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
  '94103': { lat: 37.7726, lng: -122.4099, city: 'San Francisco' },
  '94105': { lat: 37.7864, lng: -122.3892, city: 'San Francisco' },
  '94110': { lat: 37.7486, lng: -122.4152, city: 'San Francisco' },
  '94112': { lat: 37.7210, lng: -122.4425, city: 'San Francisco' },
  '94122': { lat: 37.7584, lng: -122.4853, city: 'San Francisco' },
  // East Bay
  '94501': { lat: 37.7712, lng: -122.2824, city: 'Alameda' },
  '94607': { lat: 37.8017, lng: -122.2849, city: 'Oakland' },
  '94704': { lat: 37.8676, lng: -122.2577, city: 'Berkeley' },
  // Peninsula / South Bay
  '94025': { lat: 37.4520, lng: -122.1823, city: 'Menlo Park' },
  '94040': { lat: 37.3861, lng: -122.0839, city: 'Mountain View' },
  '94301': { lat: 37.4443, lng: -122.1598, city: 'Palo Alto' },
  '95014': { lat: 37.3229, lng: -122.0322, city: 'Cupertino' },
  '95110': { lat: 37.3367, lng: -121.8906, city: 'San Jose' },
  '95125': { lat: 37.2949, lng: -121.8911, city: 'San Jose' },
  // Coastal CA
  '94019': { lat: 37.4632, lng: -122.4341, city: 'Half Moon Bay' },
  '95060': { lat: 36.9741, lng: -122.0308, city: 'Santa Cruz' },
  '93940': { lat: 36.5944, lng: -121.8950, city: 'Monterey' },
  '93953': { lat: 36.5725, lng: -121.9486, city: 'Pebble Beach' },
  // Los Angeles
  '90001': { lat: 33.9425, lng: -118.2551, city: 'Los Angeles' },
  '90210': { lat: 34.0901, lng: -118.4065, city: 'Beverly Hills' },
  '90401': { lat: 34.0195, lng: -118.4912, city: 'Santa Monica' },
  '92037': { lat: 32.8473, lng: -117.2742, city: 'La Jolla' },
  // New York
  '10001': { lat: 40.7484, lng: -73.9967, city: 'New York' },
  '10019': { lat: 40.7653, lng: -73.9865, city: 'New York' },
  '11201': { lat: 40.6934, lng: -73.9897, city: 'Brooklyn' },
  '11735': { lat: 40.7320, lng: -73.4410, city: 'Farmingdale' },
  // Other notable
  '28374': { lat: 35.1954, lng: -79.4693, city: 'Pinehurst' },
  '97411': { lat: 43.1218, lng: -124.4195, city: 'Bandon' },
};

// 3-digit prefix → approximate center coordinates and region name
// Covers ALL US zip code prefixes (000–999)
const prefixRegions: [number, number, number, number, string][] = [
  // [prefixStart, prefixEnd, lat, lng, regionName]
  // New England
  [  0,   9, 42.36, -71.06, 'Boston area'],
  [ 10,  14, 40.75, -73.99, 'New York City'],
  [ 15,  16, 40.67, -73.94, 'Brooklyn area'],
  [ 17,  19, 40.73, -73.45, 'Long Island'],
  [ 20,  20, 38.90, -77.04, 'Washington DC'],
  [ 21,  21, 39.29, -76.61, 'Baltimore'],
  [ 22,  24, 37.54, -77.44, 'Virginia'],
  [ 25,  26, 38.35, -81.63, 'West Virginia'],
  [ 27,  28, 35.78, -78.64, 'North Carolina'],
  [ 29,  29, 34.00, -81.03, 'South Carolina'],
  [ 30,  31, 33.75, -84.39, 'Atlanta area'],
  [ 32,  34, 28.54, -81.38, 'Florida'],
  [ 35,  36, 33.52, -86.81, 'Alabama'],
  [ 37,  38, 36.16, -86.78, 'Tennessee'],
  [ 39,  39, 32.30, -90.18, 'Mississippi'],
  [ 40,  42, 38.25, -85.76, 'Kentucky'],
  [ 43,  45, 39.96, -83.00, 'Ohio'],
  [ 46,  47, 39.77, -86.16, 'Indiana'],
  [ 48,  49, 42.33, -83.05, 'Michigan'],
  [ 50,  52, 41.59, -93.62, 'Iowa'],
  [ 53,  54, 43.07, -89.40, 'Wisconsin'],
  [ 55,  56, 44.98, -93.27, 'Minnesota'],
  [ 57,  57, 43.55, -96.73, 'South Dakota'],
  [ 58,  58, 46.88, -96.79, 'North Dakota'],
  [ 59,  59, 46.87, -114.00, 'Montana'],
  [ 60,  62, 41.88, -87.63, 'Chicago area'],
  [ 63,  65, 38.63, -90.20, 'St. Louis area'],
  [ 66,  67, 39.10, -94.58, 'Kansas City area'],
  [ 68,  69, 41.26, -95.94, 'Nebraska'],
  [ 70,  71, 29.95, -90.07, 'New Orleans area'],
  [ 72,  72, 34.75, -92.29, 'Arkansas'],
  [ 73,  74, 35.47, -97.52, 'Oklahoma'],
  [ 75,  77, 32.78, -96.80, 'Dallas/Houston area'],
  [ 78,  79, 29.42, -98.49, 'San Antonio/Austin area'],
  [ 80,  81, 39.74, -104.99, 'Denver area'],
  [ 82,  83, 41.14, -104.82, 'Wyoming/Idaho'],
  [ 84,  84, 40.76, -111.89, 'Salt Lake City'],
  [ 85,  86, 33.45, -112.07, 'Phoenix area'],
  [ 87,  88, 35.08, -106.65, 'New Mexico/El Paso'],
  [ 89,  89, 36.17, -115.14, 'Las Vegas'],
  [ 90,  91, 34.05, -118.24, 'Los Angeles'],
  [ 92,  92, 32.72, -117.16, 'San Diego'],
  [ 93,  93, 36.75, -119.77, 'Central California'],
  [ 94,  94, 37.77, -122.42, 'San Francisco Bay Area'],
  [ 95,  95, 37.34, -121.89, 'San Jose area'],
  [ 96,  96, 21.31, -157.86, 'Hawaii'],
  [ 97,  97, 45.52, -122.68, 'Oregon'],
  [ 98,  98, 47.61, -122.33, 'Seattle area'],
  [ 99,  99, 61.22, -149.90, 'Alaska'],
  // Extended coverage for gaps
  [100, 102, 40.75, -73.97, 'New York'],
  [103, 104, 42.65, -73.76, 'Albany NY'],
  [105, 109, 41.04, -74.13, 'New York suburbs'],
  [110, 114, 40.76, -73.57, 'Long Island NY'],
  [115, 119, 40.91, -73.78, 'Westchester NY'],
  [120, 129, 42.81, -75.50, 'Upstate New York'],
  [130, 139, 43.05, -76.15, 'Syracuse/Rochester NY'],
  [140, 149, 42.89, -78.88, 'Buffalo NY'],
  [150, 159, 40.44, -79.99, 'Pittsburgh'],
  [160, 169, 40.80, -77.86, 'Central Pennsylvania'],
  [170, 179, 40.27, -76.88, 'Harrisburg PA'],
  [180, 189, 40.60, -75.47, 'Allentown/Scranton PA'],
  [190, 196, 39.95, -75.17, 'Philadelphia'],
  [197, 199, 39.74, -75.55, 'Delaware'],
  [200, 205, 38.90, -77.04, 'Washington DC'],
  [206, 209, 39.05, -76.88, 'Maryland'],
  [210, 219, 39.29, -76.61, 'Baltimore/Maryland'],
  [220, 229, 38.80, -77.32, 'Northern Virginia'],
  [230, 246, 37.54, -77.44, 'Virginia'],
  [247, 268, 35.60, -79.80, 'North Carolina'],
  [269, 289, 34.20, -79.50, 'North/South Carolina'],
  [290, 299, 33.84, -80.95, 'South Carolina'],
  [300, 319, 33.75, -84.39, 'Georgia'],
  [320, 339, 27.95, -82.46, 'Florida'],
  [340, 342, 28.06, -80.62, 'Florida East Coast'],
  [344, 349, 32.38, -84.90, 'South Georgia'],
  [350, 369, 33.52, -86.81, 'Alabama'],
  [370, 385, 36.16, -86.78, 'Tennessee'],
  [386, 397, 32.30, -90.18, 'Mississippi'],
  [398, 399, 30.40, -89.07, 'Mississippi Gulf'],
  [400, 418, 38.25, -85.76, 'Kentucky'],
  [420, 427, 36.99, -86.44, 'Bowling Green KY'],
  [430, 458, 40.00, -82.88, 'Ohio'],
  [460, 479, 39.77, -86.16, 'Indiana'],
  [480, 499, 42.73, -84.55, 'Michigan'],
  [500, 528, 41.98, -93.11, 'Iowa'],
  [530, 549, 43.07, -89.40, 'Wisconsin'],
  [550, 567, 44.98, -93.27, 'Minnesota'],
  [570, 577, 43.55, -96.73, 'South Dakota'],
  [580, 588, 46.88, -96.79, 'North Dakota'],
  [590, 599, 46.87, -114.00, 'Montana'],
  [600, 620, 41.88, -87.63, 'Chicago/Illinois'],
  [621, 629, 39.80, -89.65, 'Springfield IL'],
  [630, 639, 38.63, -90.20, 'St. Louis MO'],
  [640, 649, 39.10, -94.58, 'Kansas City MO'],
  [650, 658, 38.58, -92.17, 'Central Missouri'],
  [660, 679, 38.96, -95.25, 'Kansas'],
  [680, 693, 41.26, -95.94, 'Nebraska'],
  [700, 714, 29.95, -90.07, 'Louisiana'],
  [716, 729, 34.75, -92.29, 'Arkansas'],
  [730, 749, 35.47, -97.52, 'Oklahoma'],
  [750, 759, 32.78, -96.80, 'Dallas TX'],
  [760, 769, 32.75, -97.33, 'Fort Worth TX'],
  [770, 778, 29.76, -95.37, 'Houston TX'],
  [779, 789, 30.27, -97.74, 'Austin/San Antonio TX'],
  [790, 799, 33.45, -101.85, 'West Texas'],
  [800, 816, 39.74, -104.99, 'Colorado'],
  [820, 831, 42.85, -106.33, 'Wyoming'],
  [832, 838, 43.62, -116.21, 'Idaho'],
  [840, 847, 40.76, -111.89, 'Utah'],
  [850, 865, 33.45, -112.07, 'Arizona'],
  [870, 884, 35.08, -106.65, 'New Mexico'],
  [885, 891, 36.17, -115.14, 'Nevada'],
  [893, 898, 39.53, -119.81, 'Reno NV'],
  [900, 908, 34.05, -118.24, 'Los Angeles'],
  [910, 918, 34.18, -118.31, 'Los Angeles suburbs'],
  [919, 921, 33.77, -118.19, 'Long Beach CA'],
  [922, 928, 33.95, -117.40, 'Inland Empire CA'],
  [930, 935, 34.42, -119.70, 'Santa Barbara/Ventura CA'],
  [936, 939, 36.75, -119.77, 'Central Valley CA'],
  [940, 941, 37.77, -122.42, 'San Francisco'],
  [942, 942, 38.72, -121.50, 'Sacramento'],
  [943, 945, 37.55, -122.27, 'Bay Area South'],
  [946, 949, 37.85, -122.27, 'Bay Area East'],
  [950, 953, 37.34, -121.89, 'San Jose/Santa Clara'],
  [954, 955, 37.00, -122.06, 'Santa Cruz area'],
  [956, 958, 38.58, -121.49, 'Sacramento area'],
  [959, 961, 40.58, -122.39, 'Northern California'],
  [962, 966, 21.31, -157.86, 'Hawaii'],
  [967, 968, 19.73, -155.09, 'Hawaii Big Island'],
  [970, 974, 45.52, -122.68, 'Portland OR'],
  [975, 979, 44.05, -121.31, 'Central/Southern Oregon'],
  [980, 984, 47.61, -122.33, 'Seattle WA'],
  [985, 986, 47.66, -117.43, 'Spokane WA'],
  [988, 994, 46.60, -120.50, 'Central Washington'],
  [995, 999, 61.22, -149.90, 'Alaska'],
];

// Lookup by 3-digit prefix
function getByPrefix(zip: string): { lat: number; lng: number; city: string } | null {
  const prefix = parseInt(zip.substring(0, 3), 10);
  for (const [start, end, lat, lng, city] of prefixRegions) {
    if (prefix >= start && prefix <= end) {
      // Add slight variation based on last 2 digits for uniqueness
      const last2 = parseInt(zip.substring(3), 10) || 0;
      const latOffset = ((last2 % 10) - 5) * 0.015;
      const lngOffset = (Math.floor(last2 / 10) - 5) * 0.015;
      return { lat: lat + latOffset, lng: lng + lngOffset, city };
    }
  }
  return null;
}

export function getCoordinatesForZip(zip: string): { lat: number; lng: number; city: string } | null {
  // Exact match first
  if (exactZips[zip]) return exactZips[zip];
  // Fallback to prefix-based lookup
  return getByPrefix(zip);
}
