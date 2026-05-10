import state from './state.js';
import { initAudio, loadSound, playSound } from './audio.js';

let audioReady = false;

async function startAmbience() {
    if (audioReady) return;
    initAudio();
    await loadSound('ambience', 'assets/sounds/ambience.mp3');
    await loadSound('confirm', 'assets/sounds/confirm.mp3');
    audioReady = true;
    playSound('ambience', 0.2, true, 3);
}

document.addEventListener('click', startAmbience);

document.addEventListener('keydown', async (e) => {
    await startAmbience();

    if (state.currentScreen === 'press-ps' && e.key === 'Enter' && !state.isTransitioning) {
        playSound('confirm', 0.5);
        state.isTransitioning = true;
        state.currentScreen = 'transitioning';
        document.getElementById('screen-press-ps').classList.remove('active');
    }
});