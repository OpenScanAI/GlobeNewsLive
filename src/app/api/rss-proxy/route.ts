import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GlobeNews-Live/2.0; +https://globenews.live)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch RSS: ${response.status}` },
        { status: response.status }
      );
    }
    
    const xml = await response.text();
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('RSS proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feed' },
      { status: 500 }
    );
  }
}
