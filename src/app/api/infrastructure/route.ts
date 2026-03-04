import { NextResponse } from 'next/server';
import { 
  NUCLEAR_SITES, 
  SPACEPORTS, 
  UNDERSEA_CABLES, 
  PIPELINES, 
  AI_DATA_CENTERS,
  IRAN_TARGETS,
  INFRASTRUCTURE_LAYERS 
} from '@/lib/infrastructure';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer');

  // Return specific layer or all
  if (layer) {
    switch (layer) {
      case 'nuclear':
        return NextResponse.json({ data: NUCLEAR_SITES, layer: 'nuclear' });
      case 'spaceports':
        return NextResponse.json({ data: SPACEPORTS, layer: 'spaceports' });
      case 'cables':
        return NextResponse.json({ data: UNDERSEA_CABLES, layer: 'cables' });
      case 'pipelines':
        return NextResponse.json({ data: PIPELINES, layer: 'pipelines' });
      case 'ai-centers':
        return NextResponse.json({ data: AI_DATA_CENTERS, layer: 'ai-centers' });
      case 'iran':
        return NextResponse.json({ data: IRAN_TARGETS, layer: 'iran' });
      default:
        return NextResponse.json({ error: 'Unknown layer' }, { status: 400 });
    }
  }

  // Return all infrastructure data
  return NextResponse.json({
    layers: INFRASTRUCTURE_LAYERS,
    data: {
      nuclear: NUCLEAR_SITES,
      spaceports: SPACEPORTS,
      cables: UNDERSEA_CABLES,
      pipelines: PIPELINES,
      'ai-centers': AI_DATA_CENTERS,
      iran: IRAN_TARGETS,
    },
    stats: {
      nuclear: NUCLEAR_SITES.length,
      spaceports: SPACEPORTS.length,
      cables: UNDERSEA_CABLES.length,
      pipelines: PIPELINES.length,
      'ai-centers': AI_DATA_CENTERS.length,
      iran: IRAN_TARGETS.length,
    }
  });
}
