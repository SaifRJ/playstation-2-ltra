const screens = {};
let current = null;

function register(name, screen) {
    screens[name] = screen;
}

function getCurrent() {
    return current;
}

async function transitionTo(name) {
    const next = screens[name];
    if (!next) {
        console.warn(`No screen registered for "${name}"`);
        return;
    }
    if (current) await current.exit();
    current = next;
    await current.enter();
}

export const screenManager = { register, getCurrent, transitionTo };