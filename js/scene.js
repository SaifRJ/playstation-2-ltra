import * as THREE from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


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
camera.position.set(0, 0, 0);
camera.rotation.set(0, 0, 0)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));


const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// FXAA Antialiasing
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms['resolution'].value.set(
    1 / (window.innerWidth * renderer.getPixelRatio()),
    1 / (window.innerHeight * renderer.getPixelRatio())
);
composer.addPass(fxaaPass);

// Blooming
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25,
    2.5,
    0.2
);
composer.addPass(bloomPass);

// Handles resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    
    // update FXAA resolution
    fxaaPass.material.uniforms['resolution'].value.set(
        1 / (window.innerWidth * renderer.getPixelRatio()),
        1 / (window.innerHeight * renderer.getPixelRatio())
    );
});

export { scene, camera, renderer, composer };
