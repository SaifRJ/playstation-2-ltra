import gsap from 'gsap';
import { Screen } from '../ui/Screen.js';
import { screenManager } from '../screens/screenManager.js';
import { camera } from '../scene.js';
import { playSound } from '../audio.js';

const pressPSScreen = new Screen({
    name: 'press-ps',
    domEl: document.getElementById('screen-press-ps'),
    items: [],
    parent: null,

    onEnter: async (screen) => {
        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.remove('exit');

        // only dolly if not already at rest
        const atRest = Math.abs(camera.position.z - 30) < 0.1
                    && Math.abs(camera.rotation.z) < 0.01;
        if (atRest) return;

        await Promise.all([
            gsap.to(camera.position, {
                z: 30,
                duration: 2.8,
                ease: "power2.inOut"
            }),
            gsap.to(camera.rotation, {
                z: 0,
                duration: 2.8,
                ease: "power2.inOut"
            })
        ]);
    },

    onExit: async (screen) => {
        // fade the prompt text via CSS class
        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.add('exit');

        await Promise.all([
            gsap.to(camera.position, {
                z: 15,
                duration: 2.8,
                ease: "power2.inOut"
            }),
            gsap.to(camera.rotation, {
                z: 0.5,
                duration: 2.8,
                ease: "power2.inOut"
            })
        ]);
    },

    onConfirm: () => {
        playSound('confirm', 0.5);
        screenManager.transitionTo('account-select');
    },

    onPSButton: () => {
        playSound('confirm', 0.5);
        screenManager.transitionTo('account-select');
    }
});

screenManager.register('press-ps', pressPSScreen);

export { pressPSScreen };