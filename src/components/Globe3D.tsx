'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MissileEvent {
  id: string;
  type: string;
  origin: string;
  target: string;
  originLat: number;
  originLon: number;
  targetLat: number;
  targetLon: number;
  status: 'active' | 'intercepted' | 'landed';
  timeAgo: string;
  speed: number;
  altitude: number;
}

interface Globe3DProps {
  missiles: MissileEvent[];
  view: string;
}

const EARTH_RADIUS = 2;
const ATMOSPHERE_RADIUS = 2.08;

const MISSILE_COLORS: Record<string, string> = {
  ICBM: '#1F77B4',
  MRBM: '#FF7F0E',
  SRBM: '#2CA02C',
  HYPERSONIC: '#D62728',
  CRUISE: '#9467BD',
  AIRSTRIKE: '#8C564B',
  ARTILLERY: '#E377C2',
};

const STATUS_COLORS: Record<string, THREE.Color> = {
  active: new THREE.Color('#ff2244'),
  intercepted: new THREE.Color('#00ff88'),
  landed: new THREE.Color('#666666'),
};

// Lat/lon to 3D position on sphere surface
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Create arc points between two surface points
function createArcPoints(start: THREE.Vector3, end: THREE.Vector3, segments = 64): THREE.Vector3[] {
  const startN = start.clone().normalize();
  const endN = end.clone().normalize();
  const angle = startN.angleTo(endN);
  const height = Math.min(angle * 0.5, 0.8);
  const mid = startN.clone().add(endN).normalize().multiplyScalar(EARTH_RADIUS + height);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

// ========== ATMOSPHERE SHADER ==========
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
    float intensity = fresnel * 1.2;
    vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
    gl_FragColor = vec4(atmosphereColor, intensity * 0.6);
  }
