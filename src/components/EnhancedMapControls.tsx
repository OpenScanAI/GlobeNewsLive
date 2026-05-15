'use client';

interface EnhancedMapControlsProps {
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export default function EnhancedMapControls({ activeLayers, onLayerToggle, onZoomIn, onZoomOut, onResetView }: EnhancedMapControlsProps) {
  return null;
}
