import gsap from 'gsap';
import * as THREE from 'three';
import { scene, camera } from './scene.js';
import { accounts } from './accounts.js';
import state from './state.js';

const shapeMeshes = [];
const shapeGroup = new THREE.Group();
shapeGroup.visible = false;
scene.add(shapeGroup);

function createShape(type) {
    let geometry;

    switch (type) {
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(1.3, 0);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(1.3, 1);
            break;
        case 'wireframeCube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        default:
            geometry = new THREE.OctahedronGeometry(1.3, 0);
    }

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.9
    });

    return new THREE.Mesh(geometry, material);
}

function initAccountShapes() {
    shapeMeshes.forEach(m => shapeGroup.remove(m));
    shapeMeshes.length = 0;

    accounts.forEach((account, index) => {
        const mesh = createShape(account.shape);
        const offset = index - state.selectedAccount;
        mesh.position.set(offset * 6, 0, 0);
        mesh.material.opacity = offset === 0 ? 0.8 : 0.1;
        shapeGroup.add(mesh);
        shapeMeshes.push(mesh);
    });
}

function showShapes() {
    shapeGroup.visible = true;
    shapeGroup.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z - 13
    );
    shapeGroup.rotation.copy(camera.rotation);
}

function hideShapes() {
    shapeGroup.visible = false;
}

function navigateAccounts(direction) {
    const newIndex = state.selectedAccount + direction;
    if (newIndex < 0 || newIndex >= accounts.length) return;

    state.selectedAccount = newIndex;

    shapeMeshes.forEach((mesh, index) => {
        const offset = index - state.selectedAccount;

        gsap.to(mesh.position, {
            x: offset * 6,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to(mesh.scale, {
            x: offset === 0 ? 1 : 0.6,
            y: offset === 0 ? 1 : 0.6,
            z: offset === 0 ? 1 : 0.6,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to(mesh.material, {
            opacity: offset === 0 ? 0.8 : 0.3,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    const nameEl = document.querySelector('.account-name-display');
    if (nameEl) {
        gsap.to(nameEl, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                nameEl.textContent = accounts[state.selectedAccount].name;
                gsap.to(nameEl, { opacity: 1, duration: 0.3 });
            }
        });
    }
}

function animateShapes() {
    shapeMeshes.forEach(mesh => {
        mesh.rotation.y += 0.002;
        mesh.rotation.x += 0.001;
    });
}

export { initAccountShapes, showShapes, hideShapes, navigateAccounts, animateShapes, shapeGroup };