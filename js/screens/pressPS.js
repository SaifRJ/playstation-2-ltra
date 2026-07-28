import gsap from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Screen } from '../ui/Screen.js';
import { screenManager } from '../screens/screenManager.js';
import { camera, scene } from '../scene.js';
import { playSound } from '../audio.js';
import { fadeFromBlack, fadeToBlack } from '../ui/screenEffects.js';


const loader = new GLTFLoader();
let psLogoMesh = null;

function loadPSLogo() {
    return new Promise((resolve, reject) => {
        loader.load(
            'assets/models/PS logo/pslogo.gltf',
            (gltf) => resolve(gltf.scene),
            undefined,
            (err) => reject(err)
        );
    });
}
loadPSLogo().then(model => {

    psLogoMesh = model;
    
    psLogoMesh.traverse(child => {
        if (child.isMesh && child.material) {
            child.material.emissive = child.material.color.clone();
            child.material.emissiveIntensity = 2.5;
            child.material.toneMapped = false;
        }
    });
    
    psLogoMesh.position.set(0, -1.9, -30);
    psLogoMesh.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);
    psLogoMesh.scale.setScalar(0.33);
    psLogoMesh.visible = true;
    scene.add(psLogoMesh);
});

const pressPSScreen = new Screen({
    name: 'press-ps',
    domEl: document.getElementById('screen-press-ps'),
    items: [],
    parent: null,

    onEnter: async (screen) => {

        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.remove('exit');
    },

    onExit: async (screen) => {
        // fade the prompt text via CSS class
        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.add('exit');
        if (psLogoMesh) psLogoMesh.visible = false;

        await Promise.all([
            gsap.to(camera.position, {
                z: -15,
                duration: 2.8,
                ease: "power2.inOut"
            }),
            gsap.to(camera.rotation, {
                z: 0.4,
                duration: 2.8,
                ease: "power2.inOut"
            })
        ]);
    },

    onConfirm: () => {
        playSound('confirm', 0.5);
        screenManager.transitionTo('account-select');
    },

    onPSButton: () => {
        playSound('confirm', 0.5);
        screenManager.transitionTo('account-select');
    }
});

screenManager.register('press-ps', pressPSScreen);

export { pressPSScreen };