let engine = null;
let msgEngine = null;
let randomEvents = null;
let soundSystem = null;
let escalationSystem = null;
let memorySystem = null;
let dynamicDistortion = null;

async function init() {
    if (!window.StorageAPI) return; // safeguard
    const state = await window.StorageAPI.get();
    
    engine = new window.DistortionEngine(state);
    msgEngine = new window.MessageEngine(state);
    randomEvents = new window.RandomEvents(state);
    soundSystem = new window.SoundSystem(state);
    escalationSystem = new window.EscalationSystem(state);
    memorySystem = new window.MemorySystem(state);
    dynamicDistortion = new window.DynamicDistortion(state);

    // Track user interactions
    if (state.settings.enableMemory !== false) {
        document.addEventListener('click', () => {
            if (memorySystem) memorySystem.trackClick();
            // Resume audio context on user interaction
            if (soundSystem && state.settings.enableSounds) {
                soundSystem.init();
            }
        });

        // Show memory-based message periodically
        setInterval(() => {
            if (memorySystem && state.settings.enabled && state.settings.intensity > 40) {
                const message = memorySystem.generateMemoryMessage();
                if (message && msgEngine) {
                    msgEngine.showMessage(message);
                }
            }
        }, 60000); // Every minute
    }
    
    // Apply YouTube global UI Theme
    if (state.settings.enabled && state.settings.enableVisualEffects !== false && !state.settings.accessibilityMode) {
        const p = state.settings.personality || "passive-aggressive";
        const intensity = state.settings.intensity || 60;

        // Remove all theme and intensity classes
        document.documentElement.classList.remove(
            'theme-paranoid', 'theme-cosmic-horror', 'theme-evil-corp', 'theme-passive-aggressive',
            'intensity-low', 'intensity-medium', 'intensity-high'
        );

        // Add personality theme
        document.documentElement.classList.add(`theme-${p}`);

        // Add intensity class
        if (intensity <= 33) {
            document.documentElement.classList.add('intensity-low');
        } else if (intensity <= 66) {
            document.documentElement.classList.add('intensity-medium');
        } else {
            document.documentElement.classList.add('intensity-high');
        }

        // Store intensity as CSS variable for fine-tuned effects
        document.documentElement.style.setProperty('--intensity', intensity / 100);
    } else {
        document.documentElement.classList.remove(
            'theme-paranoid', 'theme-cosmic-horror', 'theme-evil-corp', 'theme-passive-aggressive',
            'intensity-low', 'intensity-medium', 'intensity-high'
        );
        document.documentElement.style.removeProperty('--intensity');
    }

    // Apply reduce motion if enabled
    if (state.settings.reduceMotion) {
        document.documentElement.classList.add('reduce-motion');
    }
    
    // Check if we should show loading overlay
    if (state.settings.enabled && state.settings.intensity > 10 && document.readyState === 'loading') {
        const pool = window.DICTIONARY?.loading?.["Loading..."] || ["Consulting the council...", "Waiting for the inevitable..."];
        const choice = pool[Math.floor(Math.random() * pool.length)];
        
        // Wait for body to be available to append loading screen
        const checkBodyInterval = setInterval(() => {
            if (document.body) {
                clearInterval(checkBodyInterval);
                msgEngine.showLoading(choice);
                engine.start(); // safe to start observing body now
            }
        }, 10);
        
        window.addEventListener('load', () => {
            msgEngine.hideLoading();
            if (state.settings.enableRandomEvents !== false) randomEvents.start();
            if (state.settings.enableSounds) soundSystem.init();
            if (state.settings.enableEscalation !== false) escalationSystem.start();
            if (state.settings.enableDynamicDistortion !== false && !state.settings.reduceMotion) dynamicDistortion.start();
            // Periodically play random sounds (only if enabled)
            if (state.settings.enableSounds) {
                setInterval(() => soundSystem.playRandomSound(), 10000);
            }
        });
    } else {
        // Document already loaded or no loading screen needed
        const checkBodyInterval = setInterval(() => {
            if (document.body) {
                clearInterval(checkBodyInterval);
                if (state.settings.enableTextReplacement !== false) engine.start();
                if (state.settings.enableRandomEvents !== false) randomEvents.start();
                if (state.settings.enableSounds) soundSystem.init();
                if (state.settings.enableEscalation !== false) escalationSystem.start();
                if (state.settings.enableDynamicDistortion !== false && !state.settings.reduceMotion) dynamicDistortion.start();
                // Periodically play random sounds (only if enabled)
                if (state.settings.enableSounds) {
                    setInterval(() => soundSystem.playRandomSound(), 10000);
                }
            }
        }, 10);
    }
    
    if (state.settings.enabled && state.settings.intensity > 10) {
        setTimeout(() => {
            const p = state.settings.personality || "passive-aggressive";
            if (window.PERSONALITY_MESSAGES && window.PERSONALITY_MESSAGES[p]) {
                const pool = window.PERSONALITY_MESSAGES[p];
                const choice = pool[Math.floor(Math.random() * pool.length)];
                msgEngine.showMessage(choice);
            } else {
                msgEngine.showMessage("We've been expecting you.");
            }
        }, 1500 + Math.random() * 2000); // Random delay between 1.5s and 3.5s
    }
}

// small delay to let other scripts execute
setTimeout(init, 50);

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.settings && changes.settings.newValue) {
            const newSettings = changes.settings.newValue;
            const oldSettings = changes.settings.oldValue || {};

            // Update sound system if enableSounds changed
            if (newSettings.enableSounds !== oldSettings.enableSounds && soundSystem) {
                if (newSettings.enableSounds) {
                    soundSystem.init();
                    setInterval(() => soundSystem.playRandomSound(), 10000);
                }
            }

            // Reload if personality or intensity changed
            if (newSettings.personality !== oldSettings.personality ||
                newSettings.intensity !== oldSettings.intensity ||
                newSettings.enabled !== oldSettings.enabled) {
                if (engine) engine.stop();
                if (randomEvents) randomEvents.stop();
                if (escalationSystem) escalationSystem.stop();
                if (dynamicDistortion) dynamicDistortion.stop();
                location.reload();
            }
        }
    }
});
