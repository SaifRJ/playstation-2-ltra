import { scene } from './scene.js';

// === VOLUMETRIC FOG ===
const fogParticles = [];

const fogCanvas = document.createElement('canvas');
fogCanvas.width = 512;
fogCanvas.height = 512;
const fogCtx = fogCanvas.getContext('2d');

const gradient = fogCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
gradient.addColorStop(0, 'rgba(8, 20, 60, 0.5)');
gradient.addColorStop(0.3, 'rgba(8, 20, 60, 0.25)');
gradient.addColorStop(0.6, 'rgba(5, 15, 45, 0.1)');
gradient.addColorStop(1, 'rgba(5, 15, 45, 0)');
fogCtx.fillStyle = gradient;
fogCtx.fillRect(0, 0, 512, 512);

const fogTexture = new THREE.CanvasTexture(fogCanvas);

// Brighter texture for sprites near the light
const brightFogCanvas = document.createElement('canvas');
brightFogCanvas.width = 512;
brightFogCanvas.height = 512;
const brightFogCtx = brightFogCanvas.getContext('2d');

const brightGradient = brightFogCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
brightGradient.addColorStop(0, 'rgba(20, 40, 100, 0.6)');
brightGradient.addColorStop(0.2, 'rgba(15, 35, 90, 0.35)');
brightGradient.addColorStop(0.5, 'rgba(10, 25, 70, 0.1)');
brightGradient.addColorStop(1, 'rgba(5, 15, 45, 0)');
brightFogCtx.fillStyle = brightGradient;
brightFogCtx.fillRect(0, 0, 512, 512);

const brightFogTexture = new THREE.CanvasTexture(brightFogCanvas);

for (let i = 0; i < 375; i++) {
    // Cluster most sprites near the light source at (0, 0, -20)
    // Using gaussian-like distribution: closer to center = more likely
    const spread = Math.random();
    const isNearCenter = spread < 0.6;

    let x, y, z, scale, opacity, texture;

    if (isNearCenter) {
        // Dense cluster near the light
        x = (Math.random() - 0.5) * 45;
        y = (Math.random() - 0.5) * 35;
        z = -20 + (Math.random() - 0.5) * 25;
        scale = 8 + Math.random() * 20;
        opacity = 0.08 + Math.random() * 0.14;
        texture = brightFogTexture;
    } else {
        // Sparse, larger wisps further out
        x = (Math.random() - 0.5) * 80;
        y = (Math.random() - 0.5) * 50;
        z = (Math.random() - 0.5) * 80 - 10;
        scale = 25 + Math.random() * 40;
        opacity = 0.04 + Math.random() * 0.08;
        texture = fogTexture;
    }

    
    const fogMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(fogMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);

    sprite.userData = {
        baseX: sprite.position.x,
        baseY: sprite.position.y,
        driftSpeed: 0.00005 + Math.random() * 0.00012,
        driftAmount: 1.5 + Math.random() * 3,
        rotSpeed: (Math.random() - 0.5) * 0.00008
    };

    fogParticles.push(sprite);
    scene.add(sprite);
}

export { fogParticles };