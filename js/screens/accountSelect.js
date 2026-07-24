import gsap from 'gsap';
import * as THREE from 'three';

import state from '../state.js';
import { scene, camera } from '../scene.js';
import { screenManager } from '../screens/screenManager.js';
import { accounts } from '../accounts.js';
import { playSound } from '../audio.js';
import { createShape } from '../shapes.js';
import { Screen } from '../ui/Screen.js';
import { UIObject } from '../ui/UIObject.js';
import { fadeToBlack } from '../ui/screenEffects.js';

// 'Who's Playing?' screen
// Owns its own shapeGroup, positioned in front of the camera
// The group holds all account UIObjects side-by-side, allows users to select their account
// On enter: shapes rise into view from below.
// On navigate: shapes slide horizontally, selected one scales up.
// On confirm: transition to main-menu.
// shapeGroup lives at scene root, follows camera via onUpdate hook

const shapeGroup = new THREE.Group();
shapeGroup.visible = false;
scene.add(shapeGroup);

const labelEl = document.querySelector('.account-name-display');

// Create one UIObject per account
const accountObjects = accounts.map((account, index) => {
    const mesh = createShape(account.shape);

    return new UIObject({
        mesh,
        labelText: account.name,
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

const accountSelectScreen = new Screen({
    name: 'account-select',
    domEl: document.getElementById('screen-account-select'),
    items: accountObjects,
    parent: shapeGroup,
    initialIndex: state.selectedAccount,

    onEnter: async (screen) => {
        shapeGroup.visible = true;

        // reset each item to its slot position and hidden-below-origin y
        accountObjects.forEach((obj, index) => {
            const offset = index - state.selectedAccount;
            obj.mesh.position.set(offset * 6, -0.5, 0);
            obj.mesh.scale.setScalar(offset === 0 ? 1 : 0.6);
        });

        // set initial label
        if (labelEl) {
            labelEl.textContent = accounts[state.selectedAccount].name;
            labelEl.style.opacity = '1';
        }

        // animate all items rising into place
        await Promise.all(
            accountObjects.map(obj =>
                gsap.to(obj.mesh.position, {
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: 0.1
                })
            )
        );
    },

    onExit: async (screen) => {
    
    // existing content disappears
    shapeGroup.visible = false;

    await Promise.all([
        // camera moves
        gsap.to(camera.position, { z: -45, duration: 3.8, ease: 'power2.inOut' }),
        gsap.to(camera.rotation, { z: 0.9, duration: 3.3, ease: 'power2.inOut' }),
        
        // fade to black
        (async () => {
            await new Promise(r => setTimeout(r, 1000));
            await fadeToBlack(2.0);
        })()
    ]);
},

    onNavigate: (newIndex, direction, screen) => {
        state.selectedAccount = newIndex;

        accountObjects.forEach((obj, index) => {
            const offset = index - state.selectedAccount;

            gsap.to(obj.mesh.position, {
                x: offset * 6,
                duration: 0.6,
                ease: "power2.out"
            });

            gsap.to(obj.mesh.scale, {
                x: offset === 0 ? 1 : 0.6,
                y: offset === 0 ? 1 : 0.6,
                z: offset === 0 ? 1 : 0.6,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        // account title text
        if (labelEl) {
            gsap.to(labelEl, {
                opacity: 0,
                duration: 0.1,
                onComplete: () => {
                    labelEl.textContent = accounts[state.selectedAccount].name;
                    gsap.to(labelEl, { opacity: 1, duration: 0.3 });
                }
            });
        }

        playSound('scroll', 0.5);
    },

    onConfirm: (selectedItem, screen) => {
        playSound('confirm', 0.5);
        screenManager.transitionTo('main-menu');
    },

    onUpdate: (t, screen) => {
        if (!shapeGroup.visible) return;
        shapeGroup.position.set(
            camera.position.x,
            camera.position.y,
            camera.position.z - 15
        );
        shapeGroup.rotation.copy(camera.rotation);
    }
});

screenManager.register('account-select', accountSelectScreen);

export { accountSelectScreen };