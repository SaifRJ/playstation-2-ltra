import state from './state.js';
import gsap from 'gsap';
import { initAudio, loadSound, playSound } from './audio.js';
import { camera } from './scene.js';
import { transitionToAccountSelect, transitionToMainMenu } from './transitions.js';
import { navigateAccounts } from './shapes.js'

let audioReady = false;

async function startAmbience() {
    if (audioReady) return;
    initAudio();
    await loadSound('ambience', 'assets/sounds/ambience.mp3');
    await loadSound('confirm', 'assets/sounds/confirm.mp3');
    await loadSound('scroll', 'assets/sounds/scroll.mp3')
    audioReady = true;
    playSound('ambience', 0.2, true, 3);
}

document.addEventListener('click', startAmbience);

document.addEventListener('keydown', async (e) => {
    await startAmbience();

    if (state.currentScreen === 'press-ps' && e.key === 'Enter' && !state.isTransitioning) {
        state.isTransitioning = true;
        playSound('confirm', 0.5);

        document.querySelector('.press-ps-content').classList.add('exit');

        transitionToAccountSelect()
    }

    if (state.currentScreen === 'account-select' && !state.isTransitioning) {
    if (e.key === 'ArrowLeft') {
        navigateAccounts(-1);
        playSound('scroll', 0.5);
    }
    if (e.key === 'ArrowRight') {
        navigateAccounts(1);
        playSound('scroll', 0.5);
    }
    if (e.key === 'Enter') {
        playSound('confirm', 0.5)
        transitionToMainMenu()
    }

    }
    
});