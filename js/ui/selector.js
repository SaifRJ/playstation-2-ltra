import * as THREE from 'three';
import gsap from 'gsap';
import { scene } from '../scene.js';

// Orb cursor/selector
// setSelectorTarget(targetMesh) migrates the selector between targets via a CatmullRom curve
// attachSelector(targetMesh) instantiates orb textures and trails

const SELECTOR_COLORS = [0xfe5258, 0xfe45b4, 0xb071f9, 0x02f52c];
const HISTORY = 240;

// Define orb textures (two per orb)
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

const orbTexture = makeOrbTexture();
const orbCoreTexture = makeOrbCoreTexture();

// Selector logic
let activeSelector = null;
let migrationTween = null;

function attachSelector(uiObject) {
    const orbitRadius = uiObject.getOrbitRadius();
    const HISTORY = 200;

    const selectorGroup = new THREE.Group();
    uiObject.mesh.parent.add(selectorGroup);

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
        center: new THREE.Vector3(),   

        update(t) {

            if (handle.target && !migrationTween) {
            handle.center.copy(handle.target.getAnchor());
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
            scene.remove(selectorGroup);
            orbs.forEach(o => {

                o.core.material.dispose();
                o.halo.material.dispose();
                o.trail.geometry.dispose();
                o.trail.material.dispose();
            });
        }
    };

    return handle;
    }

    
// Sets target to new UI object
function setSelectorTarget(uiObject) {
    
    // selector will orbit the first object in any scene
    const anchor = uiObject.getAnchor(); 

    if (!activeSelector) {
        activeSelector = attachSelector(uiObject);
        activeSelector.target = uiObject;
        activeSelector.center.copy(anchor);
        return;
    }

    // kill any in-flight migration so rapid scrolling doesn't pile up tweens
    if (migrationTween) migrationTween.kill();
    activeSelector.target = uiObject;

    const fromPos = activeSelector.center.clone();
    const toPos = anchor.clone();
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
                uiObject.getAnchor(),
                progress.u * progress.u
            );
        },
        onComplete: () => {
        migrationTween = null;

        activeSelector.orbs.forEach(o => {
        o.maxHistory = 250; 
    }); 
    }
});

    // smoothly adjust orbit radius for different-sized shapes
    const newR = uiObject.getOrbitRadius();
    gsap.to(activeSelector, {
        orbitRadius: newR,
        duration: 0.6,
        ease: "power2.inOut"
    });
}

function updateSelector(t) {
    if (activeSelector) activeSelector.update(t);
}

export { setSelectorTarget, updateSelector };