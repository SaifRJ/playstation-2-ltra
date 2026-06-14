import gsap from 'gsap';
import * as THREE from 'three';
import { scene, camera } from './scene.js';
import { accounts } from './accounts.js';
import state from './state.js';

const SELECTOR_COLORS = [0xfe5258, 0xfe45b4, 0xb071f9, 0x02f52c];
const shapeMeshes = [];

function makeOrbTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0,'rgba(255,255,255,1.0)');
    g.addColorStop(0.15,'rgba(255,255,255,0.75)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.8, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}
const orbTexture = makeOrbTexture();

function makeOrbCoreTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0,'rgba(255,255,255,1.0)');
    g.addColorStop(0.15,'rgba(255,255,255,0.75)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.8, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}
const orbCoreTexture = makeOrbCoreTexture();

function attachSelector(targetMesh) {
    targetMesh.geometry.computeBoundingSphere();
    const r = targetMesh.geometry.boundingSphere.radius;
    const orbitRadius = r * 1.35;
    const HISTORY = 250;

    const selectorGroup = new THREE.Group();
    shapeGroup.add(selectorGroup);

    const orbs = SELECTOR_COLORS.map((color, i) => {
    const orbGroup = new THREE.Group();

    const core = new THREE.Sprite(new THREE.SpriteMaterial({
        map: orbCoreTexture,
        color: new THREE.Color(color),
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        toneMapped: false
    }));
    core.scale.setScalar(orbitRadius * 0.18);
    orbGroup.add(core);

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: orbTexture,
        color: new THREE.Color(color).multiplyScalar(1.0),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    }));
    halo.scale.setScalar(orbitRadius * 0.25);
    orbGroup.add(halo);

    selectorGroup.add(orbGroup);

    const trailGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(HISTORY * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const trailColors = new Float32Array(HISTORY * 3);
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    const trailMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const trail = new THREE.Line(trailGeo, trailMat);
    selectorGroup.add(trail);

    return {
        orbGroup,
        core,
        halo,
        trail,
        color: new THREE.Color(color),
        history: [],
        maxHistory: HISTORY,
        trailOpacity: 1.0,
        tiltA: (Math.random() - 0.5) * Math.PI,
        tiltB: (Math.random() - 0.5) * Math.PI,
        phase: (i / SELECTOR_COLORS.length) * Math.PI * 2,
        speed: 1.0
        };
    });
    const handle = {
        group: selectorGroup,
        orbs,
        target: null,
        orbitRadius,
        // the moving point orbs orbit around
        center: new THREE.Vector3(),   

        update(t) {

            if (handle.target && !migrationTween) {
            handle.center.copy(handle.target.position);
            }

            const globalSpeed = 1.5;
            const c = handle.center;
            const R = handle.orbitRadius;

            orbs.forEach(o => {
                const angle = t * o.speed * globalSpeed + o.phase;
                const x = Math.cos(angle) * R;
                const y = Math.sin(angle) * R;
                const z = Math.sin(angle * 1.3 + o.phase) * R * 0.4;

                const cosA = Math.cos(o.tiltA), sinA = Math.sin(o.tiltA);
                const y2 = y * cosA - z * sinA;
                const z2 = y * sinA + z * cosA;
                const cosB = Math.cos(o.tiltB), sinB = Math.sin(o.tiltB);
                const x3 = x * cosB + z2 * sinB;
                const z3 = -x * sinB + z2 * cosB;

                o.orbGroup.position.set(c.x + x3, c.y + y2, c.z + z3);

                o.history.unshift([o.orbGroup.position.x, o.orbGroup.position.y, o.orbGroup.position.z]);
                
                const cap = Math.floor(o.maxHistory);
                if (o.history.length > cap) o.history.length = cap;

                const pos = o.trail.geometry.attributes.position.array;
                const col = o.trail.geometry.attributes.color.array;
                for (let i = 0; i < HISTORY; i++) {
                    const validLength = Math.min(o.history.length, cap);
                    const p = o.history[Math.min(i, validLength - 1)] || [0,0,0];
                    pos[i*3] = p[0]; pos[i*3+1] = p[1]; pos[i*3+2] = p[2];
                    
                    const fade = i < validLength ? (1 - (i / validLength)) : 0;
                    col[i*3]   = o.color.r * fade * o.trailOpacity * 2.0;
                    col[i*3+1] = o.color.g * fade * o.trailOpacity * 2.0;
                    col[i*3+2] = o.color.b * fade * o.trailOpacity * 2.0;
                }

                o.trail.geometry.attributes.position.needsUpdate = true;
                o.trail.geometry.attributes.color.needsUpdate = true;
            });
        },

        detach() {
            shapeGroup.remove(selectorGroup);
            orbs.forEach(o => {

                o.core.material.dispose();
                o.halo.material.dispose();
                o.trail.geometry.dispose();
                o.trail.material.dispose();
                // o.trail.HISTORY = 50
            });
        }
    };

    return handle;
    }

let activeSelector = null;
let migrationTween = null;

// Sets target to new UI object
function setSelectorTarget(mesh) {
    if (!activeSelector) {
        activeSelector = attachSelector(mesh);
        activeSelector.target = mesh;
        activeSelector.center.copy(mesh.position);
        return;
    }

    // kill any in-flight migration so rapid scrolling doesn't pile up tweens
    if (migrationTween) migrationTween.kill();

    activeSelector.target = mesh;

    const fromPos = activeSelector.center.clone();
    const toPos = mesh.position.clone();
    const mid = fromPos.clone().lerp(toPos, 0.5);
    // orb migration curve
    mid.y += 0.6;

    const curve = new THREE.CatmullRomCurve3([fromPos, mid, toPos]);

    const progress = { u: 0 };
    activeSelector.orbs.forEach(o => {
    // fade opacity when migrating
    gsap.to(o, { trailOpacity: 1.0, maxHistory: 50, duration: 0.4 });
    });
    migrationTween = gsap.to(progress, {
        u: 1,
        duration: 0.6,
        ease: "power2.inOut",
        onUpdate: () => {
    
    const curvePoint = curve.getPointAt(progress.u);
    
    activeSelector.center.lerpVectors(
        curvePoint,
        mesh.position,
        progress.u * progress.u
        );
    },
        onComplete: () => {
        migrationTween = null;
        
        activeSelector.orbs.forEach(o => {
        // gsap.to(o, { trailOpacity: 1.0, duration: 0.6});
        o.maxHistory = 250; 
    }); 
    }
});

    // also smoothly adjust orbit radius for different-sized shapes
    mesh.geometry.computeBoundingSphere();
    const newR = mesh.geometry.boundingSphere.radius * 1.1;
    gsap.to(activeSelector, {
        orbitRadius: newR,
        duration: 0.6,
        ease: "power2.inOut"
    });
}

function getSelectedMesh() {
    return shapeMeshes[state.selectedAccount];
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

    // Switch selector tp target shape
    setSelectorTarget(shapeMeshes[state.selectedAccount]);

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
    if (activeSelector) activeSelector.update(t);
}

export { initAccountShapes, showShapes, hideShapes, navigateAccounts, animateShapes, attachSelector, setSelectorTarget, getSelectedMesh, shapeGroup };