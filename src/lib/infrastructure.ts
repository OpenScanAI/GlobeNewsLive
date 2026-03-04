// Critical Infrastructure Data for Map Layers

export interface InfrastructurePoint {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  country: string;
  description?: string;
  status?: 'active' | 'inactive' | 'unknown';
  risk?: 'low' | 'medium' | 'high' | 'critical';
}

// ☢ NUCLEAR SITES - Major facilities worldwide
export const NUCLEAR_SITES: InfrastructurePoint[] = [
  // USA
  { id: 'nuke-1', name: 'Los Alamos National Lab', type: 'weapons', lat: 35.88, lon: -106.30, country: 'USA', status: 'active' },
  { id: 'nuke-2', name: 'Pantex Plant', type: 'weapons', lat: 35.32, lon: -101.56, country: 'USA', status: 'active', description: 'Primary US nuclear weapons assembly' },
  { id: 'nuke-3', name: 'Y-12 Oak Ridge', type: 'weapons', lat: 35.98, lon: -84.25, country: 'USA', status: 'active' },
  // Russia
  { id: 'nuke-4', name: 'Sarov (Arzamas-16)', type: 'weapons', lat: 54.93, lon: 43.32, country: 'Russia', status: 'active', description: 'Russian nuclear weapons design' },
  { id: 'nuke-5', name: 'Seversk (Tomsk-7)', type: 'enrichment', lat: 56.60, lon: 84.88, country: 'Russia', status: 'active' },
  { id: 'nuke-6', name: 'Zheleznogorsk', type: 'plutonium', lat: 56.25, lon: 93.53, country: 'Russia', status: 'active' },
  // China
  { id: 'nuke-7', name: 'Lop Nur', type: 'testing', lat: 41.55, lon: 88.70, country: 'China', status: 'inactive', description: 'Former nuclear test site' },
  { id: 'nuke-8', name: 'Lanzhou', type: 'enrichment', lat: 36.05, lon: 103.83, country: 'China', status: 'active' },
  // Iran
  { id: 'nuke-9', name: 'Natanz', type: 'enrichment', lat: 33.72, lon: 51.72, country: 'Iran', status: 'active', risk: 'critical', description: 'Primary uranium enrichment' },
  { id: 'nuke-10', name: 'Fordow', type: 'enrichment', lat: 34.88, lon: 51.00, country: 'Iran', status: 'active', risk: 'critical', description: 'Underground enrichment facility' },
  { id: 'nuke-11', name: 'Isfahan', type: 'conversion', lat: 32.65, lon: 51.68, country: 'Iran', status: 'active', risk: 'high' },
  { id: 'nuke-12', name: 'Arak', type: 'reactor', lat: 34.37, lon: 49.24, country: 'Iran', status: 'active', risk: 'high', description: 'Heavy water reactor' },
  // North Korea
  { id: 'nuke-13', name: 'Yongbyon', type: 'reactor', lat: 39.80, lon: 125.75, country: 'North Korea', status: 'active', risk: 'critical' },
  { id: 'nuke-14', name: 'Punggye-ri', type: 'testing', lat: 41.28, lon: 129.08, country: 'North Korea', status: 'active', risk: 'critical', description: 'Nuclear test site' },
  // Israel (undeclared)
  { id: 'nuke-15', name: 'Dimona', type: 'reactor', lat: 31.00, lon: 35.15, country: 'Israel', status: 'active', description: 'Negev Nuclear Research Center' },
  // Pakistan
  { id: 'nuke-16', name: 'Kahuta', type: 'enrichment', lat: 33.60, lon: 73.40, country: 'Pakistan', status: 'active' },
  { id: 'nuke-17', name: 'Khushab', type: 'reactor', lat: 32.02, lon: 72.22, country: 'Pakistan', status: 'active' },
  // India
  { id: 'nuke-18', name: 'Bhabha ARC', type: 'research', lat: 19.01, lon: 72.92, country: 'India', status: 'active' },
  { id: 'nuke-19', name: 'Pokhran', type: 'testing', lat: 27.07, lon: 71.75, country: 'India', status: 'inactive' },
  // UK
  { id: 'nuke-20', name: 'Aldermaston', type: 'weapons', lat: 51.37, lon: -1.15, country: 'UK', status: 'active' },
  // France
  { id: 'nuke-21', name: 'Valduc', type: 'weapons', lat: 47.48, lon: 4.92, country: 'France', status: 'active' },
];

