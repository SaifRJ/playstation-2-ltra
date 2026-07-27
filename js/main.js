import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { scene, camera, renderer, composer } from './scene.js';
import { particles } from './particles.js';
import { fogParticles } from './fog.js';
import { updateSelector } from './ui/selector.js';
import { screenManager } from './screens/screenManager.js';
import './input.js';
import './screens/pressPS.js';
import './screens/accountSelect.js';
import './screens/mainMenu.js';

// FPS stats
// const stats = new Stats();
// document.body.appendChild(stats.dom);

const clockEl = document.querySelector('.clock-display');
function updateClock() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    let h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const min = String(d.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${dd}/${mm}/${d.getFullYear()} ${h}:${min}:${ss} ${ampm}`;
}

// Splash screen
// todo

// Startup sequence
// todo

// First screen
screenManager.transitionTo('press-ps');

function animate() {

    updateClock();
    setInterval(updateClock, 1000);
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
    // stats.update();
}
animate();
