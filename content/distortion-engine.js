window.DistortionEngine = class {
    constructor(state) {
        this.state = state;
        this.originalNodes = new Map();
        this.observer = null;
        this.personality = state.settings.personality || 'passive-aggressive';
        this.processQueue = [];
        this.isProcessing = false;
    }
    
    start() {
        if (!this.state.settings.enabled || this.state.settings.intensity === 0) return;
        this.processNode(document.body);

        this.observer = new MutationObserver(mutations => {
            // Batch mutations to improve performance
            this.processQueue.push(...mutations);
            if (!this.isProcessing) {
                this.isProcessing = true;
                requestAnimationFrame(() => this._processQueue());
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['title', 'placeholder', 'aria-label']
        });
    }

    _processQueue() {
        const batchSize = 50; // Process 50 mutations at a time
        const batch = this.processQueue.splice(0, batchSize);

        for (let mutation of batch) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => this.processNode(node));
            } else if (mutation.type === 'attributes') {
                this.processNode(mutation.target);
            }
        }

        if (this.processQueue.length > 0) {
            requestAnimationFrame(() => this._processQueue());
        } else {
            this.isProcessing = false;
        }
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
            if (!text) return;
            const textLower = text.toLowerCase();

            // Skip replacement based on intensity (random chance)
            const intensity = this.state.settings.intensity || 60;
            const skipChance = (100 - intensity) / 100;
            if (Math.random() < skipChance * 0.5) return; // Skip some replacements at lower intensity

            // Skip very short texts (less than 2 chars) for performance
            if (text.length < 2) return;

            // Determine which dictionary categories to check
            const categories = ['general'];
            if (this.personality === 'paranoid') {
                categories.push('youtube_paranoid', 'counts_paranoid');
            } else if (this.personality === 'evil-corp') {
                categories.push('youtube_evil_corp', 'counts_evil_corp');
            } else if (this.personality === 'passive-aggressive') {
                categories.push('youtube_passive_aggressive', 'counts_passive_aggressive');
            } else if (this.personality === 'cosmic-horror') {
                categories.push('youtube', 'counts');
            }

            for (let category of categories) {
                if (!window.DICTIONARY[category]) continue;
                for (let key in window.DICTIONARY[category]) {
                    if (key.toLowerCase() === textLower) {
                        const replacements = window.DICTIONARY[category][key];
                        const choice = replacements[Math.floor(Math.random() * replacements.length)];
                        this.originalNodes.set(node, node.textContent);
                        // Maintain original casing if possible, or just replace entirely.
                        // Replacing entirely is fine since gaslight changes words.
                        node.textContent = node.textContent.replace(text, choice);
                        return; // Done
                    }
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Check attributes on all elements (including inputs)
            ['title', 'placeholder', 'aria-label'].forEach(attr => {
                if (node.hasAttribute && node.hasAttribute(attr)) {
                    const attrVal = node.getAttribute(attr).trim();
                    if (attrVal) {
                        const attrLower = attrVal.toLowerCase();

                        // Skip replacement based on intensity
                        const intensity = this.state.settings.intensity || 60;
                        const skipChance = (100 - intensity) / 100;
                        if (Math.random() < skipChance * 0.5) return;

                        // Skip very short attributes for performance
                        if (attrVal.length < 2) return;

                        // Determine which dictionary categories to check
                        const categories = ['general'];
                        if (this.personality === 'paranoid') {
                            categories.push('youtube_paranoid', 'counts_paranoid');
                        } else if (this.personality === 'evil-corp') {
                            categories.push('youtube_evil_corp', 'counts_evil_corp');
                        } else if (this.personality === 'passive-aggressive') {
                            categories.push('youtube_passive_aggressive', 'counts_passive_aggressive');
                        } else if (this.personality === 'cosmic-horror') {
                            categories.push('youtube', 'counts');
                        }

                        for (let category of categories) {
                            if (!window.DICTIONARY[category]) continue;
                            for (let key in window.DICTIONARY[category]) {
                                if (key.toLowerCase() === attrLower) {
                                    const replacements = window.DICTIONARY[category][key];
                                    const choice = replacements[Math.floor(Math.random() * replacements.length)];
                                    // Store original
                                    if (!node._originalAttrs) node._originalAttrs = {};
                                    if (!node._originalAttrs[attr]) node._originalAttrs[attr] = attrVal;
                                    this.originalNodes.set(node, true); // track node for reversion
                                    node.setAttribute(attr, node.getAttribute(attr).replace(attrVal, choice));
                                    break;
                                }
                            }
                        }
                    }
                }
            });

            if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(node.tagName)) return;
            // Also avoid contenteditable
            if (node.isContentEditable) return;

            // Limit depth to prevent performance issues
            if (node.children.length > 100) {
                // For elements with many children, only process first 50
                for (let i = 0; i < Math.min(50, node.children.length); i++) {
                    this.processNode(node.children[i]);
                }
            } else {
                node.childNodes.forEach(child => this.processNode(child));
            }
        }
    }
    
    revertAll() {
        for (let [node, originalText] of this.originalNodes.entries()) {
            if (node.isConnected) {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = originalText;
                } else if (node.nodeType === Node.ELEMENT_NODE && node._originalAttrs) {
                    for (let attr in node._originalAttrs) {
                        node.setAttribute(attr, node._originalAttrs[attr]);
                    }
                }
            }
        }
        this.originalNodes.clear();
    }
};
