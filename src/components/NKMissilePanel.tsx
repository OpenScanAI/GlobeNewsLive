'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Facility { name: string; lat: number; lon: number; }
interface MissileTest {
  date: string; time: string; series: number; missile: string;
  facility: string; landing: string; apogee: string | number;
  distance: string | number; bearing: number; outcome: string; description: string;
}
interface TimeBin { data: MissileTest[]; }

const OUTCOME_COLOR: Record<string, string> = {
  success: '#ff2020', failure: '#4488ff', unknown: '#ffcc00'
};
const OUTCOME_ICON: Record<string, string> = {
  success: '🚀', failure: '💀', unknown: '❓'
};

export default function NKMissilePanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tests, setTests] = useState<MissileTest[]>([]);
  const [facilities, setFacilities] = useState<Record<string, Facility>>({});
  const [missiles, setMissiles] = useState<Record<string, any>>({});
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failure' | 'unknown'>('all');
  const [selectedTest, setSelectedTest] = useState<MissileTest | null>(null);
  const [stats, setStats] = useState({ total: 0, success: 0, failure: 0, unknown: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/nk-data/test.en.json').then(r => r.json()),
      fetch('/nk-data/facility.en.json').then(r => r.json()),
      fetch('/nk-data/missile.en.json').then(r => r.json()),
    ]).then(([testData, facData, misData]) => {
      const allTests: MissileTest[] = [];
      (testData.timeBins as TimeBin[]).forEach(bin => allTests.push(...bin.data));
      setTests(allTests);
      setFacilities(facData.facilities);
      setMissiles(misData.missiles || {});
      setStats({
        total: allTests.length,
        success: allTests.filter(t => t.outcome === 'success').length,
        failure: allTests.filter(t => t.outcome === 'failure').length,
        unknown: allTests.filter(t => t.outcome === 'unknown').length,
      });
    }).catch(console.error);
  }, []);

  const getFilteredTests = useCallback(() => {
    return tests.filter(t => {
      const yearMatch = selectedYear === null || new Date(t.date).getFullYear() === selectedYear;
      const outcomeMatch = filter === 'all' || t.outcome === filter;
      return yearMatch && outcomeMatch;
    });
  }, [tests, selectedYear, filter]);

  const calcLanding = (fac: Facility, bearing: number, distanceKm: number) => {
    const R = 6371;
    const d = distanceKm / R;
    const brng = (bearing * Math.PI) / 180;
    const lat1 = (fac.lat * Math.PI) / 180;
    const lon1 = (fac.lon * Math.PI) / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: (lat2 * 180) / Math.PI, lon: (lon2 * 180) / Math.PI };
  };

  useEffect(() => {
    if (!containerRef.current || tests.length === 0 || Object.keys(facilities).length === 0) return;
    let destroyed = false;

    const initGlobe = async () => {
      try {
        const GlobeModule = await import('globe.gl');
        const GlobeCtor = GlobeModule.default as any;
        if (destroyed || !containerRef.current) return;
        const el = containerRef.current;
        const globe = new GlobeCtor(el);

        globe
          .width(el.clientWidth || 600).height(el.clientHeight || 500)
          .backgroundColor('rgba(0,0,0,0)')
          .globeImageUrl('/textures/earth-topo-bathy.jpg')
          .backgroundImageUrl('/textures/night-sky.png')
          .atmosphereColor('#ff4400')
          .atmosphereAltitude(0.12)
          .arcsData([])
          .arcStartLat((d: any) => d.startLat)
          .arcStartLng((d: any) => d.startLng)
          .arcEndLat((d: any) => d.endLat)
          .arcEndLng((d: any) => d.endLng)
          .arcColor((d: any) => d.color)
          .arcDashLength(0.5)
          .arcDashGap(0.3)
          .arcDashAnimateTime(1800)
          .arcStroke((d: any) => d.stroke || 0.5)
          .arcAltitudeAutoScale(0.4)
          .htmlElementsData([])
          .htmlLat((d: any) => d.lat)
          .htmlLng((d: any) => d.lng)
          .htmlAltitude(0.01)
          .htmlElement((d: any) => {
            const el2 = document.createElement('div');
            el2.style.cssText = 'cursor:pointer;transform:translate(-50%,-50%)';
            el2.innerHTML = `<div title="${d.label}" style="font-size:${d.size||16}px;filter:drop-shadow(0 0 6px ${d.color})">${d.icon}</div>`;
            el2.onclick = () => d.onClick?.();
            return el2;
          });

        globe.controls().autoRotate = false;
        globe.controls().enableZoom = true;
        globe.pointOfView({ lat: 35, lng: 127, altitude: 2.5 }, 800);

        globeRef.current = globe;
        setIsLoaded(true);

        const obs = new ResizeObserver(e => {
          globe.width(e[0].contentRect.width).height(e[0].contentRect.height);
        });
        obs.observe(el);
      } catch (err) { console.error(err); }
    };

    initGlobe();
    return () => { destroyed = true; };
  }, [tests, facilities]);

  useEffect(() => {
    if (!globeRef.current || !isLoaded) return;
    const filtered = getFilteredTests();

    // Build arcs (missile trajectories)
    const arcs: any[] = [];
    const markers: any[] = [];

    filtered.forEach(test => {
      const fac = facilities[test.facility];
      if (!fac) return;
      const dist = typeof test.distance === 'number' ? test.distance : parseFloat(String(test.distance));
      const color = OUTCOME_COLOR[test.outcome] || '#ffffff';

      // Launch site marker
      markers.push({
        lat: fac.lat, lng: fac.lon,
        icon: '🇰🇵', size: 14, color,
        label: `${fac.name}\n${test.date} · ${missiles[test.missile]?.name || test.missile}`,
        onClick: () => setSelectedTest(test),
      });

      // Trajectory arc if we have distance + bearing
      if (!isNaN(dist) && dist > 0 && test.bearing) {
        const landing = calcLanding(fac, test.bearing, dist);
        arcs.push({
          startLat: fac.lat, startLng: fac.lon,
          endLat: landing.lat, endLng: landing.lon,
          color: color + 'cc', stroke: test.outcome === 'success' ? 0.8 : 0.4,
        });
        // Landing marker
        markers.push({
          lat: landing.lat, lng: landing.lon,
          icon: test.outcome === 'success' ? '💥' : '❌',
          size: 12, color,
          label: `Landing: ${test.date}\n${missiles[test.missile]?.name || test.missile}`,
          onClick: () => setSelectedTest(test),
        });
      }
    });

    globeRef.current.arcsData(arcs).htmlElementsData(markers);
  }, [getFilteredTests, isLoaded, facilities, missiles]);

  const years = [...new Set(tests.map(t => new Date(t.date).getFullYear()))].sort();

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/80 border-b border-red-900/50 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-red-400">🚀 NK MISSILE TESTS</span>
          <span className="text-[9px] font-mono text-red-600">1984–2026</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['all','success','failure','unknown'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono border transition-all ${filter===f?'bg-red-900/50 border-red-500/50 text-red-300':'border-white/10 text-white/30 hover:text-white/60'}`}>
              {f==='all'?`ALL (${stats.total})`:f==='success'?`🚀 ${stats.success}`:f==='failure'?`💀 ${stats.failure}`:`❓ ${stats.unknown}`}
            </button>
          ))}
        </div>
      </div>

      {/* Year timeline */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-black/60 border-b border-white/5 overflow-x-auto z-10">
        <button onClick={() => setSelectedYear(null)}
          className={`px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap ${selectedYear===null?'bg-red-900/50 text-red-300':'text-white/30 hover:text-white/60'}`}>
          ALL
        </button>
        {years.map(y => (
          <button key={y} onClick={() => setSelectedYear(y)}
            className={`px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap ${selectedYear===y?'bg-red-900/50 text-red-300':'text-white/30 hover:text-white/60'}`}>
            {y} ({tests.filter(t => new Date(t.date).getFullYear()===y).length})
          </button>
        ))}
      </div>

      {/* Globe */}
      <div ref={containerRef} className="flex-1" />

      {/* Selected test info */}
      {selectedTest && (
        <div className="absolute bottom-3 left-3 right-3 bg-black/90 border border-red-900/50 rounded-lg p-3 z-20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-red-400">
                  {OUTCOME_ICON[selectedTest.outcome]} {missiles[selectedTest.missile]?.name || selectedTest.missile}
                </span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                  selectedTest.outcome==='success'?'bg-red-900/50 text-red-300':
                  selectedTest.outcome==='failure'?'bg-blue-900/50 text-blue-300':'bg-yellow-900/50 text-yellow-300'
                }`}>{selectedTest.outcome.toUpperCase()}</span>
              </div>
              <div className="text-[9px] font-mono text-white/60 space-y-0.5">
                <div>📅 {selectedTest.date} · {facilities[selectedTest.facility]?.name || selectedTest.facility}</div>
                {selectedTest.distance !== 'unknown' && <div>📏 Distance: {selectedTest.distance} km · Bearing: {selectedTest.bearing}°</div>}
                {selectedTest.apogee !== 'unknown' && <div>📐 Apogee: {selectedTest.apogee} km</div>}
              </div>
            </div>
            <button onClick={() => setSelectedTest(null)} className="text-white/30 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-[11px] font-mono text-red-400 animate-pulse">Loading missile test data...</span>
        </div>
      )}
    </div>
  );
}
