import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

/**
 * Model — carrega o .glb e controla play/pause/repeat via props.
 * @param {string}  modelPath  - caminho do arquivo .glb
 * @param {boolean} paused     - se true, pausa o mixer Three.js
 * @param {number}  repeatKey  - incrementar este valor dispara um restart
 */
function Model({ modelPath, paused, repeatKey }) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, group);

  // Inicia a animação quando o modelo é carregado
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const action = actions[Object.keys(actions)[0]];
      if (action) {
        action.reset().fadeIn(0.2).play();
      }
    }
    return () => {
      if (actions) {
        Object.values(actions).forEach((a) => a?.stop());
      }
    };
  }, [actions, modelPath]);

  // Controla pause / resume no mixer
  useEffect(() => {
    if (!mixer) return;
    mixer.timeScale = paused ? 0 : 1;
  }, [paused, mixer]);

  // Reinicia a animação quando repeatKey muda
  useEffect(() => {
    if (!actions) return;
    const action = actions[Object.keys(actions)[0]];
    if (action) {
      action.reset().play();
    }
  }, [repeatKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group ref={group}>
      <primitive object={scene} scale={0.6} position={[0, -1.8, 0]} />
    </group>
  );
}

/**
 * RobotViewer — renderiza o Canvas com o modelo 3D.
 * @param {string}  modelPath  - caminho do arquivo .glb
 * @param {boolean} paused     - pausa a animação
 * @param {number}  repeatKey  - incrementar reinicia a animação
 */
export default function RobotViewer({ modelPath, paused = false, repeatKey = 0 }) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        {/*
          key={modelPath} garante que o Model é destruído e recriado
          ao trocar de sinal, carregando o novo .glb limpo.
        */}
        <React.Suspense fallback={null}>
          <Model
            key={modelPath}
            modelPath={modelPath}
            paused={paused}
            repeatKey={repeatKey}
          />
        </React.Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

// Pré-carrega todos os arquivos para garantir transições suaves
useGLTF.preload('/models/oi_tchau.glb');
useGLTF.preload('/models/ola.glb');
useGLTF.preload('/models/bom_dia.glb');
useGLTF.preload('/models/boa_tarde.glb');
useGLTF.preload('/models/boa_noite.glb');