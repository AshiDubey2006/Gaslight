const STAGES = { NORMAL: 0, SUSPICIOUS: 1, SOMETHING_IS_WRONG: 2, THE_INTERNET_KNOWS: 3 };
const DEFAULT_SETTINGS = { enabled: true, personality: "passive-aggressive", intensity: 60, showMessages: true, enableSounds: false, enableTextReplacement: true, enableVisualEffects: true, enableRandomEvents: true, enableEscalation: true, enableMemory: true, enableDynamicDistortion: true, accessibilityMode: false, reduceMotion: false, enabledSites: [], disabledSites: [], excludedCategories: [] };
const DEFAULT_PROGRESSION = { stage: STAGES.NORMAL, experience: 0, discoveredClues: [], endingUnlocked: false };
const DEFAULT_MEMORY = { totalSessions: 0, siteVisitCounts: {}, sessionEvents: {}, lastSeenMessages: [], firstActivationDate: null };

const StorageAPI = {
  async get() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings', 'progression', 'memory', 'privacy', 'storyLog'], (data) => {
        resolve({
          settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
          progression: { ...DEFAULT_PROGRESSION, ...(data.progression || {}) },
          memory: { ...DEFAULT_MEMORY, ...(data.memory || {}) },
          privacy: data.privacy || { localOnly: true, lastResetDate: null },
          storyLog: data.storyLog || []
        });
      });
    });
  },
  async save(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  },
  async updateSettings(newSettings) {
    const data = await this.get();
    await this.save({ settings: { ...data.settings, ...newSettings } });
  },
  async addStoryLog(entry) {
    const data = await this.get();
    const log = data.storyLog || [];
    log.push({ timestamp: Date.now(), ...entry });
    await this.save({ storyLog: log });
  },
  async resetAll() {
    await new Promise(resolve => chrome.storage.local.clear(resolve));
    await this.save({
      settings: DEFAULT_SETTINGS,
      progression: DEFAULT_PROGRESSION,
      memory: DEFAULT_MEMORY,
      storyLog: [{ title: 'SYSTEM RESET', description: 'Memory wiped.', stage: 0, timestamp: Date.now() }]
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const state = await StorageAPI.get();
        
        const masterToggle = document.getElementById('master-toggle');
        const personality = document.getElementById('personality');
        const intensity = document.getElementById('intensity');
        const intensityVal = document.getElementById('intensity-val');
        const soundToggle = document.getElementById('sound-toggle');
        const textReplacementToggle = document.getElementById('text-replacement-toggle');
        const visualEffectsToggle = document.getElementById('visual-effects-toggle');
        const randomEventsToggle = document.getElementById('random-events-toggle');
        const escalationToggle = document.getElementById('escalation-toggle');
        const memoryToggle = document.getElementById('memory-toggle');
        const distortionToggle = document.getElementById('distortion-toggle');
        const accessibilityToggle = document.getElementById('accessibility-toggle');
        const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
        const openOptions = document.getElementById('open-options');

        if (masterToggle) masterToggle.checked = state.settings.enabled;
        if (personality) personality.value = state.settings.personality;
        if (intensity) intensity.value = state.settings.intensity;
        if (intensityVal) intensityVal.textContent = state.settings.intensity;
        if (soundToggle) soundToggle.checked = state.settings.enableSounds || false;
        if (textReplacementToggle) textReplacementToggle.checked = state.settings.enableTextReplacement !== false;
        if (visualEffectsToggle) visualEffectsToggle.checked = state.settings.enableVisualEffects !== false;
        if (randomEventsToggle) randomEventsToggle.checked = state.settings.enableRandomEvents !== false;
        if (escalationToggle) escalationToggle.checked = state.settings.enableEscalation !== false;
        if (memoryToggle) memoryToggle.checked = state.settings.enableMemory !== false;
        if (distortionToggle) distortionToggle.checked = state.settings.enableDynamicDistortion !== false;
        if (accessibilityToggle) accessibilityToggle.checked = state.settings.accessibilityMode || false;
        if (reduceMotionToggle) reduceMotionToggle.checked = state.settings.reduceMotion || false;
        
        if (masterToggle) masterToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enabled: e.target.checked });
        });
        
        if (personality) personality.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ personality: e.target.value });
        });
        
        if (intensity) intensity.addEventListener('input', async (e) => {
            if (intensityVal) intensityVal.textContent = e.target.value;
            await StorageAPI.updateSettings({ intensity: parseInt(e.target.value, 10) });
        });

        if (soundToggle) soundToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableSounds: e.target.checked });
        });

        if (textReplacementToggle) textReplacementToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableTextReplacement: e.target.checked });
        });

        if (visualEffectsToggle) visualEffectsToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableVisualEffects: e.target.checked });
        });

        if (randomEventsToggle) randomEventsToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableRandomEvents: e.target.checked });
        });

        if (escalationToggle) escalationToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableEscalation: e.target.checked });
        });

        if (memoryToggle) memoryToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableMemory: e.target.checked });
        });

        if (distortionToggle) distortionToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ enableDynamicDistortion: e.target.checked });
        });

        if (accessibilityToggle) accessibilityToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ accessibilityMode: e.target.checked });
        });

        if (reduceMotionToggle) reduceMotionToggle.addEventListener('change', async (e) => {
            await StorageAPI.updateSettings({ reduceMotion: e.target.checked });
        });
        
        if (openOptions) openOptions.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    } catch(err) {
        console.error("Popup error:", err);
    }
});
