import * as THREE from 'three';
import { scene } from './scene.js';


// tested seeds for fog I believe look the best
// const SEEDS = [17072005, 42, 137, 9001, 2024, 808];
// const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];

// function seededRandom(seed) {
//     return function() {
//         seed = (seed + 0x6D2B79F5) | 0;
//         let t = seed;
//         t = Math.imul(t ^ (t >>> 15), t | 1);
//         t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
//         return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//     };
// }

// const random = seededRandom(SEEDS[0]);

const fogParticles = [];

function makeFogTexture(bright = false) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  const core = bright ? [20, 40, 100] : [8, 20, 60];
  const edge = bright ? [10, 25, 70]  : [5, 15, 45];

  const blobs = 14;
  for (let i = 0; i < blobs; i++) {

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * size * 0.22;     
    const bx = size/2 + Math.cos(angle) * dist;
    const by = size/2 + Math.sin(angle) * dist;
    const r = size * (0.12 + Math.random() * 0.18);

    const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
    const a = 0.06 + Math.random() * 0.06;        
    g.addColorStop(0,   `rgba(${core[0]}, ${core[1]}, ${core[2]}, ${a})`);
    g.addColorStop(0.5, `rgba(${edge[0]}, ${edge[1]}, ${edge[2]}, ${a * 0.4})`);
    g.addColorStop(1,   `rgba(${edge[0]}, ${edge[1]}, ${edge[2]}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

const fogTexture = makeFogTexture(false);
const brightFogTexture = makeFogTexture(true);

const FOG_LAYERS = [

    // layer 1 - haze
    {count: 200, zMin: 20, zMax: -30, spreadX: 100,  spreadY: 70, scaleMin: 8,  scaleMax: 40, opacityMin: 0.1,  opacityMax: 0.2,  bright: false, 
    waveAmp: 0.5, waveDir: [1, 0], waveSpeed: 0.0001},

    // layer 2 - fog
    {count: 250,  zMin: -50, zMax: -25, spreadX: 120, spreadY: 70, scaleMin: 20, scaleMax: 50, opacityMin: 0.2, opacityMax: 0.25, bright: false, 
    waveAmp: 3.5, waveDir: [1, 0], waveSpeed: 0.0003},

    // layer 3 - horizon
    {count: 250,  zMin: -50, zMax: -25, spreadX: 120, spreadY: 70, scaleMin: 20, scaleMax: 53.5, opacityMin: 0.3, opacityMax: 0.85, bright: false, 
    waveAmp: 2.0, waveDir: [0, 0], waveSpeed: 0.0001},

    // {count: 250,  zMin: -100, zMax: -50, spreadX: 120, spreadY: 70, scaleMin: 20, scaleMax: 50, opacityMin: 0.3, opacityMax: 0.8, bright: false, 
    // waveAmp: 2.0, waveDir: [0, 0], waveSpeed: 0.0001},

];

FOG_LAYERS.forEach((layer, layerIndex) => {
  const texture = layer.bright ? brightFogTexture : fogTexture;

  for (let i = 0; i < layer.count; i++) {
    const x = (Math.random() - 0.5) * layer.spreadX;
    const y = (Math.random() - 0.5) * layer.spreadY;
    const z = layer.zMin + Math.random() * (layer.zMax - layer.zMin);
    const scale = layer.scaleMin + Math.random() * (layer.scaleMax - layer.scaleMin);
    const opacity = layer.opacityMin + Math.random() * (layer.opacityMax - layer.opacityMin);

    const fogMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });

    const sprite = new THREE.Sprite(fogMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);
    sprite.userData = {
      baseX: x,
      baseY: y,
      layerIndex,                                
      driftSpeed: 0.01 + Math.random() * 0.000006,
      driftAmount: 0.01 + Math.random() * 0.000006,
      rotSpeed: (Math.random() - 0.5) * 0.00008,
      waveAmp: layer.waveAmp,
      waveDirX: layer.waveDir[0],
      waveDirY: layer.waveDir[1],
      waveSpeed: layer.waveSpeed,
      wavePhase: (x + y) * 0.1
    };

    fogParticles.push(sprite);
    scene.add(sprite);
  }
});

export { fogParticles };