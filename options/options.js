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
  async exportSettings() {
    const data = await this.get();
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      settings: data.settings,
      progression: data.progression,
      memory: data.memory,
      storyLog: data.storyLog
    };
    return JSON.stringify(exportData, null, 2);
  },
  async importSettings(jsonString) {
    try {
      const importData = JSON.parse(jsonString);
      await this.save({
        settings: importData.settings || DEFAULT_SETTINGS,
        progression: importData.progression || DEFAULT_PROGRESSION,
        memory: importData.memory || DEFAULT_MEMORY,
        storyLog: importData.storyLog || []
      });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
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
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const target = document.getElementById(tab.dataset.tab);
                if (target) target.classList.add('active');
            });
        });
        
        const state = await StorageAPI.get();

        // Enable sounds checkbox
        const enableSoundsCheckbox = document.getElementById('enable-sounds');
        if (enableSoundsCheckbox) {
            enableSoundsCheckbox.checked = state.settings.enableSounds || false;
            enableSoundsCheckbox.addEventListener('change', async (e) => {
                await StorageAPI.updateSettings({ enableSounds: e.target.checked });
            });
        }

        // Accessibility mode checkbox
        const accessibilityCheckbox = document.getElementById('accessibility-mode');
        if (accessibilityCheckbox) {
            accessibilityCheckbox.checked = state.settings.accessibilityMode || false;
            accessibilityCheckbox.addEventListener('change', async (e) => {
                await StorageAPI.updateSettings({ accessibilityMode: e.target.checked });
            });
        }

        // Reduce motion checkbox
        const reduceMotionCheckbox = document.getElementById('reduce-motion');
        if (reduceMotionCheckbox) {
            reduceMotionCheckbox.checked = state.settings.reduceMotion || false;
            reduceMotionCheckbox.addEventListener('change', async (e) => {
                await StorageAPI.updateSettings({ reduceMotion: e.target.checked });
            });
        }
        
        const logContainer = document.getElementById('log-entries');
        if (logContainer) {
            if (state.storyLog && state.storyLog.length > 0) {
                state.storyLog.reverse().forEach(entry => {
                    const div = document.createElement('div');
                    div.className = 'log-entry';
                    div.innerHTML = `
                        <div class="log-time">[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.title}</div>
                        <div class="log-desc">${entry.description}</div>
                    `;
                    logContainer.appendChild(div);
                });
            } else {
                logContainer.innerHTML = '<p>No records found.</p>';
            }
        }
        
        const resetBtn = document.getElementById('reset-all');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (confirm("Are you sure? This will wipe all memory and progress.")) {
                    await StorageAPI.resetAll();
                    location.reload();
                }
            });
        }

        // Export settings
        const exportBtn = document.getElementById('export-settings');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                const settingsJson = await StorageAPI.exportSettings();
                const blob = new Blob([settingsJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gaslight-settings-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        // Import settings
        const importBtn = document.getElementById('import-settings');
        const importFile = document.getElementById('import-file');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });

            importFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const success = await StorageAPI.importSettings(event.target.result);
                        if (success) {
                            alert('Settings imported successfully!');
                            location.reload();
                        } else {
                            alert('Failed to import settings. Please check the file format.');
                        }
                    };
                    reader.readAsText(file);
                }
            });
        }
    } catch (err) {
        console.error("Options error:", err);
    }
});
