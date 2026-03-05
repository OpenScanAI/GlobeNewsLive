import { NextResponse } from "next/server";

// OpenSky Network API - free, no key required for basic usage
const OPENSKY_API = "https://opensky-network.org/api/states/all";

// Military callsign patterns
const MILITARY_PATTERNS = [
  // US Military
  /^RCH\d/, // REACH - C-17s, C-5s (strategic airlift)
  /^FORTE\d/, // Global Hawk drones
  /^HOMER\d/, // RC-135 Rivet Joint (SIGINT)
  /^JAKE\d/, // E-8 JSTARS
  /^SENTRY\d/, // E-3 AWACS
  /^DOOM\d/, // B-52s
  /^DEATH\d/, // B-1B Lancers
  /^GHOST\d/, // B-2 Spirit (rare)
  /^TOPCAT/, // F-22 Raptors
  /^VIPER\d/, // F-16s
  /^STRIKE\d/, // F-15Es
  /^EAGLE\d/, // F-15Cs
  /^WOLF/, // Special ops
  /^KNIFE/, // Special ops
  /^HAVOC/, // Apache gunships
  /^REAPER/, // MQ-9 Reaper drones
  /^PRED/, // MQ-1 Predator drones
  /^TANKER/, // KC-135/KC-46 refuelers
  /^SHELL\d/, // Tanker ops
  /^TEAL\d/, // Tanker ops
  /^PACK\d/, // Tanker ops
  /^ETHYL/, // Tanker ops
  /^LAGR/, // USAF tankers
  /^NCHO\d/, // Nightwatch E-4B (doomsday plane)
  /^CODY\d/, // C-32/C-40
  /^EXEC\d/, // Executive transport
  /^SAM\d/, // Air Force special missions
  /^AF[12]/, // Air Force One/Two
  /^VENUS\d/, // Air Force Special ops
  /^NAVY\d/, // US Navy
  /^TOPGUN/, // US Navy fighter school

  // NATO/Allied
  /^NATO\d/, // NATO ops
  /^RAF\d/, // Royal Air Force
  /^RRR\d/, // RAF tankers
  /^ASCOT\d/, // RAF transport
  /^TARTAN/, // RAF Scotland
  /^CNV\d/, // French Air Force
  /^FAF\d/, // French Air Force
  /^GAF\d/, // German Air Force
  /^IAF\d/, // Israeli Air Force
  /^IAM\d/, // Italian Air Force
  /^PLF\d/, // Polish Air Force
  /^DUKE\d/, // Allied air ops

  // Surveillance/SIGINT
  /^GORDO/, // RC-135 Cobra Ball
  /^OLIVE/, // RC-135 Combat Sent
  /^BALL/, // Missile tracking
  /^IRON/, // Counter-ISR

  // Tankers
  /^QUID\d/, // Tanker ops
  /^GOLD\d/, // Tanker ops

  // Russian (if visible)
  /^RSD\d/, // Russian military
  /^RF\d/, // Russian Federation

  // Drones
  /^UAV/,
  /^DRONE/,
  /^RQ/, // RQ-4 Global Hawk, RQ-180
  /^MQ/, // MQ-9 Reaper, MQ-1 Predator
];

// Interesting aircraft types
const MILITARY_TYPES = [
  "C17",
  "C5",
  "C130",
  "KC135",
  "KC46",
  "E3",
  "E4",
  "E6",
  "E8",
  "RC135",
  "P8",
  "P3",
  "B52",
  "B1",
  "B2",
  "F22",
  "F35",
  "F15",
  "F16",
  "F18",
  "A10",
  "AC130",
  "C32",
  "C40",
  "RQ4",
  "MQ9",
  "MQ1",
  "TYPHOON",
  "RAFALE",
  "EUROFIGHTER",
  "TORNADO",
  "MIRAGE",
  "SU27",
  "SU35",
  "MIG29",
  "TU95",
  "TU160",
  "IL76",
  "AN124",
  "A400",
  "C17A",
  "C130J",
  "V22",
  "CH47",
  "MH60",
  "AH64",
  "UH60",
  "BLACKHAWK",
  "APACHE",
  "CHINOOK",
  "OSPREY",
];

interface FlightState {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  sensors: number[] | null;
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
}

