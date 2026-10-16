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
  enableSounds: false,
  enableTextReplacement: true,
  enableVisualEffects: true,
  enableRandomEvents: true,
  enableEscalation: true,
  enableMemory: true,
  enableDynamicDistortion: true,
  accessibilityMode: false,
  reduceMotion: false,
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
