"use client";
import { Clone, useGLTF } from "@react-three/drei";

interface ModelProps {
  scale: number;
}

export default function Model({ scale }: ModelProps) {
  const model = useGLTF("3dmodels/marble_bust_01_1k.gltf/modelDraco.gltf");
  return <Clone object={model.scene} scale={scale} position-y={-2} />;
}

useGLTF.preload("3dmodels/marble_bust_01_1k.gltf/modelDraco.gltf");