interface Aircraft {
  id: string;
  callsign: string;
  country: string;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalRate: number;
  squawk: string | null;
  type:
    | "military"
    | "surveillance"
    | "tanker"
    | "transport"
    | "fighter"
    | "drone"
    | "civilian";
  category: string;
  isMilitary: boolean;
}

// Regions of interest for military monitoring
const REGIONS = {
  global: { lamin: -60, lamax: 70, lomin: -180, lomax: 180 },
  europe: { lamin: 35, lamax: 72, lomin: -25, lomax: 45 },
  middleeast: { lamin: 12, lamax: 45, lomin: 25, lomax: 70 },
  ukraine: { lamin: 44, lamax: 53, lomin: 22, lomax: 42 },
  taiwan: { lamin: 20, lamax: 30, lomin: 115, lomax: 130 },
  korea: { lamin: 33, lamax: 43, lomin: 124, lomax: 132 },
  iran: { lamin: 24, lamax: 40, lomin: 44, lomax: 64 },
  redsea: { lamin: 10, lamax: 32, lomin: 32, lomax: 50 },
};

function isMilitaryCallsign(callsign: string): boolean {
  if (!callsign) return false;
  const clean = callsign.trim().toUpperCase();
  return MILITARY_PATTERNS.some((pattern) => pattern.test(clean));
}

function classifyAircraft(callsign: string): Aircraft["type"] {
  if (!callsign) return "civilian";
  const clean = callsign.trim().toUpperCase();

  if (/^(FORTE|HOMER|GORDO|OLIVE|BALL)/.test(clean)) return "surveillance";
  if (/^(REACH|RCH|CODY|EXEC)/.test(clean)) return "transport";
  if (/^(TANKER|SHELL|TEAL|PACK|ETHYL|LAGR|QUID|GOLD)/.test(clean))
    return "tanker";
  if (/^(DOOM|DEATH|GHOST|VIPER|STRIKE|EAGLE|TOPCAT|TOPGUN)/.test(clean))
    return "fighter";
  if (/^(REAPER|PRED|UAV|DRONE|RQ|MQ)/.test(clean)) return "drone";
  if (isMilitaryCallsign(clean)) return "military";

  return "civilian";
}