// 🚀 SPACEPORTS - Launch facilities
export const SPACEPORTS: InfrastructurePoint[] = [
  // USA
  { id: 'space-1', name: 'Kennedy Space Center', type: 'orbital', lat: 28.57, lon: -80.65, country: 'USA', status: 'active' },
  { id: 'space-2', name: 'Vandenberg SFB', type: 'orbital', lat: 34.74, lon: -120.57, country: 'USA', status: 'active' },
  { id: 'space-3', name: 'SpaceX Starbase', type: 'orbital', lat: 25.99, lon: -97.15, country: 'USA', status: 'active', description: 'Starship launch site' },
  { id: 'space-4', name: 'Wallops Flight Facility', type: 'orbital', lat: 37.94, lon: -75.47, country: 'USA', status: 'active' },
  // Russia
  { id: 'space-5', name: 'Baikonur Cosmodrome', type: 'orbital', lat: 45.96, lon: 63.31, country: 'Kazakhstan/Russia', status: 'active' },
  { id: 'space-6', name: 'Plesetsk Cosmodrome', type: 'orbital', lat: 62.93, lon: 40.57, country: 'Russia', status: 'active' },
  { id: 'space-7', name: 'Vostochny Cosmodrome', type: 'orbital', lat: 51.88, lon: 128.33, country: 'Russia', status: 'active' },
  // China
  { id: 'space-8', name: 'Jiuquan', type: 'orbital', lat: 40.96, lon: 100.29, country: 'China', status: 'active' },
  { id: 'space-9', name: 'Wenchang', type: 'orbital', lat: 19.61, lon: 110.95, country: 'China', status: 'active' },
  { id: 'space-10', name: 'Xichang', type: 'orbital', lat: 28.25, lon: 102.03, country: 'China', status: 'active' },
  // Others
  { id: 'space-11', name: 'Guiana Space Centre', type: 'orbital', lat: 5.24, lon: -52.77, country: 'France/ESA', status: 'active' },
  { id: 'space-12', name: 'Satish Dhawan (SHAR)', type: 'orbital', lat: 13.72, lon: 80.23, country: 'India', status: 'active' },
  { id: 'space-13', name: 'Tanegashima', type: 'orbital', lat: 30.40, lon: 130.97, country: 'Japan', status: 'active' },
  { id: 'space-14', name: 'Sohae', type: 'ICBM', lat: 39.66, lon: 124.70, country: 'North Korea', status: 'active', risk: 'critical' },
  { id: 'space-15', name: 'Semnan', type: 'ICBM', lat: 35.23, lon: 53.92, country: 'Iran', status: 'active', risk: 'high' },
];

