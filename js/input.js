import { screenManager } from './screens/screenManager.js';
import { initAudio, loadSound, playSound } from './audio.js';

let audioReady = false;

async function startAmbience() {
    if (audioReady) return;
    initAudio();
    await loadSound('ambience', 'assets/sounds/ambience.mp3');
    await loadSound('confirm', 'assets/sounds/confirm.mp3');
    await loadSound('scroll', 'assets/sounds/scroll.mp3');
    await loadSound('menustartambience2', 'assets/sounds/menustartambience2.wav');
    await loadSound('menustartambience', 'assets/sounds/menustartambience.wav');
    audioReady = true;
    playSound('ambience', 0.2, true, 3);
}

document.addEventListener('click', startAmbience);

document.addEventListener('keydown', async (e) => {
    await startAmbience();

    const current = screenManager.getCurrent();
    if (!current) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') current.navigate(-1);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') current.navigate(1);
    if (e.key === 'Enter') current.confirm();
    if (e.key === 'Escape') current.cancel();
});