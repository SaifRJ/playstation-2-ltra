import * as THREE from 'three';
import { scene, camera, renderer, composer } from './scene.js';
import { particles } from './particles.js';
import { fogParticles } from './fog.js';
import { animateShapes, shapeGroup } from './shapes.js';
import state from './state.js';
import './input.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// const stats = new Stats();
// document.body.appendChild(stats.dom);

function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.00001;
    particles.rotation.x += 0.00001;

    const fogTime = Date.now();
    fogParticles.forEach(sprite => {
        sprite.position.x = sprite.userData.baseX +
            Math.sin(fogTime * sprite.userData.driftSpeed) * sprite.userData.driftAmount;
        sprite.position.y = sprite.userData.baseY +
            Math.cos(fogTime * sprite.userData.driftSpeed * 0.6) * sprite.userData.driftAmount * 0.3;
        sprite.material.rotation += sprite.userData.rotSpeed;
    });

    if (shapeGroup.visible) {
        shapeGroup.position.set(
            camera.position.x,
            camera.position.y,
            camera.position.z - 15
        );
        shapeGroup.rotation.copy(camera.rotation);
        animateShapes();
    }

    composer.render();
    stats.update();
}

animate();