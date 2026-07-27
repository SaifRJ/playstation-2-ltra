import gsap from 'gsap';

// UIObject
// Owns mesh, label state, selection behavior, and per-frame animation
// Labels: Screen owns the DOM element and passes it in via `labelEl`

class UIObject {
    constructor({
        mesh,
        labelText = '',
        labelEl = null,
        onSelect = null,

        // selector anchor
        orbitRadiusMultiplier = 1.35,   
        orbitRadiusOverride = null,     

        // glow
        glowable = true,
        glowMin = 1.0,
        glowMax = 1.4,
        glowSpeed = 1.2,               
        glowIdle = 1.0,                 

        // rotation
        idleRotation = false,
        rotationSpeedX = 0.001,
        rotationSpeedY = 0.001,
        rotationSpeedZ = 0.001,

        // object label
        labelSelectedOpacity = 1.0,
        labelUnselectedOpacity = 0.3,
        labelFadeDuration = 0.3
    } = {}) {
        if (!mesh) throw new Error('UIObject requires a mesh');

        this.mesh = mesh;
        this.labelText = labelText;
        this.labelEl = labelEl;
        this.onSelect = onSelect;

        this.orbitRadiusMultiplier = orbitRadiusMultiplier;
        this.orbitRadiusOverride = orbitRadiusOverride;

        this.glowable = glowable;
        this.glowMin = glowMin;
        this.glowMax = glowMax;
        this.glowSpeed = glowSpeed;
        this.glowIdle = glowIdle;

        this.idleRotation = idleRotation;
        this.rotationSpeedX = rotationSpeedX;
        this.rotationSpeedY = rotationSpeedY;
        this.rotationSpeedZ = rotationSpeedZ;

        this.labelSelectedOpacity = labelSelectedOpacity;
        this.labelUnselectedOpacity = labelUnselectedOpacity;
        this.labelFadeDuration = labelFadeDuration;

        this._selected = false;

        if (this.labelEl && this.labelText) {
            this.labelEl.textContent = this.labelText;
            this.labelEl.style.opacity = this.labelUnselectedOpacity;
        }
    }

    // selector orbits around anchor, can be overriden for different shapes with offset centers
    getAnchor() {
        return this.mesh.position;
    }

    // radius the selector orbits at
    getOrbitRadius() {
        if (this.orbitRadiusOverride !== null) return this.orbitRadiusOverride;
        if (this.mesh.geometry) {
            this.mesh.geometry.computeBoundingSphere();
            return this.mesh.geometry.boundingSphere.radius * this.orbitRadiusMultiplier;
        }
        return 2.5;
    }

    addToScene(parent) {
        parent.add(this.mesh);
    }

    removeFromScene(parent) {
        parent.remove(this.mesh);
    }

    // on select
    setSelected(isSelected) {
        if (this._selected === isSelected) return;
        this._selected = isSelected;

        if (this.labelEl) {
            gsap.to(this.labelEl, {
                opacity: isSelected ? this.labelSelectedOpacity : this.labelUnselectedOpacity,
                duration: this.labelFadeDuration
            });
        }
    }

    isSelected() {
        return this._selected;
    }

    update(t) {
        if (this.idleRotation) {
            this.mesh.rotation.x += this.rotationSpeedX;
            this.mesh.rotation.y += this.rotationSpeedY;
            this.mesh.rotation.z += this.rotationSpeedZ;
        }

        if (this.glowable && this.mesh.material?.userData?.glowUniform) {
            if (this._selected) {
                const range = this.glowMax - this.glowMin;
                this.mesh.material.userData.glowUniform.value =
                    this.glowMin + (Math.sin(t * this.glowSpeed) * 0.5 + 0.5) * range;
            } else {
                this.mesh.material.userData.glowUniform.value = this.glowIdle;
            }
        }
    }

    // input
    confirm() {
        this.onSelect?.(this);
    }
}

export { UIObject };