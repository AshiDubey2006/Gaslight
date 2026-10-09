window.MessageEngine = class {
    constructor(state) {
        this.state = state;
    }
    
    showMessage(text) {
        if (!this.state.settings.enabled || !this.state.settings.showMessages) return;
        
        const personality = this.state.settings.personality || 'passive-aggressive';
        const el = document.createElement('div');
        el.className = `gaslight-notification theme-${personality}`;
        el.innerHTML = this._buildMessageHTML(text, personality);
        
        document.body.appendChild(el);
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 1s ease-out';
            setTimeout(() => el.remove(), 1000);
        }, 5000);
    }
    
    _buildMessageHTML(text, personality) {
        if (personality === 'paranoid') {
            return `<div class="crt-scanline"></div>
                    <div class="glitch-text">${text}</div>`;
        } else if (personality === 'cosmic-horror') {
            return `${text}`;
        } else if (personality === 'evil-corp') {
            const time = new Date().toISOString();
            return `<div class="sys-log">[SYS.WARN] ${time}</div>
                    <div class="sys-body">${text}<span class="blink-cursor">_</span></div>`;
        } else {
            return `${text}`;
        }
    }
    
    showLoading(text) {
        if (!this.state.settings.enabled) return;
        if (this.loadingEl) return;
        
        this.loadingEl = document.createElement('div');
        this.loadingEl.className = 'gaslight-loading-overlay';
        this.loadingEl.innerHTML = `<div class="gaslight-loading-text">${text}</div>`;
        
        document.body.appendChild(this.loadingEl);
    }
    
    hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.style.opacity = '0';
            setTimeout(() => {
                if (this.loadingEl) this.loadingEl.remove();
                this.loadingEl = null;
            }, 500);
        }
    }
};
