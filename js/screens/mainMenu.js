import { Screen } from '../ui/Screen.js';
import { screenManager } from './screenManager.js';
import { camera } from '../scene.js';
import { fadeFromBlack } from '../ui/screenEffects.js';

const mainMenuScreen = new Screen({
    name: 'main-menu',
    domEl: document.getElementById('screen-main-menu'),
    items: [],
    parent: null,

    onEnter: async (screen) => {


        await new Promise(r => setTimeout(r, 200));
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);

        await fadeFromBlack(4.0);
    },

    onExit: async (screen) => {
        // todo
    }
});

screenManager.register('main-menu', mainMenuScreen);

export { mainMenuScreen };