// === SCENE SETUP ===
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x020510);
scene.fog = new THREE.FogExp2(0x020510, 0.015);


// === CAMERA ===
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 40);

// === RENDERER ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.insertBefore(renderer.domElement, document.body.firstChild);

// === LIGHTING ===
// const ambientLight = new THREE.AmbientLight(0x010208, 0.3);
// scene.add(ambientLight);

// Tight spotlight punching through from behind
// const spotLight = new THREE.SpotLight(0x2a5aaa, 4, 150, Math.PI / 8, 0.6);
// spotLight.position.set(0, 0, -60);
// spotLight.target.position.set(0, 0, 0);
// scene.add(spotLight);
// scene.add(spotLight.target);

// === FLOATING PARTICLES ===
const particleCount = 200;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 80;      // x
    positions[i + 1] = (Math.random() - 0.5) * 80;   // y
    positions[i + 2] = (Math.random() - 0.5) * 80;   // z
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0x3a7bd5,
    size: 0.15,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);


// === VOLUMETRIC FOG ===
const fogParticles = [];

const fogCanvas = document.createElement('canvas');
fogCanvas.width = 512;
fogCanvas.height = 512;
const fogCtx = fogCanvas.getContext('2d');

const gradient = fogCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
gradient.addColorStop(0, 'rgba(8, 20, 60, 0.5)');
gradient.addColorStop(0.3, 'rgba(8, 20, 60, 0.25)');
gradient.addColorStop(0.6, 'rgba(5, 15, 45, 0.1)');
gradient.addColorStop(1, 'rgba(5, 15, 45, 0)');
fogCtx.fillStyle = gradient;
fogCtx.fillRect(0, 0, 512, 512);

const fogTexture = new THREE.CanvasTexture(fogCanvas);

// Brighter texture for sprites near the light
const brightFogCanvas = document.createElement('canvas');
brightFogCanvas.width = 512;
brightFogCanvas.height = 512;
const brightFogCtx = brightFogCanvas.getContext('2d');

const brightGradient = brightFogCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
brightGradient.addColorStop(0, 'rgba(20, 40, 100, 0.6)');
brightGradient.addColorStop(0.2, 'rgba(15, 35, 90, 0.35)');
brightGradient.addColorStop(0.5, 'rgba(10, 25, 70, 0.1)');
brightGradient.addColorStop(1, 'rgba(5, 15, 45, 0)');
brightFogCtx.fillStyle = brightGradient;
brightFogCtx.fillRect(0, 0, 512, 512);

const brightFogTexture = new THREE.CanvasTexture(brightFogCanvas);

for (let i = 0; i < 375; i++) {
    // Cluster most sprites near the light source at (0, 0, -20)
    // Using gaussian-like distribution: closer to center = more likely
    const spread = Math.random();
    const isNearCenter = spread < 0.6;

    let x, y, z, scale, opacity, texture;

    if (isNearCenter) {
        // Dense cluster near the light
        x = (Math.random() - 0.5) * 45;
        y = (Math.random() - 0.5) * 35;
        z = -20 + (Math.random() - 0.5) * 25;
        scale = 8 + Math.random() * 20;
        opacity = 0.08 + Math.random() * 0.14;
        texture = brightFogTexture;
    } else {
        // Sparse, larger wisps further out
        x = (Math.random() - 0.5) * 80;
        y = (Math.random() - 0.5) * 50;
        z = (Math.random() - 0.5) * 80 - 10;
        scale = 25 + Math.random() * 40;
        opacity = 0.04 + Math.random() * 0.08;
        texture = fogTexture;
    }

    
    const fogMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(fogMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);

    sprite.userData = {
        baseX: sprite.position.x,
        baseY: sprite.position.y,
        driftSpeed: 0.00005 + Math.random() * 0.00012,
        driftAmount: 1.5 + Math.random() * 3,
        rotSpeed: (Math.random() - 0.5) * 0.00008
    };

    fogParticles.push(sprite);
    scene.add(sprite);
}

// === INPUT ===
let currentScreen = 'press-ps';
let isTransitioning = false;

document.addEventListener('keydown', (e) => {
    if (currentScreen === 'press-ps' && e.key === 'Enter' && !isTransitioning) {
        isTransitioning = true;
        currentScreen = 'transitioning';
        document.getElementById('screen-press-ps').classList.remove('active');
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now();
    
    // Camera transition
    if (isTransitioning) {
        camera.position.z -= 0.15;
        
        if (camera.position.z < -30) {
            isTransitioning = false;
            currentScreen = 'account-select';
            console.log('Arrived at account select');
        }
    }
    
    // Drift fog clouds slowly
    fogParticles.forEach(sprite => {
        sprite.position.x = sprite.userData.baseX +
            Math.sin(time * sprite.userData.driftSpeed) * sprite.userData.driftAmount;
        sprite.position.y = sprite.userData.baseY +
            Math.cos(time * sprite.userData.driftSpeed * 0.6) * sprite.userData.driftAmount * 0.3;
        sprite.material.rotation += sprite.userData.rotSpeed;
    });
    
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;
    
    renderer.render(scene, camera);
}

animate();

// === HANDLE RESIZE ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// const geometry = new THREE.BoxGeometry(5, 5, 5);
// const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

// const cube = new THREE.Mesh(geometry, material);
// cube.position.set(0, 0, 0);

// scene.add(cube);