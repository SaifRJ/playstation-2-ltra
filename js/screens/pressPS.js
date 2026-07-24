import gsap from 'gsap';
import { Screen } from '../ui/Screen.js';
import { screenManager } from '../screens/screenManager.js';
import { camera } from '../scene.js';
import { playSound } from '../audio.js';
import { fadeFromBlack, fadeToBlack } from '../ui/screenEffects.js';

const pressPSScreen = new Screen({
    name: 'press-ps',
    domEl: document.getElementById('screen-press-ps'),
    items: [],
    parent: null,

    onEnter: async (screen) => {
                
        // await fadeToBlack(0.0)
        // await fadeFromBlack(4.0);

        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.remove('exit');
    },

    onExit: async (screen) => {
        // fade the prompt text via CSS class
        const content = document.querySelector('.press-ps-content');
        if (content) content.classList.add('exit');

        await Promise.all([
            gsap.to(camera.position, {
                z: -15,
                duration: 2.8,
                ease: "power2.inOut"
            }),
            gsap.to(camera.rotation, {
                z: 0.4,
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