"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Clone } from "@react-three/drei";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/models/saree-model.glb");

  // Using <Clone> instead of <primitive> protects the scene from 
  // being destroyed during React StrictMode hot-reloads!
  return (
    <Clone 
      object={scene} 
      scale={2} 
      position={[0, -1.5, 0]} 
    />
  );
}

export default function SareeModel3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      // CRITICAL PERFORMANCE FIX: Cap the pixel ratio to 1.5 max 
      // otherwise Retina screens will exhaust the GPU Memory instantly!
      dpr={[1, 1.5]}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance" // Hints browser to use Dedicated GPU GPU if available
      }}
    >
      {/* 
        A lower resolution environment prevents VRAM exhaustion
        while still providing the high quality reflections needed for silk/gold
      */}
      <Environment preset="city" resolution={256} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 5, 2]} intensity={1.5} />

      <Model />

      {/* 
        CRITICAL SHADOW FIX: `frames={1}` forces the shadow to render 
        only ONCE on load, instead of 60 times a second. 
        This is the #1 cause of WebGL Context Loss in R3F!
      */}
      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.45} 
        scale={5} 
        blur={1.5} 
        far={4} 
        color="#1a050d" 
        frames={1}          // <--- Magic fix for the crashing!
        resolution={256}    // <--- Keeps shadow VRAM footprint tiny
      />

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}