import gsap from 'gsap';
import { camera } from './scene.js';
import state from './state.js';
import { initAccountShapes, showShapes } from './account-shapes.js';
import { accounts } from './accounts.js';

function transitionToAccountSelect() {
    state.isTransitioning = true;

    document.querySelector('.press-ps-content').classList.add('exit');

    gsap.to(camera.position, {
        z: 15,
        duration: 4.8,
        ease: "power2.inOut"
    });

    gsap.to(camera.rotation, {
        z: 0.5,
        duration: 4.8,
        ease: "power2.inOut",
        onComplete: () => {
            state.isTransitioning = false;
            state.currentScreen = 'account-select';
        }
    });

    gsap.delayedCall(3.5, () => {
        document.getElementById('screen-press-ps').classList.remove('active');
        document.getElementById('screen-account-select').classList.add('active');
        document.querySelector('.account-name-display').textContent = accounts[state.selectedAccount].name;
        initAccountShapes();
        showShapes();
    });

}

function transitionToMainMenu() {
// WIP
}

export { transitionToAccountSelect, transitionToMainMenu };