// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020510);
scene.fog = new THREE.FogExp2(0x020510, 0.015);


// === CAMERA ===
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 20);

// === RENDERER ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.insertBefore(renderer.domElement, document.body.firstChild);

// === LIGHTING ===
const ambientLight = new THREE.AmbientLight(0x1a3a6e, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x3a7bd5, 1.2, 100);
pointLight.position.set(0, 5, 15);
scene.add(pointLight);

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

// Softer, larger gradient with more falloff
const gradient = fogCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
gradient.addColorStop(0, 'rgba(8, 20, 60, 0.5)');
gradient.addColorStop(0.3, 'rgba(8, 20, 60, 0.25)');
gradient.addColorStop(0.6, 'rgba(5, 15, 45, 0.1)');
gradient.addColorStop(1, 'rgba(5, 15, 45, 0)');
fogCtx.fillStyle = gradient;
fogCtx.fillRect(0, 0, 512, 512);

const fogTexture = new THREE.CanvasTexture(fogCanvas);

for (let i = 0; i < 80; i++) {
    const fogMaterial = new THREE.SpriteMaterial({
        map: fogTexture,
        transparent: true,
        opacity: 0.06 + Math.random() * 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(fogMaterial);
    sprite.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 80 - 10
    );
    
    // Much larger sprites that overlap heavily
    const scale = 20 + Math.random() * 35;
    sprite.scale.set(scale, scale, 1);
    
    sprite.userData = {
        baseX: sprite.position.x,
        baseY: sprite.position.y,
        driftSpeed: 0.00008 + Math.random() * 0.00015,
        driftAmount: 2 + Math.random() * 4,
        rotSpeed: (Math.random() - 0.5) * 0.0001
    };
    
    fogParticles.push(sprite);
    scene.add(sprite);
}


function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now();
    
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


animate()

// === HANDLE RESIZE ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === INPUT ===
let currentScreen = 'press-ps';

document.addEventListener('keydown', (e) => {
    if (currentScreen === 'press-ps' && e.key === 'Enter') {
        console.log('Transitioning to account select...');
        currentScreen = 'account-select';
        
        // Hide the press PS screen
        document.getElementById('screen-press-ps').classList.remove('active');
    }
});