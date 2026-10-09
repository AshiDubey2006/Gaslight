window.EscalationSystem = class {
    constructor(state) {
        this.state = state;
        this.startTime = Date.now();
        this.currentLevel = 0;
        this.maxLevel = 3;
        this.checkInterval = null;
        this.escalationTimes = [10 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000]; // 10min, 30min, 60min
    }

    start() {
        if (!this.state.settings.enabled || this.state.settings.intensity < 40) return;

        // Check every 30 seconds for escalation
        this.checkInterval = setInterval(() => {
            this._checkEscalation();
        }, 30000);

        // Initial check
        this._checkEscalation();
    }

    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    _checkEscalation() {
        const elapsed = Date.now() - this.startTime;
        let newLevel = 0;

        for (let i = 0; i < this.escalationTimes.length; i++) {
            if (elapsed >= this.escalationTimes[i]) {
                newLevel = i + 1;
            }
        }

        if (newLevel > this.currentLevel && newLevel <= this.maxLevel) {
            this.currentLevel = newLevel;
            this._applyEscalationLevel(newLevel);
        }
    }

    _applyEscalationLevel(level) {
        const personality = this.state.settings.personality;
        const html = document.documentElement;

        // Add escalation class to HTML
        html.classList.remove('escalation-1', 'escalation-2', 'escalation-3');
        html.classList.add(`escalation-${level}`);

        // Trigger escalation-specific effects
        switch (personality) {
            case 'paranoid':
                this._paranoidEscalation(level);
                break;
            case 'cosmic-horror':
                this._cosmicEscalation(level);
                break;
            case 'evil-corp':
                this._evilCorpEscalation(level);
                break;
            case 'passive-aggressive':
                this._passiveEscalation(level);
                break;
        }
    }

    _paranoidEscalation(level) {
        switch (level) {
            case 1:
                // Level 1: More frequent glitches
                document.documentElement.style.setProperty('--glitch-frequency', '15s');
                break;
            case 2:
                // Level 2: Layout shifts
                document.documentElement.style.setProperty('--glitch-frequency', '10s');
                this._triggerLayoutShift();
                break;
            case 3:
                // Level 3: Full paranoia mode
                document.documentElement.style.setProperty('--glitch-frequency', '5s');
                this._triggerLayoutShift();
                break;
        }
    }

    _cosmicEscalation(level) {
        switch (level) {
            case 1:
                // Level 1: More eerie overlays
                document.documentElement.style.setProperty('--cosmic-opacity', '0.4');
                break;
            case 2:
                // Level 2: Text fades
                document.documentElement.style.setProperty('--cosmic-opacity', '0.5');
                this._triggerTextFade();
                break;
            case 3:
                // Level 3: Full cosmic horror
                document.documentElement.style.setProperty('--cosmic-opacity', '0.6');
                this._triggerTextFade();
                break;
        }
    }

    _evilCorpEscalation(level) {
        switch (level) {
            case 1:
                // Level 1: More system alerts
                document.documentElement.style.setProperty('--corp-glitch', '0.05');
                break;
            case 2:
                // Level 2: Data corruption
                document.documentElement.style.setProperty('--corp-glitch', '0.1');
                this._triggerDataCorruption();
                break;
            case 3:
                // Level 3: Full system breakdown
                document.documentElement.style.setProperty('--corp-glitch', '0.15');
                this._triggerDataCorruption();
                break;
        }
    }

    _passiveEscalation(level) {
        switch (level) {
            case 1:
                // Level 1: More tooltips
                document.documentElement.style.setProperty('--passive-frequency', '20s');
                break;
            case 2:
                // Level 2: More judgment
                document.documentElement.style.setProperty('--passive-frequency', '15s');
                this._triggerJudgment();
                break;
            case 3:
                // Level 3: Full passive-aggressive
                document.documentElement.style.setProperty('--passive-frequency', '10s');
                this._triggerJudgment();
                break;
        }
    }

    _triggerLayoutShift() {
        const body = document.body;
        body.style.transition = 'transform 0.5s ease-in-out';
        body.style.transform = 'translateX(3px)';
        setTimeout(() => {
            body.style.transform = 'translateX(-3px)';
            setTimeout(() => {
                body.style.transform = 'translateX(0)';
            }, 500);
        }, 500);
    }

    _triggerTextFade() {
        const titles = document.querySelectorAll('#video-title, h3');
        if (titles.length > 0) {
            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            randomTitle.style.transition = 'opacity 2s ease-in-out';
            randomTitle.style.opacity = '0.4';
            setTimeout(() => {
                randomTitle.style.opacity = '1';
            }, 2000);
        }
    }

    _triggerDataCorruption() {
        const videos = document.querySelectorAll('ytd-thumbnail img');
        if (videos.length > 0) {
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            randomVideo.style.transition = 'filter 0.5s';
            randomVideo.style.filter = 'hue-rotate(180deg) invert(1)';
            setTimeout(() => {
                randomVideo.style.filter = 'none';
            }, 500);
        }
    }

    _triggerJudgment() {
        const elements = document.querySelectorAll('ytd-thumbnail');
        if (elements.length > 0) {
            const randomElement = elements[Math.floor(Math.random() * elements.length)];
            randomElement.style.transition = 'filter 0.5s';
            randomElement.style.filter = 'grayscale(100%)';
            setTimeout(() => {
                randomElement.style.filter = 'none';
            }, 2000);
        }
    }

    getLevel() {
        return this.currentLevel;
    }

    getElapsedTime() {
        return Date.now() - this.startTime;
    }
};
