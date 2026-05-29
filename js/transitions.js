import gsap from 'gsap';
import { camera } from './scene.js';
import state from './state.js';
import { initAccountShapes, showShapes } from './shapes.js';
import { accounts } from './accounts.js';

function transitionToAccountSelect() {
    state.isTransitioning = true;

    document.querySelector('.press-ps-content').classList.add('exit');

    gsap.to(camera.position, {
        z: 15,
        duration: 2.8,
        ease: "power2.inOut"
    });

    gsap.to(camera.rotation, {
        z: 0.5,
        duration: 2.8,
        ease: "power2.inOut",
        onComplete: () => {
            state.isTransitioning = false;
            state.currentScreen = 'account-select';
        }
    });

    gsap.delayedCall(2.8, () => {
        document.getElementById('screen-press-ps').classList.remove('active');
        document.getElementById('screen-account-select').classList.add('active');
        document.querySelector('.account-name-display').textContent = accounts[state.selectedAccount].name;
        initAccountShapes();
        showShapes();
    });

}

function transitionToMainMenu() {
    
    state.isTransitioning = true;
    // document.querySelector('.screen-account-select').classList.add('exit');

    gsap.to(camera.position, {
        z: -150,
        duration: 4.8,
        ease: "power2.inOut"
    });

    gsap.to(camera.rotation, {
        z: 3.8,
        duration: 4.8,
        ease: "power2.inOut",
        onComplete: () => {
            state.isTransitioning = false;
            state.currentScreen = 'main-menu';
        }
    });
}

export { transitionToAccountSelect, transitionToMainMenu };