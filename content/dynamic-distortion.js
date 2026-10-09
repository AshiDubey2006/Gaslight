window.DynamicDistortion = class {
    constructor(state) {
        this.state = state;
        this.personality = state.settings.personality || 'passive-aggressive';
        this.intensity = state.settings.intensity || 60;
        this.active = false;
        this.distortedElements = new Map();
        this.mouseX = 0;
        this.mouseY = 0;
    }

    start() {
        if (!this.state.settings.enabled || this.state.settings.intensity < 50) return;
        this.active = true;

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Apply distortion periodically
        setInterval(() => {
            if (this.active && Math.random() < this.intensity / 150) {
                this._applyRandomDistortion();
            }
        }, 2000);

        // Apply mouse-reactive distortion
        setInterval(() => {
            if (this.active && Math.random() < this.intensity / 200) {
                this._applyMouseDistortion();
            }
        }, 500);
    }

    stop() {
        this.active = false;
        this._revertAllDistortions();
    }

    _applyRandomDistortion() {
        const elements = document.querySelectorAll('ytd-thumbnail, ytd-video-renderer, #video-title');
        if (elements.length === 0) return;

        const element = elements[Math.floor(Math.random() * elements.length)];
        const effectType = Math.floor(Math.random() * 3);

        switch (effectType) {
            case 0:
                this._driftElement(element);
                break;
            case 1:
                this._warpElement(element);
                break;
            case 2:
                this._pulseElement(element);
                break;
        }
    }

    _applyMouseDistortion() {
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length === 0) return;

        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(this.mouseX - centerX, 2) +
                Math.pow(this.mouseY - centerY, 2)
            );

            if (distance < 200) {
                const intensity = (200 - distance) / 200;
                this._reactToMouse(element, intensity);
            }
        });
    }

    _driftElement(element) {
        if (this.distortedElements.has(element)) return;

        const originalTransform = element.style.transform || '';
        const driftX = (Math.random() - 0.5) * 10;
        const driftY = (Math.random() - 0.5) * 10;

        element.style.transition = 'transform 3s ease-in-out';
        element.style.transform = `${originalTransform} translate(${driftX}px, ${driftY}px)`;

        this.distortedElements.set(element, {
            type: 'drift',
            originalTransform: originalTransform
        });

        setTimeout(() => {
            this._revertElement(element);
        }, 3000);
    }

    _warpElement(element) {
        if (this.distortedElements.has(element)) return;

        const originalTransform = element.style.transform || '';
        const scaleX = 1 + (Math.random() - 0.5) * 0.2;
        const scaleY = 1 + (Math.random() - 0.5) * 0.2;
        const rotate = (Math.random() - 0.5) * 5;

        element.style.transition = 'transform 2s ease-in-out';
        element.style.transform = `${originalTransform} scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`;

        this.distortedElements.set(element, {
            type: 'warp',
            originalTransform: originalTransform
        });

        setTimeout(() => {
            this._revertElement(element);
        }, 2000);
    }

    _pulseElement(element) {
        if (this.distortedElements.has(element)) return;

        const originalFilter = element.style.filter || '';
        const brightness = 1 + (Math.random() - 0.5) * 0.3;
        const contrast = 1 + (Math.random() - 0.5) * 0.2;

        element.style.transition = 'filter 1.5s ease-in-out';
        element.style.filter = `${originalFilter} brightness(${brightness}) contrast(${contrast})`;

        this.distortedElements.set(element, {
            type: 'pulse',
            originalFilter: originalFilter
        });

        setTimeout(() => {
            this._revertElement(element);
        }, 1500);
    }

    _reactToMouse(element, intensity) {
        if (this.distortedElements.has(element)) return;

        const originalTransform = element.style.transform || '';
        const moveX = (this.mouseX - window.innerWidth / 2) * intensity * 0.05;
        const moveY = (this.mouseY - window.innerHeight / 2) * intensity * 0.05;

        element.style.transition = 'transform 0.5s ease-out';
        element.style.transform = `${originalTransform} translate(${moveX}px, ${moveY}px)`;

        this.distortedElements.set(element, {
            type: 'mouse',
            originalTransform: originalTransform
        });

        setTimeout(() => {
            this._revertElement(element);
        }, 500);
    }

    _revertElement(element) {
        const distortion = this.distortedElements.get(element);
        if (!distortion) return;

        element.style.transition = 'transform 1s ease-out, filter 1s ease-out';

        if (distortion.type === 'drift' || distortion.type === 'warp' || distortion.type === 'mouse') {
            element.style.transform = distortion.originalTransform;
        } else if (distortion.type === 'pulse') {
            element.style.filter = distortion.originalFilter;
        }

        this.distortedElements.delete(element);
    }

    _revertAllDistortions() {
        this.distortedElements.forEach((distortion, element) => {
            this._revertElement(element);
        });
    }

    // Personality-specific distortion patterns
    applyPersonalityPattern() {
        switch (this.personality) {
            case 'paranoid':
                this._paranoidPattern();
                break;
            case 'cosmic-horror':
                this._cosmicPattern();
                break;
            case 'evil-corp':
                this._evilCorpPattern();
                break;
            case 'passive-aggressive':
                this._passivePattern();
                break;
        }
    }

    _paranoidPattern() {
        // Sudden, jerky movements
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length > 0) {
            const element = elements[Math.floor(Math.random() * elements.length)];
            element.style.transition = 'transform 0.1s';
            element.style.transform = `translate(${(Math.random() - 0.5) * 5}px, ${(Math.random() - 0.5) * 5}px)`;
            setTimeout(() => {
                element.style.transform = '';
            }, 100);
        }
    }

    _cosmicPattern() {
        // Slow, floating movements
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length > 0) {
            const element = elements[Math.floor(Math.random() * elements.length)];
            element.style.transition = 'transform 4s ease-in-out';
            element.style.transform = `translateY(${(Math.random() - 0.5) * 10}px)`;
            setTimeout(() => {
                element.style.transform = '';
            }, 4000);
        }
    }

    _evilCorpPattern() {
        // Digital, grid-aligned movements
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length > 0) {
            const element = elements[Math.floor(Math.random() * elements.length)];
            const snapX = Math.round((Math.random() - 0.5) * 10 / 5) * 5;
            const snapY = Math.round((Math.random() - 0.5) * 10 / 5) * 5;
            element.style.transition = 'transform 0.3s steps(1)';
            element.style.transform = `translate(${snapX}px, ${snapY}px)`;
            setTimeout(() => {
                element.style.transform = '';
            }, 300);
        }
    }

    _passivePattern() {
        // Subtle, barely noticeable shifts
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length > 0) {
            const element = elements[Math.floor(Math.random() * elements.length)];
            element.style.transition = 'transform 2s ease-in-out';
            element.style.transform = `translate(${(Math.random() - 0.5) * 2}px, ${(Math.random() - 0.5) * 2}px)`;
            setTimeout(() => {
                element.style.transform = '';
            }, 2000);
        }
    }
};
