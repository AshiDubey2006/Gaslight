window.StorageAPI = {
  async get() {
    const data = await chrome.storage.local.get(['settings', 'progression', 'memory', 'privacy', 'storyLog']);
    return {
      settings: { ...window.DEFAULT_SETTINGS, ...(data.settings || {}) },
      progression: { ...window.DEFAULT_PROGRESSION, ...(data.progression || {}) },
      memory: { ...window.DEFAULT_MEMORY, ...(data.memory || {}) },
      privacy: data.privacy || { localOnly: true, lastResetDate: null },
      storyLog: data.storyLog || []
    };
  },
  
  async save(data) {
    await chrome.storage.local.set(data);
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
    await chrome.storage.local.clear();
    await this.save({
      settings: window.DEFAULT_SETTINGS,
      progression: window.DEFAULT_PROGRESSION,
      memory: window.DEFAULT_MEMORY,
      storyLog: [{ title: 'SYSTEM RESET', description: 'Memory wiped.', stage: 0, timestamp: Date.now() }]
    });
  }
};
