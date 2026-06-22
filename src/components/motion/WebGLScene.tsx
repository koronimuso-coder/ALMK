'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from './MotionProvider';
import WebGLFallback from './WebGLFallback';

export const WebGLScene: React.FC = () => {
  const { quality, isWebGLSupported } = useMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (quality === 'ESSENTIAL' || !isWebGLSupported || !canvasRef.current) return;

    let active = true;
    let renderer: any;
    let scene: any;
    let camera: any;
    let frameId: number;

    const meshes: any[] = [];
    let particles: any;
    let centerMesh: any;
    let originalVertices: any;
    
    // Mouse coordinates for parallax tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic import of Three.js to keep bundle lightweight
    import('three').then((THREE) => {
      if (!active || !canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || window.innerWidth;
      const height = containerRef.current.clientHeight || window.innerHeight;

      try {
        // 1. Scene setup
        scene = new THREE.Scene();

        // 2. Camera setup
        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 16;

        // 3. Renderer setup
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        // 4. Lights (Realistic shading)
        const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xc29b68, 2.5);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const centerPointLight = new THREE.PointLight(0xd9b48f, 3, 20);
        centerPointLight.position.set(0, 0, 0);
        scene.add(centerPointLight);

        // 5. Morphing Secure Core (Deforming Wireframe Sphere)
        const centerGeom = new THREE.IcosahedronGeometry(1.8, 2);
        // Clone original position attribute to deform from it
        originalVertices = centerGeom.attributes.position.clone();

        const centerMat = new THREE.MeshStandardMaterial({
          color: 0xc29b68,
          wireframe: true,
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0xc29b68,
          emissiveIntensity: 0.2,
        });
        centerMesh = new THREE.Mesh(centerGeom, centerMat);
        scene.add(centerMesh);
        meshes.push(centerMesh);

        // 6. Orbital Torus Rings (Identity, Payment, and Network Layers)
        // Ring 1 (Identity Layer - Blue)
        const torus1Geom = new THREE.TorusGeometry(3.5, 0.04, 8, 64);
        const torus1Mat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.4,
        });
        const ring1 = new THREE.Mesh(torus1Geom, torus1Mat);
        ring1.rotation.x = Math.PI / 3;
        scene.add(ring1);
        meshes.push(ring1);

        // Ring 2 (Payment Layer - Gold)
        const torus2Geom = new THREE.TorusGeometry(4.6, 0.04, 8, 64);
        const torus2Mat = new THREE.MeshStandardMaterial({
          color: 0xc29b68,
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0xc29b68,
          emissiveIntensity: 0.3,
        });
        const ring2 = new THREE.Mesh(torus2Geom, torus2Mat);
        ring2.rotation.y = Math.PI / 4;
        scene.add(ring2);
        meshes.push(ring2);

        // Ring 3 (Network Layer - Green)
        const torus3Geom = new THREE.TorusGeometry(5.8, 0.04, 8, 64);
        const torus3Mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x10b981,
          emissiveIntensity: 0.3,
        });
        const ring3 = new THREE.Mesh(torus3Geom, torus3Mat);
        ring3.rotation.x = -Math.PI / 4;
        scene.add(ring3);
        meshes.push(ring3);

        // 7. Transaction Data Stream Particles
        // Quality scaling
        const partCount = quality === 'BALANCED' ? 60 : 150;
        const partGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(partCount * 3);
        const colors = new Float32Array(partCount * 3);

        // Curated transaction color palette (Gold, Blue, Green)
        const palette = [
          new THREE.Color(0xc29b68), // Gold
          new THREE.Color(0x3b82f6), // Blue
          new THREE.Color(0x10b981), // Green
        ];

        for (let i = 0; i < partCount; i++) {
          const angle = (i / partCount) * Math.PI * 2;
          const radius = 6.5 + Math.random() * 2.5;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

          const color = palette[i % palette.length];
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }

        partGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        partGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const partMat = new THREE.PointsMaterial({
          size: 0.09,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
        });
        particles = new THREE.Points(partGeom, partMat);
        scene.add(particles);

        // 8. Animation loop
        const animate = () => {
          if (!active) return;

          const time = performance.now() * 0.001;

          // Deform center core (Morphing organic shape)
          const pos = centerMesh.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const ox = originalVertices.getX(i);
            const oy = originalVertices.getY(i);
            const oz = originalVertices.getZ(i);

            // Calculate mathematical displacement noise
            const noise = Math.sin(ox * 2 + time * 1.5) * Math.cos(oy * 2 + time * 1.5) * 0.18;
            pos.setXYZ(i, ox + ox * noise, oy + oy * noise, oz + oz * noise);
          }
          pos.needsUpdate = true;

          // Pulse center light intensity
          centerPointLight.intensity = 3 + Math.sin(time * 3) * 1.2;

          // Orbital rotations
          centerMesh.rotation.y += 0.004;
          centerMesh.rotation.x += 0.002;
          ring1.rotation.z += 0.005;
          ring2.rotation.z -= 0.003;
          ring3.rotation.z += 0.002;

          // Wave motion on particles
          const posArr = particles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < partCount; i++) {
            // Flow along the circle
            posArr[i * 3 + 2] = Math.sin(time * 1.2 + i * 0.1) * 0.8;
          }
          particles.geometry.attributes.position.needsUpdate = true;

          // Smooth mouse tilt parallax
          mouse.x += (mouse.targetX - mouse.x) * 0.06;
          mouse.y += (mouse.targetY - mouse.y) * 0.06;

          if (camera) {
            camera.position.x += (mouse.x * 4.5 - camera.position.x) * 0.08;
            camera.position.y += (mouse.y * 4.5 - camera.position.y) * 0.08;
            camera.lookAt(scene.position);
          }

          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };

        animate();

        // Resize Listener
        const onResize = () => {
          if (!containerRef.current || !active) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        window.addEventListener('resize', onResize);

        // Scroll influence (scale orbits out)
        const onScroll = () => {
          if (!active) return;
          const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          ring1.scale.setScalar(1 + scrollPct * 0.4);
          ring2.scale.setScalar(1 + scrollPct * 0.7);
          ring3.scale.setScalar(1 + scrollPct * 1.1);
        };

        window.addEventListener('scroll', onScroll);

      } catch (err) {
        console.error('Three.js setup failed', err);
        setLoadFailed(true);
      }
    });

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [quality, isWebGLSupported]);

  if (quality === 'ESSENTIAL' || !isWebGLSupported || loadFailed) {
    return <WebGLFallback />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

export default WebGLScene;
