"use client";

import { Html, PresentationControls, useProgress } from "@react-three/drei";
import Model from "./Model";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-white">
      {progress} % loaded
    </Html>
  );
}

export default function Experience() {
  return (
    <>
      <Canvas
        className="w-1/2"
        camera={{
          fov: 45,
          near: 0.1,
          far: 10,
          position: [-4, 3, 6],
        }}
      >
        <directionalLight position={[1, 2, 3]} intensity={1.5} />
        <ambientLight intensity={0.5} />

        <PresentationControls
          global
          rotation={[-0.13, -0.3, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 1]}
          config={{ mass: 2, tension: 100 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <Suspense fallback={<Loader />}>
            <Model scale={8} />
          </Suspense>
        </PresentationControls>
      </Canvas>
    </>
  );
}
