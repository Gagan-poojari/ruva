"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/models/saree-model.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <primitive object={clonedScene} scale={2} position={[0, -1.5, 0]} />
  );
}

function ContextLossGuard({ onContextLost }) {
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return undefined;

    const handleContextLost = (event) => {
      event.preventDefault();
      onContextLost();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    };
  }, [onContextLost]);

  return null;
}

export default function SareeModel3D() {
  const [contextLost, setContextLost] = useState(false);

  if (contextLost) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center px-4">
        <p className="text-sm text-white/70">
          3D preview unavailable on this device right now.
        </p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 1.25]}
      gl={{
        antialias: false,
        powerPreference: "default",
        toneMappingExposure: 1,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <ContextLossGuard onContextLost={() => setContextLost(true)} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 5, 2]} intensity={1.5} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

useGLTF.preload("/models/saree-model.glb");