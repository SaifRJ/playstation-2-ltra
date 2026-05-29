import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020510, 0.015);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 30);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25, // glow strength
    2.5, // glow radius
    0.2 // glow threshold
);
composer.addPass(bloomPass);

// CSS2D LabelRenderer
// const labelRenderer = new CSS2DRenderer();
// labelRenderer.setSize(window.innerWidth, window.innerHeight);
// labelRenderer.domElement.style.position = 'fixed';
// labelRenderer.domElement.style.top = '0';
// labelRenderer.domElement.style.left = '0';
// labelRenderer.domElement.style.pointerEvents = 'none';
// labelRenderer.domElement.style.zIndex = '1';
// document.body.appendChild(labelRenderer.domElement);


// Handles resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

export { scene, camera, renderer, composer };
