import os
import base64

# A solid green 16x16 PNG
green_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIklEQVQ4T2NkYGD4z0ABYBw1gGE0gWE0gWE0gWE0gWEEAQAQoA0B4+n52wAAAABJRU5ErkJggg=="
png_data = base64.b64decode(green_png_base64)

# We will bundle constants and storage into popup.js and options.js to prevent any script loading errors
bundled_js_header = """
const STAGES = { NORMAL: 0, SUSPICIOUS: 1, SOMETHING_IS_WRONG: 2, THE_INTERNET_KNOWS: 3 };
const DEFAULT_SETTINGS = { enabled: true, personality: "passive-aggressive", intensity: 60, showMessages: true, enabledSites: [], disabledSites: [], excludedCategories: [] };
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
"""

files = {
    "popup/popup.js": bundled_js_header + """
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const state = await StorageAPI.get();
        
        const masterToggle = document.getElementById('master-toggle');
        const personality = document.getElementById('personality');
        const intensity = document.getElementById('intensity');
        const intensityVal = document.getElementById('intensity-val');
        const openOptions = document.getElementById('open-options');
        
        if (masterToggle) masterToggle.checked = state.settings.enabled;
        if (personality) personality.value = state.settings.personality;
        if (intensity) intensity.value = state.settings.intensity;
        if (intensityVal) intensityVal.textContent = state.settings.intensity;
        
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
        
        if (openOptions) openOptions.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    } catch(err) {
        console.error("Popup error:", err);
    }
});
""",
    
    "options/options.js": bundled_js_header + """
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
    } catch (err) {
        console.error("Options error:", err);
    }
});
""",

    "popup/index.html": """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../styles/global.css">
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div class="header">
        <h1>gaslight.exe</h1>
        <div class="status-indicator">REALITY STATUS: <span id="status-text">QUESTIONABLE</span></div>
    </div>
    
    <div class="controls">
        <label class="toggle-container">
            Master Enable
            <input type="checkbox" id="master-toggle">
            <span class="checkmark"></span>
        </label>
        
        <div class="setting-group">
            <label>Personality</label>
            <select id="personality">
                <option value="passive-aggressive">Passive-Aggressive</option>
                <option value="paranoid">Paranoid Internet</option>
                <option value="cosmic-horror">Cosmic Horror</option>
                <option value="evil-corp">Evil Corporate</option>
            </select>
        </div>

        <div class="setting-group">
            <label>Chaos Intensity (<span id="intensity-val">60</span>)</label>
            <input type="range" id="intensity" min="0" max="100" value="60">
        </div>
        
        <div class="stage-info">
            <p>STAGE: <span id="stage-name">NORMAL</span></p>
        </div>
        
        <div class="actions">
            <button id="open-options">Settings & Story Log</button>
        </div>
    </div>
    <script src="popup.js"></script>
</body>
</html>
""",

    "options/index.html": """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>gaslight.exe - Settings</title>
    <link rel="stylesheet" href="../styles/global.css">
    <link rel="stylesheet" href="options.css">
</head>
<body>
    <div class="container">
        <h1>gaslight.exe // SYSTEM CONFIGURATION</h1>
        
        <div class="tabs">
            <button class="tab-btn active" data-tab="settings">Settings</button>
            <button class="tab-btn" data-tab="story">Story Log</button>
            <button class="tab-btn" data-tab="privacy">Privacy</button>
        </div>
        
        <div id="settings" class="tab-content active">
            <h2>General Settings</h2>
            <button id="reset-all">RESET ENTIRE EXPERIENCE</button>
        </div>
        
        <div id="story" class="tab-content">
            <h2>The Descent Log</h2>
            <div id="log-entries"></div>
        </div>
        
        <div id="privacy" class="tab-content">
            <h2>Privacy</h2>
            <p>All data is stored locally. Nothing is sent to any server.</p>
        </div>
    </div>
    <script src="options.js"></script>
</body>
</html>
"""
}

# Write the bundled JS and updated HTML files
for path, content in files.items():
    full_path = os.path.join("c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")

# Overwrite icons with a valid solid color PNG so it shows up in Chrome properly
for size in [16, 48, 128]:
    with open(f"c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe/icons/icon{size}.png", "wb") as f:
        f.write(png_data)

print("Files successfully updated to use bundled JS logic to prevent execution errors.")
