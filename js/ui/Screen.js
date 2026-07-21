import { setSelectorTarget } from './selector.js';


// Screen Class
// Owns a set of UIObjects (e.g. accountObjects[]), a DOM container, and lifecycle hooks
// Each Screen owns its own entry/exit animation, UIObject navigation, and responses to user input
// Transitioning between screens is handled externally by the screen manager
 
class Screen {
    constructor({
        name,
        domEl = null,    
        items = [],
        parent = null,          
        initialIndex = 0,
        onEnter = null,         
        onExit = null,          
        onConfirm = null,       
        onCancel = null,        
        onPSButton = null,      
        onNavigate = null,
        onUpdate = null,
    } = {}) {
        this.name = name;
        this.domEl = domEl;
        this.items = items;
        this.parent = parent;
        this.selectedIndex = initialIndex;

        this._onEnterCb = onEnter;
        this._onExitCb = onExit;
        this._onConfirm = onConfirm;
        this._onCancel = onCancel;
        this._onPSButton = onPSButton;
        this._onNavigate = onNavigate;
        this._active = false;
        this._onUpdate = onUpdate;
    }

    async enter() {
        if (this._active) return;
        this._active = true;

        if (this.domEl) this.domEl.classList.add('active');

        if (this.parent) {
            this.items.forEach(item => item.addToScene(this.parent));
        }

        if (this.items.length > 0) {
            this.items[this.selectedIndex].setSelected(true);
        }

        if (this._onEnterCb) await this._onEnterCb(this);

        if (this.items.length > 0) {
            setSelectorTarget(this.items[this.selectedIndex].mesh);
        }
    }

    async exit() {
        if (!this._active) return;
        this._active = false;

        if (this._onExitCb) await this._onExitCb(this);

        if (this.parent) {
            this.items.forEach(item => item.removeFromScene(this.parent));
        }

        if (this.domEl) this.domEl.classList.remove('active');
    }

    // nav
    navigate(direction) {
           if (this.items.length === 0) return;
    const newIndex = this.selectedIndex + direction;
    if (newIndex < 0 || newIndex >= this.items.length) return;

    this.items[this.selectedIndex].setSelected(false);
    this.selectedIndex = newIndex;
    this.items[this.selectedIndex].setSelected(true);

    if (this._onNavigate) this._onNavigate(this.selectedIndex, direction, this);
    setSelectorTarget(this.items[this.selectedIndex].mesh);                    
    }

    confirm() {
        if (this._onConfirm) {
            const selected = this.items[this.selectedIndex] ?? null;
            this._onConfirm(selected, this);
        }
    }

    cancel() {
        if (this._onCancel) this._onCancel(this);
    }

    psButton() {
        if (this._onPSButton) this._onPSButton(this);
    }

    update(t) {
    if (!this._active) return;
    this.items.forEach(item => item.update(t));
    if (this._onUpdate) this._onUpdate(t, this);
    }
    
    isActive() {
        return this._active;
    }
}

export { Screen };