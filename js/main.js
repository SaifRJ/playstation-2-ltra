import { scene, camera, renderer } from './scene.js';
import { particles } from './particles.js';
import { fogParticles } from './fog.js';
import state from './state.js';
import './input.js';

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    if (state.isTransitioning) {
        camera.position.z -= 0.15;
        if (camera.position.z < -30) {
            state.isTransitioning = false;
            state.currentScreen = 'account-select';
        }
    }
    
    particles.rotation.y += 0.00001;
    particles.rotation.x += 0.00001;


    // Drift fog
    const fogTime = Date.now();
    fogParticles.forEach(sprite => {
        sprite.position.x = sprite.userData.baseX +
            Math.sin(fogTime * sprite.userData.driftSpeed) * sprite.userData.driftAmount;
        sprite.position.y = sprite.userData.baseY +
            Math.cos(fogTime * sprite.userData.driftSpeed * 0.6) * sprite.userData.driftAmount * 0.3;
        sprite.material.rotation += sprite.userData.rotSpeed;
    });

    renderer.render(scene, camera);
}

animate();