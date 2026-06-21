import gsap from 'gsap';
import * as THREE from 'three';
import { scene, camera } from './scene.js';
import { accounts } from './accounts.js';
import state from './state.js';
import { setSelectorTarget } from './ui/selector.js';
import { UIObject } from './ui/UIObject.js';

const accountObjects = [];

function getSelectedObject() {
    return accountObjects[state.selectedAccount];
}
function getSelectedMesh() {
    return accountObjects[state.selectedAccount]?.mesh;
}

function createEnvMap() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#1a3a6e');
    gradient.addColorStop(0.3, '#0a1a3a');
    gradient.addColorStop(0.5, '#050d1a');
    gradient.addColorStop(0.7, '#0a1a3a');
    gradient.addColorStop(1, '#1a3a6e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.3, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.5, 15, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
}

const envMap = createEnvMap();
const shapeGroup = new THREE.Group();
shapeGroup.visible = false;
scene.add(shapeGroup);

function createShape(type) {
    let geometry;

    switch (type) {
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(2.0, 0);
            break;
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(2.0, 0);
            break;
        case 'wireframeCube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        default:
            geometry = new THREE.OctahedronGeometry(2.0, 0);
    }

    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);

    const palette = [
        [0.9, 0.2, 0.3],
        [0.4, 0.8, 0.5],
        [0.8, 0.4, 0.7],
        [0.3, 0.5, 1.0],
        [0.5, 0.3, 0.9],
        [0.2, 0.4, 0.8],
    ];

    for (let i = 0; i < count; i += 3) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];
        colors[(i + 1) * 3] = color[0];
        colors[(i + 1) * 3 + 1] = color[1];
        colors[(i + 1) * 3 + 2] = color[2];
        colors[(i + 2) * 3] = color[0];
        colors[(i + 2) * 3 + 1] = color[1];
        colors[(i + 2) * 3 + 2] = color[2];
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.0,
        roughness: 1.0,
        flatShading: false,
        emissiveIntensity: 1.0,
        // transparent: false 
    });

    material.userData.glowUniform = { value: 0.4 };

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uGlow = material.userData.glowUniform;
        shader.fragmentShader = 'uniform float uGlow;\n' + shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             totalEmissiveRadiance = diffuseColor.rgb * uGlow;`
        );
    };

    const mesh = new THREE.Mesh(geometry, material);

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: false, opacity: 0.2 })
    );
    mesh.add(edges);

    return mesh;
}

function initAccountShapes() {
    // remove any existing objects
    accountObjects.forEach(obj => obj.removeFromScene(shapeGroup));
    accountObjects.length = 0;

    const labelEl = document.querySelector('.account-name-display');

    accounts.forEach((account, index) => {
        const mesh = createShape(account.shape);
        const offset = index - state.selectedAccount;
        mesh.position.set(offset * 6, 0, 0);

        const uiObj = new UIObject({
            mesh,
            labelText: account.name,
            labelEl: index === state.selectedAccount ? labelEl : null,
            idleRotation: true,
            rotationSpeedX: 0.001,
            rotationSpeedY: 0.001,
            rotationSpeedZ: 0.001,
            glowable: true,
            glowMin: 1.0,
            glowMax: 1.4,
            glowSpeed: 1.2,
            glowIdle: 1.0,
            onSelect: () => {}
        });

        uiObj.addToScene(shapeGroup);
        accountObjects.push(uiObj);
    });

    // init selection state
    accountObjects[state.selectedAccount]?.setSelected(true);
}

function showShapes() {
    shapeGroup.visible = true;
    shapeGroup.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z + 13
    );
    shapeGroup.rotation.copy(camera.rotation);

    accountObjects.forEach((obj, index) => {
        const offset = index - state.selectedAccount;
        const targetOpacity = offset === 0 ? 0.8 : 0.1;

        obj.mesh.position.y = -0.5;

        gsap.to(obj.mesh.position, {
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.1
        });
    });

    setSelectorTarget(accountObjects[state.selectedAccount].mesh);
}

function hideShapes() {
    shapeGroup.visible = false;
}

function navigateAccounts(direction) {
    const newIndex = state.selectedAccount + direction;
    if (newIndex < 0 || newIndex >= accounts.length) return;

    // selection state — UIObject handles its own selection visuals
    accountObjects[state.selectedAccount].setSelected(false);
    state.selectedAccount = newIndex;
    accountObjects[state.selectedAccount].setSelected(true);

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

    // label swap
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
    const t = Date.now() * 0.001;
    accountObjects.forEach(obj => obj.update(t));
}

export {
    initAccountShapes, showShapes, hideShapes, navigateAccounts, animateShapes, getSelectedMesh, getSelectedObject,shapeGroup};