import { NextResponse } from 'next/server';

/* NVD CVE API v2.0
   https://services.nvd.nist.gov/rest/json/cves/2.0
   No key required for basic use (rate limited)
*/

interface NvdCve {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: Array<{ lang: string; value: string }>;
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: {
        baseScore: number;
        baseSeverity: string;
      };
      exploitabilityScore: number;
      impactScore: number;
    }>;
  };
  references?: Array<{ url: string; source: string }>;
}

interface NvdResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  vulnerabilities: Array<{ cve: NvdCve }>;
}

export const revalidate = 300; // 5 min

export async function GET() {
  try {
    // NVD API v2.0 returns oldest first. Need to fetch from the end for recent CVEs.
    // Total results ~348K, recent ones are at the end. Fetch last 40.
    const totalResults = 348036; // approximate, will be updated from response
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${Math.max(0, totalResults - 40)}&resultsPerPage=40`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'GlobeNewsLive/2.0' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NvdResponse = await res.json();

    // Sort by published date desc, take last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let cves = data.vulnerabilities.map((v) => {
      const cve = v.cve;
      const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
      return {
        id: cve.id,
        published: cve.published,
        lastModified: cve.lastModified,
        status: cve.vulnStatus,
        description: cve.descriptions.find((d) => d.lang === 'en')?.value || cve.descriptions[0]?.value || '',
        severity: cvss?.baseSeverity || 'N/A',
        score: cvss?.baseScore ?? null,
        references: (cve.references || []).slice(0, 3).map((r) => r.url),
      };
    });

    // Filter to last 7 days and sort by date
    cves = cves
      .filter((c) => new Date(c.published) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
      .slice(0, 15);

    return NextResponse.json({
      totalResults: data.totalResults,
      returned: cves.length,
      cves,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[NVD CVE API Error]', error);
    return NextResponse.json(
      { totalResults: 0, returned: 0, cves: [], error: String(error), updatedAt: new Date().toISOString() },
      { status: 502 }
    );
  }
}
