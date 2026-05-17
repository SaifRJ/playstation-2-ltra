const sounds = {};
let audioContext = null;
let activeSources = {};

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

async function loadSound(name, path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    sounds[name] = audioBuffer;
}

function playSound(name, volume = 0.5, loop = false, fadeIn = 0) {
    if (!sounds[name] || !audioContext) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = sounds[name];
    source.loop = loop;

    if (fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + fadeIn);
    } else {
        gainNode.gain.value = volume;
    }

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);

    activeSources[name] = { source, gainNode };
    return source;
}

export { initAudio, loadSound, playSound };