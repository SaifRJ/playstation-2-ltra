import gsap from 'gsap';

// Handles fades between transitions and micro-interactions 

const overlay = document.getElementById('fade-overlay');

function fadeToBlack(duration) {
    return new Promise(resolve => {
        gsap.to(overlay, {
            opacity: 1,
            duration,
            ease: 'power2.inOut',
            onComplete: resolve
        });
    });
}

function fadeFromBlack(duration) {
    return new Promise(resolve => {
        gsap.to(overlay, {
            opacity: 0,
            duration,
            ease: 'power2.inOut',
            onComplete: resolve
        });
    });
}

export { fadeToBlack, fadeFromBlack };