import { NextResponse } from 'next/server';

/* CISA Known Exploited Vulnerabilities Catalog
   https://www.cisa.gov/known-exploited-vulnerabilities-catalog
   JSON endpoint: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
*/

interface KevEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  dueDate: string;
  requiredAction: string;
  knownRansomwareCampaignUse?: string;
  notes?: string;
}

interface KevCatalog {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: KevEntry[];
}

export const revalidate = 300; // 5 min

export async function GET() {
  try {
    const res = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      { headers: { 'User-Agent': 'GlobeNewsLive/2.0' }, next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const catalog: KevCatalog = await res.json();

    // Sort by dateAdded descending, take top 15
    const sorted = [...catalog.vulnerabilities].sort(
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );

    return NextResponse.json({
      title: catalog.title,
      version: catalog.catalogVersion,
      dateReleased: catalog.dateReleased,
      totalCount: catalog.count,
      vulnerabilities: sorted.slice(0, 15),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CISA KEV API Error]', error);
    return NextResponse.json(
      { title: 'CISA KEV', totalCount: 0, vulnerabilities: [], error: String(error), updatedAt: new Date().toISOString() },
      { status: 502 }
    );
  }
}