function getCategory(type: Aircraft["type"]): string {
  switch (type) {
    case "surveillance":
      return "🔍 SIGINT/ISR";
    case "transport":
      return "🚀 Strategic Airlift";
    case "tanker":
      return "⛽ Tanker";
    case "fighter":
      return "✈️ Fighter/Bomber";
    case "drone":
      return "🤖 UAV/Drone";
    case "military":
      return "🎖️ Military";
    default:
      return "✈️ Civil";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "middleeast";
  const militaryOnly = searchParams.get("military") !== "false";

  const bounds = REGIONS[region as keyof typeof REGIONS] || REGIONS.middleeast;

  try {
    // Fetch from OpenSky with bounding box
    const url = `${OPENSKY_API}?lamin=${bounds.lamin}&lamax=${bounds.lamax}&lomin=${bounds.lomin}&lomax=${bounds.lomax}`;

    console.log(
      `[Flights API] Fetching from OpenSky: region=${region}, military=${militaryOnly}`,
    );
    console.log(`[Flights API] Bounds: ${JSON.stringify(bounds)}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "XDC-BlocksScan-HeatMap/1.0",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      console.error(
        `[Flights API] OpenSky API returned status ${response.status}`,
      );
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.states || data.states.length === 0) {
      console.warn(`[Flights API] No flight states in response`);
      throw new Error("No flight data available");
    }

    console.log(
      `[Flights API] Received ${data.states.length} flight states from OpenSky`,
    );

    // Parse aircraft states
    const aircraft: Aircraft[] = data.states
      .map((state: (string | number | boolean | null)[]): Aircraft | null => {
        const callsign = ((state[1] as string) || "").trim();
        const lat = state[6] as number;
        const lon = state[5] as number;

        if (!lat || !lon) return null;

        const type = classifyAircraft(callsign);
        const isMilitary = type !== "civilian";

        // Filter civilian if militaryOnly
        if (militaryOnly && !isMilitary) return null;

        return {
          id: state[0] as string,
          callsign,
          country: state[2] as string,
          lat,
          lon,
          altitude: Math.round(
            (state[13] as number) || (state[7] as number) || 0,
          ),
          speed: Math.round(((state[9] as number) || 0) * 1.944), // m/s to knots
          heading: Math.round((state[10] as number) || 0),
          verticalRate: Math.round(((state[11] as number) || 0) * 196.85), // m/s to fpm
          squawk: (state[14] as string) || null,
          type,
          category: getCategory(type),
          isMilitary,
        };
      })
      .filter(Boolean) as Aircraft[];

    // Sort: military first, then by altitude
    aircraft.sort((a, b) => {
      if (a.isMilitary && !b.isMilitary) return -1;
      if (!a.isMilitary && b.isMilitary) return 1;
      return b.altitude - a.altitude;
    });

    const militaryCount = aircraft.filter((a) => a.isMilitary).length;

    const result = aircraft.slice(0, 200);
    return NextResponse.json({
      flights: result, // Primary key for consistency
      aircraft: result, // Alias for backwards compatibility
      timestamp: data.time * 1000,
      region,
      bounds,
      total: data.states.length,
      filtered: aircraft.length,
      military: militaryCount,
      categories: {
        surveillance: aircraft.filter((a) => a.type === "surveillance").length,
        tanker: aircraft.filter((a) => a.type === "tanker").length,
        fighter: aircraft.filter((a) => a.type === "fighter").length,
        transport: aircraft.filter((a) => a.type === "transport").length,
        drone: aircraft.filter((a) => a.type === "drone").length,
        military: aircraft.filter((a) => a.type === "military").length,
        civilian: aircraft.filter((a) => a.type === "civilian").length,
      },
    });
  } catch (error) {
    console.error(
      "[Flights API] Error fetching from OpenSky:",
      error instanceof Error ? error.message : error,
    );

    // Generate simulated flight data with realistic movements
    const time = Date.now() / 1000;
    const offset = (time / 100) % 360; // Slowly rotating positions

    const generateSimulated = () => {
      const simulated: Aircraft[] = [];

      // Different regions for global coverage
      const regionData = [
        { name: "Europe", lat: 50, lon: 10 },
        { name: "Middle East", lat: 35, lon: 45 },
        { name: "Asia", lat: 35, lon: 120 },
        { name: "North America", lat: 40, lon: -95 },
        { name: "Pacific", lat: 10, lon: 150 },
      ];

      regionData.forEach((reg, idx) => {
        const angle = (offset + idx * 72) * (Math.PI / 180); // 5 regions, 72 degrees apart
        const radius = 10;

        // ISR Aircraft
        simulated.push({
          id: `sim-forte${10 + idx}`,
          callsign: `FORTE${10 + idx}`,
          country: "United States",
          lat: reg.lat + Math.cos(angle) * radius,
          lon: reg.lon + Math.sin(angle) * radius,
          altitude: 55000,
          speed: 340,
          heading: (offset + idx * 45) % 360,
          verticalRate: 0,
          squawk: "7777",
          type: "surveillance",
          category: "🔍 SIGINT/ISR",
          isMilitary: true,
        });

        // Tanker
        simulated.push({
          id: `sim-lagr${200 + idx}`,
          callsign: `LAGR${200 + idx}`,
          country: "United States",
          lat: reg.lat + Math.sin(angle * 2) * (radius / 2),
          lon: reg.lon + Math.cos(angle * 2) * (radius / 2),
          altitude: 28000,
          speed: 420,
          heading: (offset + idx * 90) % 360,
          verticalRate: 0,
          squawk: "0321",
          type: "tanker",
          category: "⛽ Tanker",
          isMilitary: true,
        });

        // Transport
        if (idx % 2 === 0) {
          simulated.push({
            id: `sim-rch${800 + idx}`,
            callsign: `RCH${800 + idx}`,
            country: "United States",
            lat: reg.lat + Math.cos(angle * 1.5) * (radius * 0.7),
            lon: reg.lon + Math.sin(angle * 1.5) * (radius * 0.7),
            altitude: 35000,
            speed: 480,
            heading: (offset + idx * 60) % 360,
            verticalRate: 0,
            squawk: "1200",
            type: "transport",
            category: "🚀 Strategic Airlift",
            isMilitary: true,
          });
        }
      });

      return simulated;
    };

    const simulated = generateSimulated();

    return NextResponse.json({
      flights: simulated,
      aircraft: simulated,
      timestamp: Date.now(),
      region,
      total: simulated.length,
      military: simulated.length,
      simulated: true,
      error:
        "OpenSky API unavailable - showing simulated data with animated positions",
    });
  }
}
