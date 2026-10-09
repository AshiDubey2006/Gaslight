window.RandomEvents = class {
    constructor(state) {
        this.state = state;
        this.active = false;
        this.eventInterval = null;
        this.personality = state.settings.personality || 'passive-aggressive';
        this.intensity = state.settings.intensity || 60;
    }

    start() {
        if (!this.state.settings.enabled || this.intensity < 50) return;
        this.active = true;

        // Schedule random events based on intensity
        const interval = this._calculateInterval();
        this.eventInterval = setInterval(() => {
            if (Math.random() < this._getEventChance()) {
                this._triggerRandomEvent();
            }
        }, interval);
    }

    stop() {
        this.active = false;
        if (this.eventInterval) {
            clearInterval(this.eventInterval);
            this.eventInterval = null;
        }
    }

    _calculateInterval() {
        // Higher intensity = more frequent events (30s to 120s)
        return 120000 - (this.intensity * 900); // 120s at 0 intensity, 30s at 100 intensity
    }

    _getEventChance() {
        // Higher intensity = higher chance per interval
        return 0.1 + (this.intensity / 200); // 10% to 60% chance
    }

    _triggerRandomEvent() {
        const events = this._getEventsForPersonality();
        if (events.length === 0) return;

        const event = events[Math.floor(Math.random() * events.length)];
        event();
    }

    _getEventsForPersonality() {
        switch (this.personality) {
            case 'paranoid':
                return [
                    () => this._paranoidFlash(),
                    () => this._paranoidLayoutShift(),
                    () => this._paranoidScreenFlicker(),
                    () => this._paranoidRedFlash()
                ];
            case 'cosmic-horror':
                return [
                    () => this._cosmicGhostFade(),
                    () => this._cosmicTextFade(),
                    () => this._cosmicSlowMotion(),
                    () => this._cosmicEerieOverlay()
                ];
            case 'evil-corp':
                return [
                    () => this._evilCorpGlitch(),
                    () => this._evilCorpSystemAlert(),
                    () => this._evilCorpDataCorruption(),
                    () => this._evilCorpTerminalFlash()
                ];
            case 'passive-aggressive':
                return [
                    () => this._passiveTooltip(),
                    () => this._passiveJudgment(),
                    () => this._passiveSubtleShift(),
                    () => this._passiveReminder()
                ];
            default:
                return [];
        }
    }

    // Paranoid Events
    _paranoidFlash() {
        if (!document.body) return;
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 0, 0, 0.3);
            z-index: 9999999;
            pointer-events: none;
            animation: paranoid-flash 0.2s ease-out forwards;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }

    _paranoidLayoutShift() {
        if (!document.body) return;
        const originalTransform = document.body.style.transform;
        document.body.style.transition = 'transform 0.3s ease-in-out';
        document.body.style.transform = 'translateX(5px)';
        setTimeout(() => {
            document.body.style.transform = 'translateX(-5px)';
            setTimeout(() => {
                document.body.style.transform = originalTransform;
            }, 300);
        }, 300);
    }

    _paranoidScreenFlicker() {
        if (!document.body) return;
        document.body.style.filter = 'brightness(0.5)';
        setTimeout(() => {
            document.body.style.filter = 'brightness(1.5)';
            setTimeout(() => {
                document.body.style.filter = 'brightness(1)';
            }, 100);
        }, 100);
    }

    _paranoidRedFlash() {
        const header = document.querySelector('#ytd-masthead');
        if (header) {
            header.style.transition = 'background 0.2s';
            header.style.background = '#ff0000';
            setTimeout(() => {
                header.style.background = '';
            }, 200);
        }
    }

    // Cosmic Horror Events
    _cosmicGhostFade() {
        if (!document.body) return;
        const ghost = document.createElement('div');
        ghost.style.cssText = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: Georgia, serif;
            font-size: 48px;
            color: rgba(220, 220, 220, 0.3);
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            z-index: 9999999;
            pointer-events: none;
            animation: ghost-fade 3s ease-out forwards;
        `;
        ghost.textContent = ['The void remembers', 'You are not alone', 'It watches'][Math.floor(Math.random() * 3)];
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 3000);
    }

    _cosmicTextFade() {
        if (!document.body) return;
        const titles = document.querySelectorAll('#video-title, h3, ytd-video-renderer #video-title');
        if (titles.length > 0) {
            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            randomTitle.style.transition = 'opacity 2s ease-in-out';
            randomTitle.style.opacity = '0.3';
            setTimeout(() => {
                randomTitle.style.opacity = '1';
            }, 2000);
        }
    }

    _cosmicSlowMotion() {
        if (!document.body) return;
        document.body.style.transition = 'filter 2s ease-in-out';
        document.body.style.filter = 'blur(1px)';
        setTimeout(() => {
            document.body.style.filter = 'blur(0px)';
        }, 2000);
    }

    _cosmicEerieOverlay() {
        if (!document.body) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(5, 8, 12, 0.5) 100%);
            z-index: 9999998;
            pointer-events: none;
            animation: eerie-fade 2s ease-in-out forwards;
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 2000);
    }

    // Evil Corp Events
    _evilCorpGlitch() {
        if (!document.body) return;
        const glitch = document.createElement('div');
        glitch.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 255, 204, 0.1);
            z-index: 9999999;
            pointer-events: none;
            animation: glitch-flash 0.3s ease-out forwards;
        `;
        document.body.appendChild(glitch);
        setTimeout(() => glitch.remove(), 300);
    }

    _evilCorpSystemAlert() {
        if (!document.body) return;
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            bottom: 20px; left: 20px;
            background: rgba(0, 10, 20, 0.95);
            border: 1px solid #00ffcc;
            color: #00ffcc;
            padding: 15px 20px;
            font-family: 'Consolas', monospace;
            font-size: 12px;
            z-index: 9999999;
            pointer-events: none;
            animation: terminal-boot 0.3s ease-out;
        `;
        alert.innerHTML = `[SYS.ALERT] Anomaly detected<br>[TIME] ${new Date().toISOString()}`;
        document.body.appendChild(alert);
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s';
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    }

    _evilCorpDataCorruption() {
        if (!document.body) return;
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

    _evilCorpTerminalFlash() {
        if (!document.body) return;
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 255, 204, 0.2);
            z-index: 9999999;
            pointer-events: none;
            animation: terminal-flash 0.1s ease-out forwards;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }

    // Passive Aggressive Events
    _passiveTooltip() {
        if (!document.body) return;
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            bottom: 20px; right: 20px;
            background: #ffffff;
            color: #333;
            border: 1px solid #ddd;
            padding: 12px 16px;
            font-family: system-ui, sans-serif;
            font-size: 13px;
            z-index: 9999999;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slide-up 0.3s ease-out;
        `;
        const messages = [
            "We noticed you're still here.",
            "That's an interesting choice.",
            "You could be doing something productive.",
            "This is fine. Everything is fine.",
            "Your persistence is... noted."
        ];
        tooltip.textContent = messages[Math.floor(Math.random() * messages.length)];
        document.body.appendChild(tooltip);
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.5s';
            setTimeout(() => tooltip.remove(), 500);
        }, 3000);
    }

    _passiveJudgment() {
        if (!document.body) return;
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

    _passiveSubtleShift() {
        if (!document.body) return;
        const body = document.body;
        body.style.transition = 'transform 0.5s ease-in-out';
        body.style.transform = 'translateY(2px)';
        setTimeout(() => {
            body.style.transform = 'translateY(0)';
        }, 500);
    }

    _passiveReminder() {
        if (!document.body) return;
        const reminder = document.createElement('div');
        reminder.style.cssText = `
            position: fixed;
            top: 60px; right: 20px;
            background: #f5f5f5;
            color: #666;
            border: 1px solid #e0e0e0;
            padding: 8px 12px;
            font-family: system-ui, sans-serif;
            font-size: 11px;
            z-index: 9999999;
            pointer-events: none;
            animation: fade-in 0.3s ease-out;
        `;
        reminder.textContent = "Session time: " + Math.floor(performance.now() / 60000) + " minutes";
        document.body.appendChild(reminder);
        setTimeout(() => {
            reminder.style.opacity = '0';
            reminder.style.transition = 'opacity 0.5s';
            setTimeout(() => reminder.remove(), 500);
        }, 2000);
    }
};

// Add animation keyframes
if (document.head) {
    const style = document.createElement('style');
    style.textContent = `
@keyframes paranoid-flash {
    0% { opacity: 0.3; }
    100% { opacity: 0; }
}
@keyframes ghost-fade {
    0% { opacity: 0; filter: blur(10px); }
    20% { opacity: 0.3; filter: blur(2px); }
    80% { opacity: 0.3; filter: blur(3px); }
    100% { opacity: 0; filter: blur(10px); }
}
@keyframes eerie-fade {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
@keyframes glitch-flash {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0; }
}
@keyframes terminal-flash {
    0% { opacity: 0.2; }
    100% { opacity: 0; }
}
@keyframes terminal-boot {
    0% { transform: scaleY(0); opacity: 0; }
    100% { transform: scaleY(1); opacity: 1; }
}
@keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
@keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
}
`;
    document.head.appendChild(style);
}
