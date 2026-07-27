import * as THREE from 'three';
import gsap from 'gsap';

import { scene } from '../scene.js';
import { Screen } from '../ui/Screen.js';
import { screenManager } from './screenManager.js';
import { camera } from '../scene.js';
import { fadeFromBlack } from '../ui/screenEffects.js';
import { playSound } from '../audio.js';
import { createShape } from '../shapes.js';
import { UIObject } from '../ui/UIObject.js';


// Main Menu Screen
// All menu objects defined here, should possibly be moved to a content.js file containing uiobjects for each screen, info, etc. similar to accounts.js
const menuItems = [
    { name: 'PS Network', shape: 'icosahedron' },
    { name: 'PS Store', shape: 'tetrahedron' },
    { name: 'Friends', shape: 'default' },
    { name: 'Browser', shape: 'wireframeCube' },
    { name: 'Trophies', shape: 'icosahedron' },
    { name: 'System Settings', shape: 'tetrahedron' }
];

// Used for positioning the entire scroll wheel
const wheelGroup = new THREE.Group();
scene.add(wheelGroup);

// Used for navigating the scroll wheel
const shapeGroup = new THREE.Group();
wheelGroup.add(shapeGroup);

const labelEl = document.querySelector('.menu-item-name-display');
const menuObjects = menuItems.map((item, index) => {
    const mesh = createShape(item.shape);

    return new UIObject({
        mesh,
        labelText: item.name,
        labelEl: null,
        idleRotation: true,
        rotationSpeedX: 0.001,
        rotationSpeedY: 0.001,
        rotationSpeedZ: 0.001,
        glowable: true,
        glowMin: 1.0,
        glowMax: 1.4,
        glowSpeed: 1.2,
        glowIdle: 1.0
    });
});

// Wheel group navigation
const RADIUS = 8.5;
let targetWheelRotation = 0;

const mainMenuScreen = new Screen({
    name: 'main-menu',
    domEl: document.getElementById('screen-main-menu'),
    items: menuObjects,
    parent: shapeGroup,
    wrapNavigation: true,

    onEnter: async (screen) => {
        await new Promise(r => setTimeout(r, 200));

        // Camera resets to scene origin
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);

        // Adjust the rotation and positioning of the entire scroll wheel 
        wheelGroup.visible = true;
        wheelGroup.position.set(15, 0, -22);
        wheelGroup.rotation.set(0, THREE.MathUtils.degToRad(-36), 0);

        // Adjust the positioning of the menu items themselves, used for navigating the scroll wheel
        shapeGroup.rotation.set(0, 0, 0);
        targetWheelRotation = 0;

        menuObjects.forEach((obj, index) => {
            const angle = (index / menuObjects.length) * 2 * Math.PI;
            obj.mesh.position.set(
                0,
                Math.sin(angle) * RADIUS,
                Math.cos(angle) * RADIUS
            );
            const isSelected = index === screen.selectedIndex;
            obj.mesh.scale.setScalar(isSelected ? 1 : 0.6);
        });

        // Set the DOM label of each object
        if (labelEl) {
            labelEl.textContent = menuItems[screen.selectedIndex].name;
            gsap.to(labelEl, { opacity: 1, duration: 0.5, delay: 4.0 });
        }

        // Play menu boot sound and fade from black
        playSound('menustartambience', 0.5);
        await fadeFromBlack(4.0);
    },

    onNavigate: (newIndex, direction, screen) => {
        const anglePerItem = (2 * Math.PI) / menuObjects.length;
        targetWheelRotation += direction * anglePerItem;

        gsap.to(shapeGroup.rotation, {
            x: targetWheelRotation,
            duration: 0.6,
            ease: "power2.out"
        });
        menuObjects.forEach((obj, index) => {
            const isSelected = index === newIndex;
            gsap.to(obj.mesh.scale, {
                x: isSelected ? 1 : 0.6,
                y: isSelected ? 1 : 0.6,
                z: isSelected ? 1 : 0.6,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        if (labelEl) {
            gsap.to(labelEl, {
                opacity: 0,
                duration: 0.1,
                onComplete: () => {
                    labelEl.textContent = menuItems[newIndex].name;
                    gsap.to(labelEl, { opacity: 1, duration: 0.3 });
                }
            });
        }

        playSound('scroll', 0.5);
    },

    onExit: async (screen) => {
        shapeGroup.visible = false;
        gsap.to(labelEl, { opacity: 0, duration: 0.3 });
    }
});



screenManager.register('main-menu', mainMenuScreen);

export { mainMenuScreen };