`;

// ========== EARTH COMPONENT ==========
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Procedural dark earth texture using canvas
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark ocean base
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, 1024, 512);

    // Simple continent shapes (very rough approximation for dark earth)
    ctx.fillStyle = '#1a2f1a';
    // North America
    ctx.beginPath();
    ctx.ellipse(180, 160, 80, 60, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // South America
    ctx.beginPath();
    ctx.ellipse(240, 320, 40, 80, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Europe
    ctx.beginPath();
    ctx.ellipse(500, 140, 50, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Africa
    ctx.beginPath();
    ctx.ellipse(520, 260, 55, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    // Asia
    ctx.beginPath();
    ctx.ellipse(700, 150, 120, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    // Australia
    ctx.beginPath();
    ctx.ellipse(820, 360, 50, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle noise
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(100, 140, 180, ${Math.random() * 0.08})`;
      ctx.fillRect(x, y, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Night lights texture (cities glow)
  const nightTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 512);

    // City lights at major coordinates
    const cities = [
      [39.9, 116.4], [35.7, 139.7], [28.6, 77.2], [19.1, 72.9], [1.4, 103.8],
      [55.8, 37.6], [51.5, -0.1], [48.9, 2.3], [52.5, 13.4], [40.7, -74.0],
      [34.1, -118.2], [41.9, -87.6], [25.8, -80.2], [-23.5, -46.6], [-34.6, -58.4],
      [30.0, 31.2], [33.3, 44.4], [24.7, 46.7], [32.1, 34.8], [37.6, 127.0],
    ];
    cities.forEach(([lat, lon]) => {
      const x = ((lon + 180) / 360) * 1024;
      const y = ((90 - lat) / 180) * 512;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grad.addColorStop(0, 'rgba(255, 220, 120, 0.8)');
      grad.addColorStop(1, 'rgba(255, 180, 60, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 8, y - 8, 16, 16);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={earthTexture}
        emissiveMap={nightTexture}
        emissive={new THREE.Color('#ffcc66')}
        emissiveIntensity={0.4}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

// ========== ATMOSPHERE COMPONENT ==========
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE_RADIUS, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ========== LAT/LON GRID ==========
function GridLines() {
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 5) {
        pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
        pts.push(latLonToVector3(lat, lon + 5, EARTH_RADIUS * 1.002));
      }
    }
    // Longitude lines
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -90; lat < 90; lat += 5) {
        pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
        pts.push(latLonToVector3(lat + 5, lon, EARTH_RADIUS * 1.002));
      }
    }
    return pts;
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(lines.flatMap((v) => [v.x, v.y, v.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#1a3a5c" transparent opacity={0.15} />
    </lineSegments>
  );
}

// ========== MARKER ==========
function Marker({ lat, lon, color, size = 0.025 }: { lat: number; lon: number; color: string; size?: number }) {
  const pos = useMemo(() => latLonToVector3(lat, lon, EARTH_RADIUS * 1.01), [lat, lon]);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ========== PULSING RING ==========
function PulseRing({ lat, lon, color }: { lat: number; lon: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLonToVector3(lat, lon, EARTH_RADIUS * 1.01), [lat, lon]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 3) * 0.3;
    meshRef.current.scale.set(scale, scale, scale);
    meshRef.current.lookAt(0, 0, 0);
  });

  return (
    <mesh ref={meshRef} position={pos}>
      <ringGeometry args={[0.03, 0.04, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ========== MISSILE ARC ==========
function MissileArc({
  originLat,
  originLon,
  targetLat,
  targetLon,
  color,
  status,
}: {
  originLat: number;
  originLon: number;
  targetLat: number;
  targetLon: number;
  color: string;
  status: string;
}) {
  const headRef = useRef<THREE.Mesh>(null);
  const lineObj = useRef<THREE.Line>(null);

  const { points, origin } = useMemo(() => {
    const o = latLonToVector3(originLat, originLon, EARTH_RADIUS * 1.015);
    const t = latLonToVector3(targetLat, targetLon, EARTH_RADIUS * 1.015);
    const pts = createArcPoints(o, t);
    return { points: pts, origin: o };
  }, [originLat, originLon, targetLat, targetLon]);

  const linePrimitive = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: status === 'intercepted' ? '#00ff88' : color,
      transparent: true,
      opacity: status === 'intercepted' ? 0.3 : 0.7,
    });
    return new THREE.Line(geo, mat);
  }, [points, color, status]);

  // Animate missile head along arc
  useFrame(({ clock }) => {
    if (status !== 'active' || !headRef.current) return;
    const t = (clock.getElapsedTime() * 0.15) % 1;
    const idx = Math.floor(t * (points.length - 1));
    const pt = points[Math.min(idx, points.length - 1)];
    headRef.current.position.copy(pt);
  });

  return (
    <group>
      <primitive object={linePrimitive} />
      {status === 'active' && (
        <mesh ref={headRef} position={origin}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
}

// ========== CAMERA CONTROLLER ==========
function CameraController({ view }: { view: string }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetPositions: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
    global: { pos: [0, 3, 6], target: [0, 0, 0] },
    ukraine: { pos: [3.5, 2.5, 4], target: [0.5, 1.2, 0.3] },
    middleeast: { pos: [2, 1.5, 5], target: [0.3, 0.8, 0.2] },
    asia: { pos: [-2, 2, 5], target: [-0.5, 1, 0.2] },
  };

  useEffect(() => {
    const t = targetPositions[view] || targetPositions.global;
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...t.pos);
      controlsRef.current.target.set(...t.target);
      controlsRef.current.update();
    }
  }, [view]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={3}
      maxDistance={12}
      autoRotate
      autoRotateSpeed={0.4}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ========== SCENE ==========
function Scene({ missiles, view }: { missiles: MissileEvent[]; view: string }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={0.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.2} color="#4488ff" />

      <Earth />
      <Atmosphere />
      <GridLines />
      <Stars radius={50} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

      {/* Missile markers and arcs */}
      {missiles.map((m) => {
        const color = MISSILE_COLORS[m.type] || '#ffaa00';
        const statusColor = STATUS_COLORS[m.status]?.getHexString() || 'ffaa00';

        return (
          <group key={m.id}>
            <Marker lat={m.originLat} lon={m.originLon} color={`#${statusColor}`} size={0.035} />
            <Marker lat={m.targetLat} lon={m.targetLon} color={color} size={0.025} />
            {m.status === 'active' && (
              <PulseRing lat={m.originLat} lon={m.originLon} color={`#${statusColor}`} />
            )}
            <MissileArc
              originLat={m.originLat}
              originLon={m.originLon}
              targetLat={m.targetLat}
              targetLon={m.targetLon}
              color={color}
              status={m.status}
            />
          </group>
        );
      })}

      {/* Additional conflict zone markers */}
      <Marker lat={50.45} lon={30.52} color="#ff2244" size={0.03} />
      <Marker lat={31.5} lon={34.8} color="#ff2244" size={0.03} />
      <Marker lat={33.3} lon={44.4} color="#ff6600" size={0.03} />
      <Marker lat={15.4} lon={44.2} color="#ff6600" size={0.03} />
      <Marker lat={15} lon={30} color="#ffaa00" size={0.025} />
      <Marker lat={-1.5} lon={30} color="#ffaa00" size={0.025} />
      <Marker lat={19.4} lon={-72.3} color="#ffaa00" size={0.025} />
      <Marker lat={21.0} lon={105.8} color="#ffaa00" size={0.025} />

      <CameraController view={view} />
    </>
  );
}

// ========== MAIN EXPORT ==========
export default function Globe3D({ missiles, view }: Globe3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl animate-pulse mb-2">🌍</div>
          <div className="text-[10px] text-text-muted font-mono">Loading globe...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 3, 6], fov: 45 }}>
        <Scene missiles={missiles} view={view} />
      </Canvas>
    </div>
  );
}
