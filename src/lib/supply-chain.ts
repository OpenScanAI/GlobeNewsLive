// Major global ports with coordinates
export const MAJOR_PORTS = [
  { name: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47, throughput: '47M TEU', region: 'Asia' },
  { name: 'Singapore', country: 'Singapore', lat: 1.26, lon: 103.82, throughput: '37M TEU', region: 'Asia' },
  { name: 'Ningbo-Zhoushan', country: 'China', lat: 29.87, lon: 121.55, throughput: '35M TEU', region: 'Asia' },
  { name: 'Shenzhen', country: 'China', lat: 22.54, lon: 114.06, throughput: '30M TEU', region: 'Asia' },
  { name: 'Busan', country: 'South Korea', lat: 35.10, lon: 129.04, throughput: '22M TEU', region: 'Asia' },
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.95, lon: 4.14, throughput: '14M TEU', region: 'Europe' },
  { name: 'Hamburg', country: 'Germany', lat: 53.55, lon: 9.99, throughput: '8M TEU', region: 'Europe' },
  { name: 'Antwerp', country: 'Belgium', lat: 51.22, lon: 4.40, throughput: '12M TEU', region: 'Europe' },
  { name: 'Los Angeles', country: 'USA', lat: 33.73, lon: -118.26, throughput: '10M TEU', region: 'Americas' },
  { name: 'Long Beach', country: 'USA', lat: 33.77, lon: -118.19, throughput: '9M TEU', region: 'Americas' },
  { name: 'New York/New Jersey', country: 'USA', lat: 40.67, lon: -74.17, throughput: '7M TEU', region: 'Americas' },
  { name: 'Dubai (Jebel Ali)', country: 'UAE', lat: 25.01, lon: 55.06, throughput: '14M TEU', region: 'Middle East' },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.93, lon: 79.84, throughput: '7M TEU', region: 'Asia' },
  { name: 'Tanger Med', country: 'Morocco', lat: 35.89, lon: -5.51, throughput: '7M TEU', region: 'Africa' },
  { name: 'Santos', country: 'Brazil', lat: -23.96, lon: -46.33, throughput: '4M TEU', region: 'Americas' },
  { name: 'Durban', country: 'South Africa', lat: -29.86, lon: 31.03, throughput: '3M TEU', region: 'Africa' },
  { name: 'Mumbai (Nhava Sheva)', country: 'India', lat: 18.95, lon: 72.93, throughput: '5M TEU', region: 'Asia' },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69, throughput: '4M TEU', region: 'Asia' },
  { name: 'Piraeus', country: 'Greece', lat: 37.95, lon: 23.64, throughput: '5M TEU', region: 'Europe' },
  { name: 'Vancouver', country: 'Canada', lat: 49.28, lon: -123.12, throughput: '3M TEU', region: 'Americas' },
];

// Strategic chokepoints with coordinates
export const CHOKEPOINTS = [
  { name: 'Strait of Hormuz', lat: 26.57, lon: 56.25, risk: 'high', throughput: '21M bpd oil', region: 'Middle East' },
  { name: 'Strait of Malacca', lat: 2.50, lon: 101.80, risk: 'medium', throughput: '25% global trade', region: 'Asia' },
  { name: 'Suez Canal', lat: 30.46, lon: 32.35, risk: 'medium', throughput: '12% global trade', region: 'Africa/Europe' },
  { name: 'Bab el-Mandeb', lat: 12.58, lon: 43.33, risk: 'high', throughput: '6M bpd oil', region: 'Middle East/Africa' },
  { name: 'Panama Canal', lat: 9.08, lon: -79.68, risk: 'low', throughput: '5% global trade', region: 'Americas' },
  { name: 'Turkish Straits', lat: 41.12, lon: 29.07, risk: 'medium', throughput: '2.4M bpd oil', region: 'Europe/Asia' },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, risk: 'high', throughput: '50% global trade', region: 'Asia' },
  { name: 'GIUK Gap', lat: 63.0, lon: -20.0, risk: 'medium', throughput: 'Military strategic', region: 'Atlantic' },
];

// Major trade routes connecting ports through chokepoints
export const TRADE_ROUTES = [
  { from: 'Shanghai', to: 'Rotterdam', via: ['Strait of Malacca', 'Suez Canal'], name: 'Asia-Europe Express' },
  { from: 'Shanghai', to: 'Los Angeles', via: ['Taiwan Strait'], name: 'Trans-Pacific Eastbound' },
  { from: 'Singapore', to: 'Dubai (Jebel Ali)', via: ['Strait of Malacca'], name: 'Asia-Middle East' },
  { from: 'Dubai (Jebel Ali)', to: 'Rotterdam', via: ['Strait of Hormuz', 'Suez Canal'], name: 'Middle East-Europe' },
  { from: 'Los Angeles', to: 'New York/New Jersey', via: ['Panama Canal'], name: 'US Coast-to-Coast' },
  { from: 'Rotterdam', to: 'New York/New Jersey', via: ['GIUK Gap'], name: 'Trans-Atlantic' },
  { from: 'Santos', to: 'Rotterdam', via: ['GIUK Gap'], name: 'South America-Europe' },
  { from: 'Durban', to: 'Mumbai (Nhava Sheva)', via: [], name: 'Indian Ocean Route' },
  { from: 'Colombo', to: 'Singapore', via: ['Strait of Malacca'], name: 'South Asia-Southeast Asia' },
  { from: 'Tanger Med', to: 'Piraeus', via: ['Suez Canal'], name: 'Africa-Europe' },
];

// Port status types
type PortStatus = 'normal' | 'congested' | 'closed' | 'restricted' | 'unknown';

export interface PortState {
  name: string;
  status: PortStatus;
  waitTime: string; // e.g., "2-3 days"
  vesselsAtAnchor: number;
  lastUpdated: string;
  notes?: string;
}

export interface ChokepointState {
  name: string;
  status: 'open' | 'delayed' | 'partial' | 'closed';
  delayHours: number;
  incidents: string[];
  affectedRoutes: string[];
}

export interface SupplyChainAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedPorts: string[];
  affectedChokepoints: string[];
  relatedConflicts?: string[];
  timestamp: string;
}
