import gsap from 'gsap';
import * as THREE from 'three';
import { scene, camera } from './scene.js';
import { accounts } from './accounts.js';
import state from './state.js';


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
const shapeMeshes = [];
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
    [0.9, 0.2, 0.3],   // PlayStation red (circle)
    [0.4, 0.8, 0.5],   // PlayStation green (triangle)
    [0.8, 0.4, 0.7],   // PlayStation pink (square)
    [0.3, 0.5, 1.0],   // PlayStation blue (cross)
    [0.5, 0.3, 0.9],   // indigo
    [0.2, 0.4, 0.8],   // deep blue
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
    emissiveIntensity: 1.0
    });

    material.userData.glowUniform = { value: 0.4 };

    material.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = material.userData.glowUniform;
    shader.fragmentShader = 'uniform float uGlow;\n' + shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance = diffuseColor.rgb * uGlow;`
    );};

    const mesh = new THREE.Mesh(geometry, material);

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: false, opacity: 0.2 })
    );
    mesh.add(edges);

    return mesh;

    return new THREE.Mesh(geometry, material);
}


function initAccountShapes() {
    shapeMeshes.forEach(m => shapeGroup.remove(m));
    shapeMeshes.length = 0;

    // shapeGroup.children.forEach(child => {
    //     if (child.isLight) shapeGroup.remove(child);
    // });

    // const shapeLight = new THREE.PointLight(0x6699cc, 2.5, 40);
    // shapeLight.position.set(2, 3, 5);
    // shapeGroup.add(shapeLight);

    // const rimLight = new THREE.PointLight(0x4466aa, 1.5, 30);
    // rimLight.position.set(-3, -2, 3);
    // shapeGroup.add(rimLight);

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
        camera.position.z + 13
    );
    shapeGroup.rotation.copy(camera.rotation);

    shapeMeshes.forEach((mesh, index) => {
        const offset = index - state.selectedAccount;
        const targetOpacity = offset === 0 ? 0.8 : 0.1;

        mesh.material.opacity = 0;
        mesh.position.y = -0.5;

        gsap.to(mesh.material, {
            opacity: targetOpacity,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.1
        });

        gsap.to(mesh.position, {
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.1
        });
    });

    labels.forEach((label, index) => {
        label.element.style.opacity = '0';

        gsap.to(label.element.style, {
            opacity: index === state.selectedAccount ? 1 : 0.3,
            duration: 0.8,
            delay: 0.1
        });
    });

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
    const t = Date.now() * 0.001;   
    shapeMeshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.001;
        mesh.rotation.x += 0.001;
        mesh.rotation.z += 0.001;

        const offset = index - state.selectedAccount;
        const isSelected = offset === 0;
        const minGlow = 1.0, maxGlow = 1.4;
        const breathe = minGlow + (Math.sin(t * 1.2) * 0.5 + 0.5) * (maxGlow - minGlow);
        mesh.material.userData.glowUniform.value = isSelected ? breathe : 1.0;
    });
}

export { initAccountShapes, showShapes, hideShapes, navigateAccounts, animateShapes, shapeGroup };