// 🔌 UNDERSEA CABLES - Critical internet infrastructure
export const UNDERSEA_CABLES: { id: string; name: string; points: [number, number][]; capacity: string; owners: string }[] = [
  {
    id: 'cable-1',
    name: 'SEA-ME-WE 3',
    points: [[1.29, 103.85], [6.93, 79.85], [12.07, 45.02], [31.20, 32.30], [36.80, 10.18], [43.30, -8.40]],
    capacity: '960 Gbps',
    owners: 'Singapore Telecom, Telekom Malaysia'
  },
  {
    id: 'cable-2', 
    name: 'FLAG Europe-Asia',
    points: [[22.30, 114.17], [6.93, 79.85], [25.28, 55.30], [31.20, 32.30], [35.50, 23.73], [37.97, 23.73], [40.85, 29.05], [41.01, 28.97]],
    capacity: '10 Tbps',
    owners: 'Reliance Globalcom'
  },
  {
    id: 'cable-3',
    name: 'TAT-14',
    points: [[40.70, -74.00], [51.50, -0.12], [52.52, 4.90], [55.68, 12.57]],
    capacity: '3.2 Tbps',
    owners: 'AT&T, BT, Deutsche Telekom'
  },
  {
    id: 'cable-4',
    name: 'Asia-America Gateway',
    points: [[35.68, 139.69], [22.30, 114.17], [1.35, 103.82], [37.57, -122.38]],
    capacity: '2 Tbps',
    owners: 'AT&T, China Telecom, NTT'
  },
  {
    id: 'cable-5',
    name: 'MAREA',
    points: [[39.45, -74.45], [43.46, -3.80]],
    capacity: '200 Tbps',
    owners: 'Microsoft, Facebook, Telxius'
  },
];

// 🛢 PIPELINES - Major energy infrastructure
export const PIPELINES: { id: string; name: string; type: 'oil' | 'gas'; points: [number, number][]; status: string }[] = [
  {
    id: 'pipe-1',
    name: 'Nord Stream 1 & 2',
    type: 'gas',
    points: [[59.95, 30.32], [55.04, 8.42], [54.18, 12.09]],
    status: 'sabotaged'
  },
  {
    id: 'pipe-2',
    name: 'Druzhba Pipeline',
    type: 'oil',
    points: [[52.10, 50.12], [51.76, 36.19], [50.45, 30.52], [52.23, 21.01], [52.52, 13.41]],
    status: 'active'
  },
  {
    id: 'pipe-3',
    name: 'TurkStream',
    type: 'gas',
    points: [[44.62, 37.77], [41.29, 28.78], [41.01, 28.97]],
    status: 'active'
  },
  {
    id: 'pipe-4',
    name: 'BTC Pipeline',
    type: 'oil',
    points: [[40.41, 49.87], [41.69, 44.83], [36.89, 36.02]],
    status: 'active'
  },
  {
    id: 'pipe-5',
    name: 'Strait of Hormuz Transit',
    type: 'oil',
    points: [[26.60, 56.27], [25.28, 55.30], [24.47, 54.37]],
    status: 'critical chokepoint'
  },
];

// 🖥 AI DATA CENTERS - Major AI compute clusters
export const AI_DATA_CENTERS: InfrastructurePoint[] = [
  // USA
  { id: 'ai-1', name: 'Microsoft Azure (Quincy)', type: 'hyperscale', lat: 47.23, lon: -119.85, country: 'USA', status: 'active', description: '100K+ GPUs' },
  { id: 'ai-2', name: 'Google (The Dalles)', type: 'hyperscale', lat: 45.60, lon: -121.18, country: 'USA', status: 'active' },
  { id: 'ai-3', name: 'Meta AI (Prineville)', type: 'hyperscale', lat: 44.30, lon: -120.83, country: 'USA', status: 'active' },
  { id: 'ai-4', name: 'Oracle/xAI Colossus', type: 'AI', lat: 35.46, lon: -97.51, country: 'USA', status: 'active', description: '100K H100 GPUs' },
  { id: 'ai-5', name: 'CoreWeave NJ', type: 'AI', lat: 40.06, lon: -74.41, country: 'USA', status: 'active' },
  // China
  { id: 'ai-6', name: 'Alibaba (Zhangbei)', type: 'hyperscale', lat: 41.15, lon: 114.70, country: 'China', status: 'active' },
  { id: 'ai-7', name: 'Tencent (Tianjin)', type: 'hyperscale', lat: 39.13, lon: 117.20, country: 'China', status: 'active' },
  { id: 'ai-8', name: 'Baidu AI (Yangquan)', type: 'AI', lat: 37.87, lon: 113.58, country: 'China', status: 'active' },
  // Europe
  { id: 'ai-9', name: 'Google (Hamina)', type: 'hyperscale', lat: 60.57, lon: 27.18, country: 'Finland', status: 'active' },
  { id: 'ai-10', name: 'Microsoft (Dublin)', type: 'hyperscale', lat: 53.35, lon: -6.26, country: 'Ireland', status: 'active' },
  // Middle East
  { id: 'ai-11', name: 'AWS Bahrain', type: 'hyperscale', lat: 26.07, lon: 50.55, country: 'Bahrain', status: 'active' },
  { id: 'ai-12', name: 'G42 (Abu Dhabi)', type: 'AI', lat: 24.47, lon: 54.37, country: 'UAE', status: 'active', description: 'Falcon AI training' },
];

