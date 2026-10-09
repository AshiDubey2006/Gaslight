import os
import base64

files = {
    "shared/constants.js": """
const STAGES = {
  NORMAL: 0,
  SUSPICIOUS: 1,
  SOMETHING_IS_WRONG: 2,
  THE_INTERNET_KNOWS: 3
};

const DEFAULT_SETTINGS = {
  enabled: true,
  personality: "passive-aggressive",
  intensity: 60,
  showMessages: true,
  enabledSites: [],
  disabledSites: [],
  excludedCategories: []
};

const DEFAULT_PROGRESSION = {
  stage: STAGES.NORMAL,
  experience: 0,
  discoveredClues: [],
  endingUnlocked: false
};

const DEFAULT_MEMORY = {
  totalSessions: 0,
  siteVisitCounts: {},
  sessionEvents: {},
  lastSeenMessages: [],
  firstActivationDate: null
};

window.STAGES = STAGES;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.DEFAULT_PROGRESSION = DEFAULT_PROGRESSION;
window.DEFAULT_MEMORY = DEFAULT_MEMORY;
""",

    "shared/storage.js": """
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
""",

    "shared/dialogue.js": """
window.DICTIONARY = {
  authentication: {
    "Sign in": ["Confess", "Acknowledge yourself", "Submit credentials"],
    "Log in": ["Re-enter the premises", "Resume the charade"],
    "Create account": ["Establish an identity", "Become someone else"]
  },
  advertising: {
    "Skip Ad": ["Accept Your Fate", "Flee"],
    "Sponsored": ["Financially Motivated", "Paid to be here"],
    "Learn more": ["Discover the consequences", "Seek forbidden knowledge"]
  },
  cookies: {
    "Accept all": ["Surrender your secrets", "Give up"],
    "Manage preferences": ["Negotiate the terms", "Pretend you have a choice"],
    "Privacy settings": ["Things we are allowed to know", "Illusion of control"]
  },
  navigation: {
    "Continue": ["Proceed. We insist.", "March forward"],
    "Next": ["Further into the problem", "Descend"],
    "Go back": ["Retreat", "Cowardice"],
    "Refresh": ["Question reality again", "Denial"]
  },
  loading: {
    "Loading...": ["Consulting the council...", "Waiting for the inevitable..."],
    "Please wait": ["Your patience is being evaluated", "Stand still"],
    "Processing...": ["The machinery has noticed you", "Grinding..."]
  },
  confirmation: {
    "Are you sure?": ["You have done this before.", "Think carefully."],
    "Cancel": ["Pretend this never happened", "Erase"],
    "Save changes": ["Preserve the evidence", "Seal the pact"]
  }
};
""",

    "content/distortion-engine.js": """
window.DistortionEngine = class {
    constructor(state) {
        this.state = state;
        this.originalNodes = new Map();
        this.observer = null;
    }
    
    start() {
        if (!this.state.settings.enabled || this.state.settings.intensity === 0) return;
        this.processNode(document.body);
        
        this.observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => this.processNode(node));
                }
            }
        });
        
        this.observer.observe(document.body, { childList: true, subtree: true });
    }
    
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.revertAll();
    }
    
    processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            for (let category in window.DICTIONARY) {
                if (window.DICTIONARY[category][text]) {
                    const replacements = window.DICTIONARY[category][text];
                    const choice = replacements[Math.floor(Math.random() * replacements.length)];
                    this.originalNodes.set(node, node.textContent);
                    node.textContent = node.textContent.replace(text, choice);
                    break;
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(node.tagName)) return;
            node.childNodes.forEach(child => this.processNode(child));
        }
    }
    
    revertAll() {
        for (let [node, originalText] of this.originalNodes.entries()) {
            if (node.isConnected) {
                node.textContent = originalText;
            }
        }
        this.originalNodes.clear();
    }
};
""",

    "content/message-engine.js": """
window.MessageEngine = class {
    constructor(state) {
        this.state = state;
    }
    
    showMessage(text) {
        if (!this.state.settings.enabled || !this.state.settings.showMessages) return;
        
        const el = document.createElement('div');
        el.className = 'gaslight-notification';
        el.textContent = text;
        
        document.body.appendChild(el);
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.5s';
            setTimeout(() => el.remove(), 500);
        }, 5000);
    }
};
""",

    "content/content.js": """
let engine = null;
let msgEngine = null;

async function init() {
    if (!window.StorageAPI) return; // safeguard
    const state = await window.StorageAPI.get();
    
    engine = new window.DistortionEngine(state);
    msgEngine = new window.MessageEngine(state);
    
    engine.start();
    
    if (state.settings.enabled && state.settings.intensity > 50) {
        setTimeout(() => {
            msgEngine.showMessage("We've been expecting you.");
        }, 3000);
    }
}

// small delay to let other scripts execute
setTimeout(init, 50);

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (engine) engine.stop();
        init();
    }
});
""",

    "content/content.css": """
.gaslight-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #000;
    border: 1px solid #39ff14;
    color: #39ff14;
    padding: 15px;
    font-family: monospace;
    z-index: 9999999;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
    pointer-events: auto;
    animation: glitch-in 0.2s ease-out;
}
@keyframes glitch-in {
    0% { transform: translate(5px, 5px); opacity: 0; }
    50% { transform: translate(-5px, -5px); opacity: 1; }
    100% { transform: translate(0, 0); }
}
""",

    "background/service-worker.js": """
chrome.runtime.onInstalled.addListener(() => {
    console.log("gaslight.exe installed");
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
    
    <!-- Loaded sequentially instead of ES modules -->
    <script src="../shared/constants.js"></script>
    <script src="../shared/storage.js"></script>
    <script src="popup.js"></script>
</body>
</html>
""",

    "popup/popup.css": """
body {
    width: 300px;
    padding: 15px;
}
.header {
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    margin-bottom: 15px;
}
h1 {
    margin: 0;
    font-size: 1.5em;
    color: #39ff14;
}
.status-indicator {
    font-size: 0.8em;
    color: #888;
}
.toggle-container {
    display: block;
    margin-bottom: 15px;
}
.setting-group {
    margin-bottom: 15px;
}
.setting-group label {
    display: block;
    font-size: 0.9em;
    margin-bottom: 5px;
}
select, input[type="range"] {
    width: 100%;
    background: #111;
    color: #39ff14;
    border: 1px solid #333;
}
button {
    width: 100%;
    padding: 8px;
    background: #111;
    color: #eee;
    border: 1px solid #333;
    cursor: pointer;
}
button:hover {
    background: #222;
    border-color: #39ff14;
}
.stage-info {
    margin-bottom: 15px;
    font-family: monospace;
    color: #ff3333;
}
""",

    "popup/popup.js": """
document.addEventListener('DOMContentLoaded', async () => {
    const state = await window.StorageAPI.get();
    
    const masterToggle = document.getElementById('master-toggle');
    const personality = document.getElementById('personality');
    const intensity = document.getElementById('intensity');
    const intensityVal = document.getElementById('intensity-val');
    const openOptions = document.getElementById('open-options');
    
    masterToggle.checked = state.settings.enabled;
    personality.value = state.settings.personality;
    intensity.value = state.settings.intensity;
    intensityVal.textContent = state.settings.intensity;
    
    masterToggle.addEventListener('change', async (e) => {
        await window.StorageAPI.updateSettings({ enabled: e.target.checked });
    });
    
    personality.addEventListener('change', async (e) => {
        await window.StorageAPI.updateSettings({ personality: e.target.value });
    });
    
    intensity.addEventListener('input', async (e) => {
        intensityVal.textContent = e.target.value;
        await window.StorageAPI.updateSettings({ intensity: parseInt(e.target.value, 10) });
    });
    
    openOptions.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
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
    
    <!-- Loaded sequentially instead of ES modules -->
    <script src="../shared/constants.js"></script>
    <script src="../shared/storage.js"></script>
    <script src="options.js"></script>
</body>
</html>
""",

    "options/options.css": """
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
.tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
}
.tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-family: monospace;
}
.tab-btn.active {
    color: #39ff14;
    border-bottom: 2px solid #39ff14;
}
.tab-content {
    display: none;
}
.tab-content.active {
    display: block;
}
.log-entry {
    border-left: 2px solid #39ff14;
    padding-left: 10px;
    margin-bottom: 15px;
}
.log-time {
    color: #888;
    font-size: 0.8em;
}
""",

    "options/options.js": """
document.addEventListener('DOMContentLoaded', async () => {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    const state = await window.StorageAPI.get();
    
    // Render story log
    const logContainer = document.getElementById('log-entries');
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
    
    document.getElementById('reset-all').addEventListener('click', async () => {
        if (confirm("Are you sure? This will wipe all memory and progress.")) {
            await window.StorageAPI.resetAll();
            location.reload();
        }
    });
});
""",

    "styles/global.css": """
body {
    background-color: #050505;
    color: #eee;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
}
h1, h2, h3 {
    font-family: monospace;
    font-weight: normal;
}
* {
    box-sizing: border-box;
}
::selection {
    background: #39ff14;
    color: #000;
}
""",

    "manifest.json": """{
  "manifest_version": 3,
  "name": "gaslight.exe",
  "version": "1.0.0",
  "description": "The internet is fine. You're just remembering it wrong.",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_title": "gaslight.exe",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "options/index.html",
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": [
        "shared/constants.js",
        "shared/storage.js",
        "shared/dialogue.js",
        "content/distortion-engine.js",
        "content/message-engine.js",
        "content/content.js"
      ],
      "css": ["content/content.css"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
"""
}

# Icon data - 1x1 transparent PNG just as a placeholder
png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
png_data = base64.b64decode(png_base64)

for path, content in files.items():
    full_path = os.path.join("c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")

# Write icons
os.makedirs("c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe/icons", exist_ok=True)
for size in [16, 48, 128]:
    with open(f"c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe/icons/icon{size}.png", "wb") as f:
        f.write(png_data)

print("Project files generated with fixes.")
