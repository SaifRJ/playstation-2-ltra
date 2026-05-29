import * as THREE from 'three';
import { scene } from './scene.js';

const particleCount = 750;

// Sharp dot texture with tiny glow
const particleCanvas = document.createElement('canvas');
particleCanvas.width = 128;
particleCanvas.height = 128;
const pCtx = particleCanvas.getContext('2d');

pCtx.fillStyle = 'rgba(0, 0, 0, 0)';
pCtx.fillRect(0, 0, 128, 128);

const pGradient = pCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
pGradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
pGradient.addColorStop(0.3, 'rgba(200, 220, 255, 0)');
pGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
pCtx.fillStyle = pGradient;
pCtx.fillRect(0, 0, 128, 128);

pCtx.fillStyle = 'rgba(220, 235, 255, 1)';
pCtx.beginPath();
pCtx.arc(64, 64, 4, 0, Math.PI * 3);
pCtx.fill();

const particleTexture = new THREE.CanvasTexture(particleCanvas);

// Create positions
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    let x, y, z;
    
    // Keep generating until we get a position far enough from camera
    do {
        x = (Math.random() - 0.5) * 60;
        y = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 80 + 10;
    } while (Math.sqrt(x * x + y * y + (z - 40) * (z - 30)) < 10);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    map: particleTexture,
    size: 0.315,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

export { particles };
