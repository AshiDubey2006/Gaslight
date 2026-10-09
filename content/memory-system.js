window.MemorySystem = class {
    constructor(state) {
        this.state = state;
        this.sessionId = Date.now();
        this.userActions = [];
        this.watchedVideos = [];
        this.searchQueries = [];
        this.clicks = 0;
        this.lastVideoTitle = null;
    }

    trackAction(actionType, data = {}) {
        const action = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            type: actionType,
            data: data
        };

        this.userActions.push(action);

        // Keep only last 100 actions
        if (this.userActions.length > 100) {
            this.userActions.shift();
        }

        // Sync with storage periodically
        if (this.userActions.length % 10 === 0) {
            this._syncToStorage();
        }
    }

    trackVideoWatch(title, channel) {
        this.watchedVideos.push({
            timestamp: Date.now(),
            title: title,
            channel: channel
        });

        this.lastVideoTitle = title;

        // Keep only last 50 videos
        if (this.watchedVideos.length > 50) {
            this.watchedVideos.shift();
        }
    }

    trackSearch(query) {
        this.searchQueries.push({
            timestamp: Date.now(),
            query: query
        });

        // Keep only last 20 searches
        if (this.searchQueries.length > 20) {
            this.searchQueries.shift();
        }
    }

    trackClick() {
        this.clicks++;
    }

    getRecentVideos(count = 5) {
        return this.watchedVideos.slice(-count);
    }

    getRecentSearches(count = 5) {
        return this.searchQueries.slice(-count);
    }

    getClickCount() {
        return this.clicks;
    }

    getSessionDuration() {
        return Date.now() - this.sessionId;
    }

    generateMemoryMessage() {
        const personality = this.state.settings.personality;
        const recentVideos = this.getRecentVideos(3);
        const recentSearches = this.getRecentSearches(3);
        const duration = this.getSessionDuration();
        const durationMinutes = Math.floor(duration / 60000);

        let message = '';

        switch (personality) {
            case 'paranoid':
                if (recentVideos.length > 0) {
                    const lastVideo = recentVideos[recentVideos.length - 1];
                    message = `We noticed you watched "${lastVideo.title}". That's interesting.`;
                } else if (recentSearches.length > 0) {
                    const lastSearch = recentSearches[recentSearches.length - 1];
                    message = `You searched for "${lastSearch.query}". We remember.`;
                } else if (durationMinutes > 5) {
                    message = `You've been here for ${durationMinutes} minutes. That's a long time.`;
                } else {
                    message = `We've been tracking your ${this.clicks} clicks.`;
                }
                break;

            case 'cosmic-horror':
                if (recentVideos.length > 0) {
                    const lastVideo = recentVideos[recentVideos.length - 1];
                    message = `The void remembers "${lastVideo.title}". It has been noted.`;
                } else if (recentSearches.length > 0) {
                    const lastSearch = recentSearches[recentSearches.length - 1];
                    message = `Your search for "${lastSearch.query}" echoes in the darkness.`;
                } else if (durationMinutes > 5) {
                    message = `${durationMinutes} minutes have passed in the void. Time flows differently here.`;
                } else {
                    message = `The void has witnessed ${this.clicks} of your actions.`;
                }
                break;

            case 'evil-corp':
                if (recentVideos.length > 0) {
                    const lastVideo = recentVideos[recentVideos.length - 1];
                    message = `[SYS.LOG] User accessed content: "${lastVideo.title}". Noted in database.`;
                } else if (recentSearches.length > 0) {
                    const lastSearch = recentSearches[recentSearches.length - 1];
                    message = `[SYS.LOG] Search query logged: "${lastSearch.query}". Data collected.`;
                } else if (durationMinutes > 5) {
                    message = `[SYS.LOG] Session duration: ${durationMinutes} minutes. Productivity metrics pending.`;
                } else {
                    message = `[SYS.LOG] User interaction count: ${this.clicks}. Engagement metrics updated.`;
                }
                break;

            case 'passive-aggressive':
                if (recentVideos.length > 0) {
                    const lastVideo = recentVideos[recentVideos.length - 1];
                    message = `We saw you watching "${lastVideo.title}". Interesting choice.`;
                } else if (recentSearches.length > 0) {
                    const lastSearch = recentSearches[recentSearches.length - 1];
                    message = `You searched for "${lastSearch.query}". That's one way to spend your time.`;
                } else if (durationMinutes > 5) {
                    message = `You've been here for ${durationMinutes} minutes. Surely you have something better to do?`;
                } else {
                    message = `${this.clicks} clicks so far. We suppose that's productive.`;
                }
                break;
        }

        return message;
    }

    _syncToStorage() {
        chrome.storage.local.get(['memory'], (data) => {
            const memory = data.memory || {
                totalSessions: 0,
                siteVisitCounts: {},
                sessionEvents: {},
                lastSeenMessages: [],
                firstActivationDate: null
            };

            memory.sessionEvents[this.sessionId] = {
                actions: this.userActions,
                watchedVideos: this.watchedVideos,
                searchQueries: this.searchQueries,
                clicks: this.clicks,
                duration: this.getSessionDuration()
            };

            chrome.storage.local.set({ memory: memory });
        });
    }

    async loadFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['memory'], (data) => {
                const memory = data.memory || {};
                this.watchedVideos = memory.watchedVideos || [];
                this.searchQueries = memory.searchQueries || [];
                this.clicks = memory.clicks || 0;
                resolve();
            });
        });
    }
};
