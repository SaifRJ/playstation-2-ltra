import * as THREE from 'three';
import { scene } from './scene.js';

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
    {count: 200, zMin: -30, zMax: 15, spreadX: 100,  spreadY: 70, scaleMin: 8,  scaleMax: 40, opacityMin: 0.1,  opacityMax: 0.15,  bright: true  },

    // layer 2 - horizon
    {count: 350,  zMin: -25, zMax: -50, spreadX: 100, spreadY: 70, scaleMin: 20, scaleMax: 90, opacityMin: 0.1, opacityMax: 0.2, bright: false },

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
      driftSpeed: 0.00005 + Math.random() * 0.00012,
      driftAmount: 3.5 + Math.random() * 3,
      rotSpeed: (Math.random() - 0.5) * 0.00008
    };
    fogParticles.push(sprite);
    scene.add(sprite);
  }
});

export { fogParticles };