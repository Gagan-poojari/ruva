"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

function Model({ scrollY }) {
  const { scene } = useGLTF("/models/saree-model.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const ref = useRef();

  // store previous scroll to detect direction
  const prevScroll = useRef(0);

  useFrame(() => {
    if (!ref.current) return;

    const delta = scrollY - prevScroll.current;

    // rotation (clockwise / counterclockwise)
    ref.current.rotation.y += delta * 0.002;

    // subtle tilt for richness
    ref.current.rotation.x = Math.sin(scrollY * 0.002) * 0.1;

    prevScroll.current = scrollY;
  });

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={2}
      position={[0, -0.5, 0]} // position is the position of the model in the 3D space (x, y, z)
    />
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

export default function SareeModel3D({ scrollY }) {
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
      camera={{ position: [0, 0, 5], fov: 40 }} // fov is the field of view, which is the angle of the camera
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        touchAction: "pan-y",
      }} // keep canvas touch-passive so mobile scroll works
      dpr={[1, 1.25]} // dpr is the device pixel ratio, which is the ratio of the number of pixels on the screen to the number of pixels in the image
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
        <Model scrollY={scrollY}/>
      </Suspense>

    </Canvas>
  );
}

useGLTF.preload("/models/saree-model.glb");