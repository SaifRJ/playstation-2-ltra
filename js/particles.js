import * as THREE from 'three';
import { scene } from './scene.js';

const particleCount = 750;

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

// const Z_BANDS = [
// { zMin:  18, zMax:  25, fraction: 0.40 }, 
// { zMin:   5, zMax:  18, fraction: 0.25 }, 
// { zMin: -10, zMax:   5, fraction: 0.20 },  
// { zMin: -30, zMax: -10, fraction: 0.15 },
// ];

const Z_BANDS = [
    { zMin: -12, zMax:  -5, fraction: 0.40 },  
    { zMin: -25, zMax: -12, fraction: 0.25 }, 
    { zMin: -40, zMax: -25, fraction: 0.20 },   
    { zMin: -60, zMax: -40, fraction: 0.15 },   
];

const positions = new Float32Array(particleCount * 3);
let idx = 0;

Z_BANDS.forEach(band => {
    const count = Math.floor(particleCount * band.fraction);
    for (let i = 0; i < count; i++) {
        let x, y, z;
        do {
            x = (Math.random() - 0.5) * 60;
            y = (Math.random() - 0.5) * 40;
            z = band.zMin + Math.random() * (band.zMax - band.zMin);
        } while (Math.sqrt(x * x + y * y + (z - 40) * (z - 30)) < 5);

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;
        idx++;
    }
});

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    map: particleTexture,
    size: 0.3,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

export { particles };
