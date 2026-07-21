import * as THREE from 'three';
import { scene, camera, renderer, composer } from './scene.js';
import { particles } from './particles.js';
import { fogParticles } from './fog.js';
import './input.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { updateSelector } from './ui/selector.js';
import './screens/pressPS.js';
import './screens/accountSelect.js';
import { screenManager } from './screens/screenManager.js';

// const stats = new Stats();
// document.body.appendChild(stats.dom);

// Splash screen

// Startup sequence

// First screen
screenManager.transitionTo('press-ps');

function animate() {
    requestAnimationFrame(animate);

    const t = Date.now() * 0.001;
    const fogTime = Date.now();

    particles.rotation.y += 0.00001;
    particles.rotation.x += 0.00001;

    fogParticles.forEach(sprite => {
        const u = sprite.userData;
        sprite.position.x = u.baseX + Math.sin(fogTime * u.driftSpeed) * u.driftAmount;
        sprite.position.y = u.baseY + Math.cos(fogTime * u.driftSpeed * 0.6) * u.driftAmount * 0.3;
        
        const wave = Math.sin(fogTime * u.waveSpeed + u.wavePhase) * u.waveAmp;
        sprite.position.x += u.waveDirX * wave;
        sprite.position.y += u.waveDirY * wave;
        sprite.material.rotation += u.rotSpeed;
    });

    screenManager.getCurrent()?.update(t);
    updateSelector(t);

    composer.render();
    stats.update();
}
animate();
