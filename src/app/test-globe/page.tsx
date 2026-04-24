'use client';

import { Canvas } from '@react-three/fiber';

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

export default function TestGlobe() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <Box />
      </Canvas>
    </div>
  );
}