// 🎯 IRAN-SPECIFIC TARGETS (for Iran Attacks theater)
export const IRAN_TARGETS: InfrastructurePoint[] = [
  // Nuclear
  { id: 'iran-1', name: 'Natanz Enrichment', type: 'nuclear', lat: 33.72, lon: 51.72, country: 'Iran', risk: 'critical' },
  { id: 'iran-2', name: 'Fordow Underground', type: 'nuclear', lat: 34.88, lon: 51.00, country: 'Iran', risk: 'critical' },
  { id: 'iran-3', name: 'Isfahan UCF', type: 'nuclear', lat: 32.65, lon: 51.68, country: 'Iran', risk: 'high' },
  { id: 'iran-4', name: 'Arak Heavy Water', type: 'nuclear', lat: 34.37, lon: 49.24, country: 'Iran', risk: 'high' },
  { id: 'iran-5', name: 'Bushehr NPP', type: 'power', lat: 28.83, lon: 50.88, country: 'Iran', risk: 'medium' },
  // Military
  { id: 'iran-6', name: 'Parchin Military', type: 'military', lat: 35.52, lon: 51.77, country: 'Iran', risk: 'high', description: 'Suspected weapons R&D' },
  { id: 'iran-7', name: 'Isfahan AF Base', type: 'airbase', lat: 32.75, lon: 51.86, country: 'Iran', risk: 'medium' },
  { id: 'iran-8', name: 'Bandar Abbas Naval', type: 'naval', lat: 27.18, lon: 56.28, country: 'Iran', risk: 'high' },
  { id: 'iran-9', name: 'Kharg Island', type: 'oil', lat: 29.23, lon: 50.32, country: 'Iran', risk: 'critical', description: '90% of Iran oil exports' },
  // Missile
  { id: 'iran-10', name: 'Semnan Space Center', type: 'missile', lat: 35.23, lon: 53.92, country: 'Iran', risk: 'high' },
  { id: 'iran-11', name: 'Shahrud Missile Base', type: 'missile', lat: 36.42, lon: 55.02, country: 'Iran', risk: 'high' },
  // IRGC
  { id: 'iran-12', name: 'IRGC HQ Tehran', type: 'military', lat: 35.70, lon: 51.42, country: 'Iran', risk: 'medium' },
];

// Layer definitions for map toggle
export const INFRASTRUCTURE_LAYERS = [
  { id: 'nuclear', name: 'Nuclear Sites', icon: '☢️', color: '#FF4444' },
  { id: 'spaceports', name: 'Spaceports', icon: '🚀', color: '#8844FF' },
  { id: 'cables', name: 'Undersea Cables', icon: '🔌', color: '#00AAFF' },
  { id: 'pipelines', name: 'Pipelines', icon: '🛢️', color: '#FF8800' },
  { id: 'ai-centers', name: 'AI Data Centers', icon: '🖥️', color: '#00FF88' },
  { id: 'iran', name: 'Iran Targets', icon: '🎯', color: '#FF0000' },
];
