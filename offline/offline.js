// offline.js - Handles offline functionality and storage

// Storage keys
const STORAGE_KEYS = {
    STATIC: 'privacy-analyzer-static',
    ANALYSIS: 'privacy-analyzer-analysis'
};

// Resources to store for offline use
const STATIC_RESOURCES = [
    '/popup/popup.html',
    '/popup/popup.js',
    '/content/privacy-content.js',
    '/background.js'
];

// Storage management
class OfflineManager {
    static async initCache() {
        try {
            await chrome.storage.local.set({
                [STORAGE_KEYS.STATIC]: STATIC_RESOURCES
            });
            console.log('[Offline] Static resources stored');
        } catch (error) {
            console.error('[Offline] Storage initialization failed:', error);
        }
    }

    static async cacheAnalysis(url, analysis) {
        try {
            const key = `${STORAGE_KEYS.ANALYSIS}_${url}`;
            await chrome.storage.local.set({
                [key]: {
                    timestamp: Date.now(),
                    data: analysis
                }
            });
            console.log('[Offline] Analysis stored for:', url);
        } catch (error) {
            console.error('[Offline] Failed to store analysis:', error);
        }
    }

    static async getCachedAnalysis(url) {
        try {
            const key = `${STORAGE_KEYS.ANALYSIS}_${url}`;
            const result = await chrome.storage.local.get(key);
            if (result[key]) {
                console.log('[Offline] Retrieved stored analysis for:', url);
                return result[key].data;
            }
            return null;
        } catch (error) {
            console.error('[Offline] Failed to retrieve stored analysis:', error);
            return null;
        }
    }

    static async clearCache() {
        try {
            await chrome.storage.local.clear();
            console.log('[Offline] Storage cleared');
        } catch (error) {
            console.error('[Offline] Failed to clear storage:', error);
        }
    }

    static isOnline() {
        return navigator.onLine;
    }

    static async handleOfflineRequest(request) {
        try {
            const url = request.url;
            const cachedData = await this.getCachedAnalysis(url);
            if (cachedData) {
                console.log('[Offline] Serving stored response for:', url);
                return {
                    status: 200,
                    data: cachedData
                };
            }
            console.log('[Offline] No stored response for:', url);
            return {
                status: 503,
                error: 'You are offline and this content is not stored.'
            };
        } catch (error) {
            console.error('[Offline] Error handling offline request:', error);
            return {
                status: 500,
                error: 'Failed to handle offline request.'
            };
        }
    }
}

// Export for use in other files
export { OfflineManager, STORAGE_KEYS }; 